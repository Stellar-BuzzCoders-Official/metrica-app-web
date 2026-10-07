import { Component, input } from '@angular/core';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-kpi-card',
  imports: [Icon],
  template: `
    <div class="kpi-card">
      <div class="header">
        <h3 class="title">{{ title() }}</h3>
        <div class="icon-wrap" [class]="color()">
          <app-icon [name]="icon()" [size]="20"></app-icon>
        </div>
      </div>
      <div class="value-row">
        <div class="value">{{ value() }}</div>
        @if (trend()) {
          <div class="trend" [class.up]="trend()! > 0" [class.down]="trend()! < 0">
            <app-icon [name]="trend()! > 0 ? 'arrow-up' : 'arrow-down'" [size]="14"></app-icon>
            {{ Math.abs(trend()!) }}%
          </div>
        }
      </div>
      @if (subtitle()) {
        <div class="subtitle">{{ subtitle() }}</div>
      }
    </div>
  `,
  styles: [`
    .kpi-card {
      background: var(--surface-solid);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      transition: all 0.3s ease;
    }
    .kpi-card:hover {
      border-color: var(--border-hover);
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .title {
      font-size: 13.5px;
      font-weight: 500;
      color: var(--text-2);
      margin: 0;
    }
    .icon-wrap {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      display: grid;
      place-items: center;
      background: var(--surface-2);
    }
    .icon-wrap.primary { background: var(--primary-soft); color: var(--primary); }
    .icon-wrap.success { background: var(--success-soft); color: var(--success); }
    .icon-wrap.warning { background: var(--warning-soft); color: var(--warning); }
    
    .value-row {
      display: flex;
      align-items: baseline;
      gap: 12px;
    }
    .value {
      font-size: 32px;
      font-weight: 700;
      color: var(--text);
      letter-spacing: -0.02em;
    }
    .trend {
      display: flex;
      align-items: center;
      gap: 2px;
      font-size: 13px;
      font-weight: 600;
      padding: 4px 8px;
      border-radius: 20px;
    }
    .trend.up { background: var(--success-soft); color: var(--success); }
    .trend.down { background: var(--danger-soft); color: var(--danger); }
    
    .subtitle {
      font-size: 13px;
      color: var(--text-3);
    }
  `]
})
export class KpiCard {
  readonly title = input.required<string>();
  readonly value = input.required<string | number>();
  readonly icon = input.required<string>();
  readonly color = input<'primary' | 'success' | 'warning' | 'default'>('default');
  readonly trend = input<number>();
  readonly subtitle = input<string>();

  protected readonly Math = Math;
}
