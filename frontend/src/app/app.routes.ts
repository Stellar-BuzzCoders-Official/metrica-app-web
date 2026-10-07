import { Routes } from '@angular/router';
import { roleGuard } from './core/guards/role-guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'dashboard',
    title: 'Dashboard · Métrica Andina',
    data: { titulo: 'Dashboard', roles: ['PM', 'FINANZAS', 'ADMIN'] },
    canActivate: [roleGuard],
    loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'timesheet',
    title: 'Mis horas · Métrica Andina',
    data: { titulo: 'Registro de horas', roles: ['CONSULTOR', 'ADMIN'] },
    canActivate: [roleGuard],
    loadComponent: () => import('./pages/timesheet/timesheet').then((m) => m.Timesheet),
  },
  {
    path: 'aprobaciones',
    title: 'Aprobaciones · Métrica Andina',
    data: { titulo: 'Aprobación de horas', roles: ['PM', 'ADMIN'] },
    canActivate: [roleGuard],
    loadComponent: () => import('./pages/aprobaciones/aprobaciones').then((m) => m.Aprobaciones),
  },
  {
    path: 'asignaciones',
    title: 'Asignaciones · Métrica Andina',
    data: { titulo: 'Asignaciones', roles: ['PM', 'ADMIN'] },
    canActivate: [roleGuard],
    loadComponent: () => import('./pages/asignaciones/asignaciones').then((m) => m.Asignaciones),
  },
  {
    path: 'facturacion',
    title: 'Facturación · Métrica Andina',
    data: { titulo: 'Facturación', roles: ['FINANZAS', 'ADMIN'] },
    canActivate: [roleGuard],
    loadComponent: () => import('./pages/facturacion/facturacion').then((m) => m.Facturacion),
  },
  {
    path: 'catalogos',
    title: 'Catálogos · Métrica Andina',
    data: { titulo: 'Catálogos', roles: ['PM', 'ADMIN'] },
    canActivate: [roleGuard],
    loadComponent: () => import('./pages/catalogos/catalogos').then((m) => m.Catalogos),
  },
  { path: '**', redirectTo: 'dashboard' },
];
