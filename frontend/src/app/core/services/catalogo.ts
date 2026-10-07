import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api';
import { AsignacionConsultor, Cliente, Consultor, Proyecto, RolConsultor, Tarea } from '../models/models';
import { lastValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CatalogoService {
  private readonly api = inject(ApiService);

  roles = signal<RolConsultor[] | null>(null);
  consultores = signal<Consultor[] | null>(null);
  clientes = signal<Cliente[] | null>(null);
  proyectos = signal<Proyecto[] | null>(null);

  async loadConsultores() {
    try {
      const data = await lastValueFrom(this.api.get<Consultor[]>('/consultores'));
      this.consultores.set(data);
    } catch (e) {}
  }

  async loadClientes() {
    try {
      const data = await lastValueFrom(this.api.get<Cliente[]>('/clientes'));
      this.clientes.set(data);
    } catch (e) {}
  }

  async loadProyectos() {
    try {
      const data = await lastValueFrom(this.api.get<Proyecto[]>('/proyectos'));
      this.proyectos.set(data);
    } catch (e) {}
  }
}
