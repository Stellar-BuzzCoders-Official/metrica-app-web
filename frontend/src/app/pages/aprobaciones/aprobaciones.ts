import { Component, inject, OnInit } from '@angular/core';
import { TimesheetService } from '../../core/services/timesheet';
import { StatusBadge } from '../../shared/status-badge/status-badge';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-aprobaciones',
  imports: [StatusBadge, DatePipe],
  templateUrl: './aprobaciones.html',
  styleUrl: './aprobaciones.css'
})
export class Aprobaciones implements OnInit {
  protected readonly ts = inject(TimesheetService);
  
  // ID del Project Manager (mock para el prototipo)
  readonly pmId = 2;

  ngOnInit() {
    this.ts.loadPendientes(this.pmId);
  }

  async aprobar(id_timesheet: number) {
    const success = await this.ts.aprobarHoras(id_timesheet, this.pmId);
    if (success) {
      // Recargar pendientes
      this.ts.loadPendientes(this.pmId);
    }
  }

  // TODO: Agregar método rechazar si existiera en la bd, por ahora solo aprobar según requerimiento
}
