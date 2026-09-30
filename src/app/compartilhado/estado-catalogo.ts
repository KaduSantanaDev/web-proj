import { NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { Component, inject } from '@angular/core';
import { CatalogoService } from '../nucleo/catalogo.service';

@Component({
  selector: 'app-estado-catalogo',
  imports: [NgSwitch, NgSwitchCase, NgSwitchDefault],
  template: `
    <ng-container [ngSwitch]="catalogo.estado()">
      <p *ngSwitchCase="'carregando'" class="estado" role="status">Tirando a fornada do forno…</p>
      <div *ngSwitchCase="'erro'" class="estado estado--erro" role="alert">
        <p>Não foi possível carregar os produtos. Confira sua conexão e tente de novo.</p>
        <button type="button" class="btn btn--primario" (click)="catalogo.carregar()">
          Tentar de novo
        </button>
      </div>
      <ng-container *ngSwitchDefault>
        <ng-content />
      </ng-container>
    </ng-container>
  `,
  styles: `
    .estado {
      display: grid;
      justify-items: start;
      gap: 1rem;
      padding: 2rem 0;
      color: var(--cacau-suave);
    }
    .estado--erro {
      color: var(--erro);
      font-weight: 600;
    }
  `,
})
export class EstadoCatalogo {
  protected readonly catalogo = inject(CatalogoService);
}
