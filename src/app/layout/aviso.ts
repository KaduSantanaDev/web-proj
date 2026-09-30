import { NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AvisoService } from '../nucleo/aviso.service';

@Component({
  selector: 'app-aviso',
  imports: [NgIf, RouterLink],
  template: `
    <div class="aviso" role="status" aria-live="polite">
      <div *ngIf="avisos.atual() as aviso" class="aviso__caixa">
        <p>{{ aviso.texto }}</p>
        <a
          *ngIf="aviso.acao as acao"
          class="aviso__acao"
          [routerLink]="acao.rota"
          (click)="avisos.fechar()"
          >{{ acao.rotulo }}</a
        >
        <button
          type="button"
          class="aviso__fechar"
          (click)="avisos.fechar()"
          aria-label="Dispensar aviso"
        >
          ×
        </button>
      </div>
    </div>
  `,
  styles: `
    .aviso {
      position: fixed;
      inset: auto 0 16px 0;
      z-index: 20;
      display: flex;
      justify-content: center;
      padding-inline: 16px;
      pointer-events: none;
    }
    .aviso__caixa {
      display: flex;
      align-items: center;
      gap: 0.5rem 1rem;
      max-width: 34rem;
      padding: 0.7rem 0.7rem 0.7rem 1.1rem;
      border: 2px solid var(--azul);
      border-radius: var(--raio-m);
      background: var(--manteiga);
      color: var(--azul);
      font-weight: 600;
      box-shadow: 0 4px 0 var(--azul);
      pointer-events: auto;
      animation: subir 0.22s ease-out;
    }
    .aviso__acao {
      flex: none;
      padding: 0.35rem 0.8rem;
      border: 2px solid var(--azul);
      border-radius: 999px;
      background: #fff;
      color: var(--azul);
      font-weight: 800;
      text-decoration: none;
    }
    .aviso__fechar {
      flex: none;
      width: 36px;
      height: 36px;
      border: 0;
      border-radius: 50%;
      background: transparent;
      color: var(--azul);
      font-size: 1.5rem;
      line-height: 1;
      cursor: pointer;
    }
    .aviso__fechar:hover {
      background: #ffffff80;
    }
    @keyframes subir {
      from {
        opacity: 0;
        transform: translateY(12px);
      }
    }
  `,
})
export class AvisoToast {
  protected readonly avisos = inject(AvisoService);
}
