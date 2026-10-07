import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AsignacionService } from '../../core/services/asignacion';
import { CatalogoService } from '../../core/services/catalogo';
import { StatusBadge } from '../../shared/status-badge/status-badge';
import { Icon } from '../../shared/icon/icon';
import { DatePipe, CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-asignaciones',
  imports: [ReactiveFormsModule, StatusBadge, Icon, DatePipe, CurrencyPipe],
  templateUrl: './asignaciones.html',
  styleUrl: './asignaciones.css'
})
export class Asignaciones implements OnInit {
  protected readonly asig = inject(AsignacionService);
  protected readonly cat = inject(CatalogoService);
  private readonly fb = inject(FormBuilder);

  isSubmitting = signal(false);
  isChangingTarifa = signal(false);

  form = this.fb.nonNullable.group({
    consultor_id: [0, [Validators.required, Validators.min(1)]],
    proyecto_id: [0, [Validators.required, Validators.min(1)]],
    rol_proyecto: ['', Validators.required],
    tarifa_hora: [0, [Validators.required, Validators.min(1)]],
    fecha_inicio: [new Date().toISOString().split('T')[0], Validators.required]
  });

  tarifaForm = this.fb.nonNullable.group({
    id_asignacion: [0],
    nueva_tarifa: [0, [Validators.required, Validators.min(1)]]
  });

  selectedAsignacion = signal<any>(null);

  ngOnInit() {
    this.asig.loadAsignaciones();
    if (!this.cat.consultores()) this.cat.loadConsultores();
    if (!this.cat.proyectos()) this.cat.loadProyectos();
  }

  async onSubmit() {
    if (this.form.invalid) return;
    this.isSubmitting.set(true);
    
    const val = this.form.getRawValue();
    const success = await this.asig.crearAsignacion(val);

    if (success) {
      this.form.reset({
        consultor_id: 0,
        proyecto_id: 0,
        rol_proyecto: '',
        tarifa_hora: 0,
        fecha_inicio: new Date().toISOString().split('T')[0]
      });
      this.asig.loadAsignaciones();
    }
    
    this.isSubmitting.set(false);
  }

  openChangeTarifa(a: any) {
    this.selectedAsignacion.set(a);
    this.tarifaForm.setValue({
      id_asignacion: a.id_asignacion,
      nueva_tarifa: a.tarifa_hora
    });
  }

  cancelChangeTarifa() {
    this.selectedAsignacion.set(null);
  }

  async onChangeTarifaSubmit() {
    if (this.tarifaForm.invalid) return;
    this.isChangingTarifa.set(true);
    
    const val = this.tarifaForm.getRawValue();
    const success = await this.asig.cambiarTarifa(val.id_asignacion, val.nueva_tarifa);

    if (success) {
      this.selectedAsignacion.set(null);
      this.asig.loadAsignaciones();
    }
    
    this.isChangingTarifa.set(false);
  }
}
