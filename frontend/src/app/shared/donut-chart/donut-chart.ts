import { Component, input } from '@angular/core';

@Component({
  selector: 'app-donut-chart',
  template: `
    <div class="chart-container">
      <div class="donut" [style.background]="conicGradient">
        <div class="center-hole">
          <span class="total">{{ total }}</span>
          <span class="label">Total</span>
        </div>
      </div>
      <div class="legend">
        @for (item of data(); track item.label) {
          <div class="legend-item">
            <span class="dot" [style.background-color]="item.color"></span>
            <span class="name">{{ item.label }}</span>
            <span class="value">{{ item.value }}</span>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .chart-container { display: flex; align-items: center; justify-content: center; gap: 40px; height: 100%; }
    .donut { width: 160px; height: 160px; border-radius: 50%; display: grid; place-items: center; position: relative; }
    .center-hole { width: 120px; height: 120px; background: var(--surface-solid); border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .total { font-size: 24px; font-weight: 700; color: var(--text); }
    .label { font-size: 12px; color: var(--text-3); }
    .legend { display: flex; flex-direction: column; gap: 12px; }
    .legend-item { display: flex; align-items: center; gap: 8px; font-size: 13px; }
    .dot { width: 10px; height: 10px; border-radius: 50%; }
    .name { color: var(--text-2); width: 80px; }
    .value { color: var(--text); font-weight: 600; }
  `]
})
export class DonutChart {
  readonly data = input.required<{label: string, value: number, color: string}[]>();
  
  get total() {
    return this.data().reduce((acc, curr) => acc + curr.value, 0);
  }

  get conicGradient() {
    let stops = [];
    let currentPercentage = 0;
    const tot = this.total;
    
    for (const item of this.data()) {
      const percentage = (item.value / tot) * 100;
      stops.push(`${item.color} ${currentPercentage}% ${currentPercentage + percentage}%`);
      currentPercentage += percentage;
    }
    
    return `conic-gradient(${stops.join(', ')})`;
  }
}
