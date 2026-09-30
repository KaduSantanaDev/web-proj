import { NgFor } from '@angular/common';
import { Component, input } from '@angular/core';
import { Produto } from '../nucleo/modelos';
import { CardProduto } from './card-produto';

@Component({
  selector: 'app-grade-produtos',
  imports: [CardProduto, NgFor],
  template: `
    <ul class="grade">
      <li *ngFor="let p of produtos(); trackBy: porId; let i = index">
        <app-card-produto [produto]="p" [prioritario]="i < 8" />
      </li>
    </ul>
  `,
  styles: `
    .grade {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    @media (min-width: 480px) {
      .grade {
        gap: 18px;
      }
    }
    @media (min-width: 760px) {
      .grade {
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 24px;
      }
    }
    @media (min-width: 1040px) {
      .grade {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }
    }
  `,
})
export class GradeProdutos {
  readonly produtos = input.required<Produto[]>();
  protected readonly porId = (_: number, produto: Produto) => produto.id;
}
