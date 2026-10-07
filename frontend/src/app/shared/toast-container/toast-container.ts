import { Component, inject } from '@angular/core';
import { ToastService } from '../../core/services/toast';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-toast-container',
  imports: [Icon],
  templateUrl: './toast-container.html',
  styleUrl: './toast-container.css'
})
export class ToastContainer {
  protected readonly toast = inject(ToastService);

  getIcon(tipo: string): string {
    return tipo === 'success' ? 'check-circle' : tipo === 'error' ? 'alert' : 'info';
  }
}
