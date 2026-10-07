import { Injectable, signal } from '@angular/core';

export type ToastTipo = 'success' | 'error' | 'info';

export interface ToastMsg {
  id: number;
  tipo: ToastTipo;
  titulo: string;
  detalle?: string;
}

/** Notificaciones efímeras (auto-cierre a los 4.5 s). */
@Injectable({
  providedIn: 'root',
})
export class ToastService {
  readonly items = signal<ToastMsg[]>([]);
  private seq = 0;

  success(titulo: string, detalle?: string) {
    this.push('success', titulo, detalle);
  }

  error(titulo: string, detalle?: string) {
    this.push('error', titulo, detalle);
  }

  info(titulo: string, detalle?: string) {
    this.push('info', titulo, detalle);
  }

  dismiss(id: number) {
    this.items.update((list) => list.filter((t) => t.id !== id));
  }

  private push(tipo: ToastTipo, titulo: string, detalle?: string) {
    const id = ++this.seq;
    this.items.update((list) => [...list, { id, tipo, titulo, detalle }].slice(-4));
    setTimeout(() => this.dismiss(id), tipo === 'error' ? 6500 : 4500);
  }
}
