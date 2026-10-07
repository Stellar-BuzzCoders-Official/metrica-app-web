import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api';
import { lastValueFrom } from 'rxjs';
import { ToastService } from './toast';

@Injectable({ providedIn: 'root' })
export class FacturacionService {
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);

  preview = signal<any | null>(null);
  loading = signal(false);

  clearPreview() {
    this.preview.set(null);
  }

  async loadPreview(proyecto_id: number, mes: number, anio: number) {
    this.loading.set(true);
    try {
      const data = await lastValueFrom(this.api.get<any>(`/facturacion/preview`, { proyecto_id, mes, anio }));
      this.preview.set(data);
    } catch (e: any) {
      this.toast.error('Error', 'No se pudo calcular la vista previa');
      this.preview.set(null);
    } finally {
      this.loading.set(false);
    }
  }

  async generarFactura(body: { proyecto_id: number; mes: number; anio: number }): Promise<boolean> {
    try {
      await lastValueFrom(this.api.post<any>('/facturacion/generar', body));
      this.toast.success('Éxito', 'Factura generada exitosamente');
      return true;
    } catch (e: any) {
      this.toast.error('Error', 'Error al generar la factura. Verifica si ya existe.');
      return false;
    }
  }
}
