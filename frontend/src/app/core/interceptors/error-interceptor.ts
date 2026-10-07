import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast';

/** Muestra los errores de la API (incluidas violaciones de restricciones de PostgreSQL) como toast. */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 0) {
        toast.error('Sin conexión con la API', 'Verifica que FastAPI esté corriendo en el puerto 8000.');
      } else {
        const detail = err.error?.detail;
        const msg = Array.isArray(detail)
          ? detail.map((d: { msg: string }) => d.msg).join(' · ')
          : (detail ?? err.message);
        toast.error(`Error ${err.status}`, msg);
      }
      return throwError(() => err);
    }),
  );
};
