import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ROLES, SessionService } from '../../core/services/session';
import { Icon } from '../../shared/icon/icon';
import { RolUsuario } from '../../core/models/models';

@Component({
  selector: 'app-topbar',
  imports: [FormsModule, Icon],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css'
})
export class Topbar {
  protected readonly session = inject(SessionService);
  protected readonly router = inject(Router);
  protected readonly roles = ROLES;

  cambiarRol(rol: RolUsuario) {
    this.session.rol.set(rol);
    // Redirigir al home del nuevo rol si la ruta actual no es permitida
    if (!this.session.puedeVer(this.router.url)) {
      this.router.navigateByUrl(this.session.homePath());
    }
  }
}
