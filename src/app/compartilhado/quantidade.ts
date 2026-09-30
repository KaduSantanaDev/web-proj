import { Component, input, model } from '@angular/core';
import { LIMITE_POR_ITEM } from '../nucleo/carrinho.service';

@Component({
  selector: 'app-quantidade',
  template: `
    <div class="quantidade" role="group" [attr.aria-label]="'Quantidade de ' + nome()">
      <button
        type="button"
        (click)="valor.set(valor() - 1)"
        [disabled]="valor() <= 1"
        aria-label="Diminuir quantidade"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path d="M5 12h14" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" />
        </svg>
      </button>
      <output class="quantidade__valor" aria-live="polite">{{ valor() }}</output>
      <button
        type="button"
        (click)="valor.set(valor() + 1)"
        [disabled]="valor() >= limite"
        aria-label="Aumentar quantidade"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path
            d="M12 5v14M5 12h14"
            stroke="currentColor"
            stroke-width="2.8"
            stroke-linecap="round"
          />
        </svg>
      </button>
    </div>
  `,
  styles: `
    .quantidade {
      display: inline-flex;
      align-items: center;
      border: 2px solid var(--azul);
      border-radius: 999px;
      background: #fff;
    }
    button {
      display: grid;
      place-items: center;
      width: 42px;
      height: 42px;
      border: 0;
      border-radius: 50%;
      background: transparent;
      color: var(--azul);
      cursor: pointer;
    }
    button:hover:not(:disabled) {
      background: var(--manteiga);
    }
    button:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }
    .quantidade__valor {
      min-width: 2.2ch;
      text-align: center;
      font-weight: 800;
      font-variant-numeric: tabular-nums;
      color: var(--azul);
    }
  `,
})
export class Quantidade {
  readonly valor = model.required<number>();
  readonly nome = input('produto');
  protected readonly limite = LIMITE_POR_ITEM;
}
