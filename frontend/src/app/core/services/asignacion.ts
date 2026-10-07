import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api';
import { lastValueFrom } from 'rxjs';
import { ToastService } from './toast';

@Injectable({ providedIn: 'root' })
export class AsignacionService {
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);

  asignaciones = signal<any[] | null>(null);
  loading = signal(false);

  async loadAsignaciones() {
    this.loading.set(true);
    try {
      const data = await lastValueFrom(this.api.get<any[]>('/asignaciones'));
      this.asignaciones.set(data);
    } catch (e: any) {
      this.toast.error('Error', e.message);
    } finally {
      this.loading.set(false);
    }
  }

  async crearAsignacion(body: any): Promise<boolean> {
    try {
      const payload = {
        id_proyecto: body.proyecto_id,
        id_consultor: body.consultor_id,
        fecha_inicio: body.fecha_inicio,
        tarifa_hora_pactada: body.tarifa_hora
      };
      await lastValueFrom(this.api.post<any>('/asignaciones', payload));
      this.toast.success('Éxito', 'Asignación creada');
      return true;
    } catch (e: any) {
      this.toast.error('Error', 'No se pudo crear la asignación');
      return false;
    }
  }

  async cambiarTarifa(id: number, nueva_tarifa: number): Promise<boolean> {
    try {
      await lastValueFrom(this.api.patch<any>(`/asignaciones/${id}/tarifa`, { tarifa_hora_pactada: nueva_tarifa }));
      this.toast.success('Éxito', 'Tarifa actualizada correctamente');
      return true;
    } catch (e: any) {
      this.toast.error('Error', 'No se pudo actualizar la tarifa');
      return false;
    }
  }
}
