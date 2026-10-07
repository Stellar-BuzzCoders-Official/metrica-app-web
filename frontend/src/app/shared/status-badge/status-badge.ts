import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  imports: [],
  template: `<span class="badge" [class]="colorClass()">{{ status() }}</span>`,
  styles: [`
    .badge {
      display: inline-flex;
      align-items: center;
      height: 24px;
      padding: 0 10px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      white-space: nowrap;
    }
    .badge.success { background: var(--success-soft); color: var(--success); }
    .badge.warning { background: var(--warning-soft); color: var(--warning); }
    .badge.danger { background: var(--danger-soft); color: var(--danger); }
    .badge.info { background: var(--primary-soft); color: var(--primary); }
    .badge.neutral { background: var(--surface-2); color: var(--text-2); }
  `]
})
export class StatusBadge {
  readonly status = input.required<string>();
  
  protected readonly colorClass = computed(() => {
    const s = (this.status() || '').toUpperCase();
    if (['APROBADO', 'VIGENTE', 'PAGADA', 'ACTIVO'].includes(s)) return 'success';
    if (['PENDIENTE', 'EN EJECUCION', 'EMITIDA'].includes(s)) return 'warning';
    if (['OBSERVADO', 'SUSPENDIDA', 'ANULADA'].includes(s)) return 'danger';
    if (['FINALIZADA'].includes(s)) return 'info';
    return 'neutral';
  });
}
