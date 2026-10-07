import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FacturacionService } from '../../core/services/facturacion';
import { CatalogoService } from '../../core/services/catalogo';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-facturacion',
  imports: [ReactiveFormsModule, CurrencyPipe],
  templateUrl: './facturacion.html',
  styleUrl: './facturacion.css'
})
export class Facturacion implements OnInit {
  protected readonly fac = inject(FacturacionService);
  protected readonly cat = inject(CatalogoService);
  private readonly fb = inject(FormBuilder);

  readonly meses = [
    { value: 1, label: 'Enero' }, { value: 2, label: 'Febrero' }, { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' }, { value: 5, label: 'Mayo' }, { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' }, { value: 8, label: 'Agosto' }, { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' }, { value: 11, label: 'Noviembre' }, { value: 12, label: 'Diciembre' }
  ];

  form = this.fb.nonNullable.group({
    proyecto_id: [0, [Validators.required, Validators.min(1)]],
    mes: [new Date().getMonth() + 1, Validators.required],
    anio: [new Date().getFullYear(), [Validators.required, Validators.min(2020)]]
  });

  isGenerando = signal(false);

  ngOnInit() {
    if (!this.cat.proyectos()) {
      this.cat.loadProyectos();
    }
  }

  async verPreview() {
    if (this.form.invalid) return;
    const val = this.form.getRawValue();
    await this.fac.loadPreview(val.proyecto_id, val.mes, val.anio);
  }

  async generarFactura() {
    if (this.form.invalid) return;
    this.isGenerando.set(true);
    const val = this.form.getRawValue();
    const success = await this.fac.generarFactura({
      proyecto_id: val.proyecto_id,
      mes: val.mes,
      anio: val.anio
    });

    if (success) {
      // Recargar preview para ver que se ha facturado y ahora está en cero
      await this.verPreview();
    }
    this.isGenerando.set(false);
  }
}
