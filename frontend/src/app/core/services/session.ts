import { Injectable, computed, effect, signal } from '@angular/core';
import { RolUsuario } from '../models/models';

export interface NavItem {
  path: string;
  label: string;
  icon: string;
  roles: RolUsuario[];
}

export interface RolInfo {
  id: RolUsuario;
  label: string;
  descripcion: string;
  dbRole: string;
}

/** Menú de la aplicación; cada ruta declara qué roles (RBAC del documento) pueden verla. */
export const NAV_ITEMS: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: 'grid', roles: ['PM', 'FINANZAS', 'ADMIN'] },
  { path: '/timesheet', label: 'Mis horas', icon: 'clock', roles: ['CONSULTOR', 'ADMIN'] },
  { path: '/aprobaciones', label: 'Aprobaciones', icon: 'check-circle', roles: ['PM', 'ADMIN'] },
  { path: '/asignaciones', label: 'Asignaciones', icon: 'users', roles: ['PM', 'ADMIN'] },
  { path: '/facturacion', label: 'Facturación', icon: 'receipt', roles: ['FINANZAS', 'ADMIN'] },
  { path: '/catalogos', label: 'Catálogos', icon: 'database', roles: ['PM', 'ADMIN'] },
];

export const ROLES: RolInfo[] = [
  { id: 'CONSULTOR', label: 'Consultor Técnico', descripcion: 'Registra sus horas', dbRole: 'consultor_metrica' },
  { id: 'PM', label: 'Project Manager', descripcion: 'Asigna y aprueba', dbRole: 'pm_metrica' },
  { id: 'FINANZAS', label: 'Finanzas', descripcion: 'Factura y cobra', dbRole: 'finanzas' },
  { id: 'ADMIN', label: 'Administrador', descripcion: 'Acceso total', dbRole: 'admin_metrica' },
];

const STORAGE_KEY = 'metrica.session';

/** Sesión simulada para la demo: rol activo y consultor "logueado". */
@Injectable({
  providedIn: 'root',
})
export class SessionService {
  readonly rol = signal<RolUsuario>('ADMIN');
  readonly consultorId = signal<number | null>(null);

  readonly rolInfo = computed(() => ROLES.find((r) => r.id === this.rol())!);
  readonly menu = computed(() => NAV_ITEMS.filter((i) => i.roles.includes(this.rol())));
  readonly homePath = computed(() => this.menu()[0]?.path ?? '/dashboard');

  constructor() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
      if (saved?.rol) this.rol.set(saved.rol);
      if (saved?.consultorId) this.consultorId.set(saved.consultorId);
    } catch {
      /* sesión corrupta: se ignoran los valores guardados */
    }
    effect(() => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ rol: this.rol(), consultorId: this.consultorId() }),
      );
    });
  }

  puedeVer(path: string): boolean {
    return this.menu().some((i) => path.startsWith(i.path));
  }
}
