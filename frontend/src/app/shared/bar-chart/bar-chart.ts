import { Component, input } from '@angular/core';

@Component({
  selector: 'app-bar-chart',
  template: `
    <div class="chart-container">
      <div class="bars">
        @for (item of data(); track item.label) {
          <div class="bar-group">
            <div class="bar-wrap">
              <div class="bar" [style.height.%]="(item.value / max()) * 100" [style.background-color]="color()">
                <div class="tooltip">{{ item.value }}</div>
              </div>
            </div>
            <div class="label">{{ item.label }}</div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .chart-container { height: 100%; display: flex; flex-direction: column; justify-content: flex-end; }
    .bars { display: flex; justify-content: space-between; align-items: flex-end; height: calc(100% - 24px); gap: 16px; }
    .bar-group { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px; height: 100%; }
    .bar-wrap { flex: 1; width: 100%; display: flex; align-items: flex-end; background: var(--surface-2); border-radius: 6px 6px 0 0; position: relative; }
    .bar { width: 100%; border-radius: 6px 6px 0 0; transition: height 0.5s ease; position: relative; }
    .bar:hover .tooltip { opacity: 1; transform: translateY(-10px); }
    .tooltip { position: absolute; top: -30px; left: 50%; transform: translateX(-50%); background: var(--text); color: var(--surface-solid); padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; opacity: 0; pointer-events: none; transition: all 0.2s; white-space: nowrap; }
    .label { font-size: 11px; color: var(--text-3); text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
  `]
})
export class BarChart {
  readonly data = input.required<{label: string, value: number}[]>();
  readonly max = input.required<number>();
  readonly color = input<string>('var(--primary)');
}
