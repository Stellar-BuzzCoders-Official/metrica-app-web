import { Component, inject, OnInit } from '@angular/core';
import { DashboardService } from '../../core/services/dashboard';
import { KpiCard } from '../../shared/kpi-card/kpi-card';
import { BarChart } from '../../shared/bar-chart/bar-chart';
import { DonutChart } from '../../shared/donut-chart/donut-chart';
import { StatusBadge } from '../../shared/status-badge/status-badge';

@Component({
  selector: 'app-dashboard',
  imports: [KpiCard, BarChart, DonutChart, StatusBadge],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  protected readonly dashboardService = inject(DashboardService);
  
  ngOnInit() {
    this.dashboardService.loadDashboard();
  }

  get rentabilidadData() {
    return this.dashboardService.kpis()?.rentabilidad_proyectos.map((p: any) => ({
      label: p.nombre_proyecto,
      value: p.presupuesto_horas > 0 ? Math.round((p.horas_aprobadas / p.presupuesto_horas) * 100) : 0
    })) || [];
  }

  get horasData() {
    const data = this.dashboardService.kpis()?.estado_horas || [];
    const colors: Record<string, string> = {
      'PENDIENTE': 'var(--warning)',
      'APROBADO': 'var(--success)',
      'RECHAZADO': 'var(--danger)',
      'FACTURADO': 'var(--primary)'
    };
    return data.map((d: any) => ({
      label: d.estado,
      value: Number(d.horas),
      color: colors[d.estado] || 'var(--surface-2)'
    }));
  }
}
