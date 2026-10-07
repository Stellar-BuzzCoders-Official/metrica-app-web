import { Component, inject, OnInit } from '@angular/core';
import { CatalogoService } from '../../core/services/catalogo';

@Component({
  selector: 'app-catalogos',
  templateUrl: './catalogos.html',
  styleUrl: './catalogos.css'
})
export class Catalogos implements OnInit {
  protected readonly cat = inject(CatalogoService);

  ngOnInit() {
    this.cat.loadConsultores();
    this.cat.loadClientes();
    this.cat.loadProyectos();
  }
}
