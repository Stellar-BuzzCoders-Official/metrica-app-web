import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api';
import { EstadoAprobacion, RegistroHoras } from '../models/models';
import { lastValueFrom } from 'rxjs';
import { ToastService } from './toast';

export interface NuevoRegistro {
  consultor_id: number;
  proyecto_id: number;
  fecha_registro: string;
  horas_trabajadas: number;
  descripcion_actividad: string;
}

@Injectable({ providedIn: 'root' })
export class TimesheetService {
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);

  misHoras = signal<any[] | null>(null);
  pendientes = signal<any[] | null>(null);
  loading = signal(false);

  async loadMisHoras(id_consultor: number) {
    this.loading.set(true);
    try {
      const data = await lastValueFrom(this.api.get<any[]>('/registros', { id_consultor }));
      this.misHoras.set(data);
    } catch (e: any) {
      this.toast.error('Error', e.message);
    } finally {
      this.loading.set(false);
    }
  }

  async registrarHoras(body: NuevoRegistro): Promise<boolean> {
    try {
      await lastValueFrom(this.api.post<any>('/registros/ui', body));
      this.toast.success('Éxito', 'Horas registradas correctamente');
      await this.loadMisHoras(body.consultor_id);
      return true;
    } catch (e: any) {
      this.toast.error('Error', 'No se pudieron registrar las horas');
      return false;
    }
  }

  async loadPendientes(id_pm: number) {
    this.loading.set(true);
    try {
      const data = await lastValueFrom(this.api.get<any[]>('/registros', { estado: 'PENDIENTE' }));
      this.pendientes.set(data);
    } catch (e: any) {
      this.toast.error('Error', e.message);
    } finally {
      this.loading.set(false);
    }
  }

  async aprobarHoras(id_timesheet: number, id_pm: number): Promise<boolean> {
    try {
      await lastValueFrom(this.api.put<any>(`/registros/${id_timesheet}/aprobar`, { aprobador_id: id_pm }));
      this.toast.success('Aprobado', 'Las horas fueron aprobadas exitosamente');
      return true;
    } catch (e: any) {
      this.toast.error('Error', 'No se pudo aprobar el registro');
      return false;
    }
  }
}
