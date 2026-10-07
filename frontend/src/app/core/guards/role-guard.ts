import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { RolUsuario } from '../models/models';
import { SessionService } from '../services/session';

/** Restringe rutas según el rol simulado (data.roles). Redirige al inicio del rol si no tiene acceso. */
export const roleGuard: CanActivateFn = (route) => {
  const session = inject(SessionService);
  const router = inject(Router);
  const roles = (route.data?.['roles'] as RolUsuario[] | undefined) ?? [];
  if (roles.length === 0 || roles.includes(session.rol())) return true;
  return router.parseUrl(session.homePath());
};
