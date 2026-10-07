import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TimesheetService } from '../../core/services/timesheet';
import { CatalogoService } from '../../core/services/catalogo';
import { StatusBadge } from '../../shared/status-badge/status-badge';
import { Icon } from '../../shared/icon/icon';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-timesheet',
  imports: [ReactiveFormsModule, StatusBadge, Icon, DatePipe],
  templateUrl: './timesheet.html',
  styleUrl: './timesheet.css'
})
export class Timesheet implements OnInit {
  protected readonly ts = inject(TimesheetService);
  protected readonly cat = inject(CatalogoService);
  private readonly fb = inject(FormBuilder);

  readonly consultorId = 1;

  form = this.fb.nonNullable.group({
    proyecto_id: [0, [Validators.required, Validators.min(1)]],
    fecha_registro: [new Date().toISOString().split('T')[0], Validators.required],
    horas_trabajadas: [8, [Validators.required, Validators.min(0.5), Validators.max(24)]],
    descripcion_actividad: ['', Validators.required]
  });

  isSubmitting = signal(false);

  ngOnInit() {
    this.ts.loadMisHoras(this.consultorId);
    if (!this.cat.proyectos()) {
      this.cat.loadProyectos();
    }
  }

  async onSubmit() {
    if (this.form.invalid) return;
    this.isSubmitting.set(true);
    
    const val = this.form.getRawValue();
    const success = await this.ts.registrarHoras({
      consultor_id: this.consultorId,
      proyecto_id: val.proyecto_id,
      fecha_registro: val.fecha_registro,
      horas_trabajadas: val.horas_trabajadas,
      descripcion_actividad: val.descripcion_actividad
    });

    if (success) {
      this.form.reset({
        proyecto_id: val.proyecto_id,
        fecha_registro: new Date().toISOString().split('T')[0],
        horas_trabajadas: 8,
        descripcion_actividad: ''
      });
    }
    
    this.isSubmitting.set(false);
  }
}
