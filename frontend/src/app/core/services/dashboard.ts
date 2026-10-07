import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api';
import { lastValueFrom } from 'rxjs';
import { ToastService } from './toast';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);

  kpis = signal<any>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  async loadDashboard() {
    this.loading.set(true);
    this.error.set(null);
    try {
      const [resumen, ocupacion_consultores, rentabilidad_proyectos, estado_horas] = await Promise.all([
        lastValueFrom(this.api.get<any>('/dashboard/kpis')),
        lastValueFrom(this.api.get<any>('/dashboard/ocupacion')),
        lastValueFrom(this.api.get<any>('/dashboard/prefacturacion')),
        lastValueFrom(this.api.get<any>('/dashboard/horas-por-estado'))
      ]);
      this.kpis.set({
        resumen,
        ocupacion_consultores,
        rentabilidad_proyectos,
        estado_horas
      });
    } catch (e: any) {
      this.error.set(e.message);
      this.toast.error('Error', 'No se pudieron cargar los KPIs');
    } finally {
      this.loading.set(false);
    }
  }
}
