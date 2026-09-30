import { CurrencyPipe, NgIf, NgStyle } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AvisoService } from '../nucleo/aviso.service';
import { CarrinhoService, LIMITE_POR_ITEM } from '../nucleo/carrinho.service';
import { Produto } from '../nucleo/modelos';
import { estiloDoSelo } from '../nucleo/selos';

@Component({
  selector: 'app-card-produto',
  imports: [CurrencyPipe, NgIf, NgStyle, RouterLink],
  templateUrl: './card-produto.html',
  styleUrl: './card-produto.css',
})
export class CardProduto {
  readonly produto = input.required<Produto>();

  readonly prioritario = input(false);
  protected readonly estiloDoSelo = estiloDoSelo;
  private readonly carrinho = inject(CarrinhoService);
  private readonly aviso = inject(AvisoService);

  protected comprar(): void {
    const { id, nome } = this.produto();
    const entraram = this.carrinho.adicionar(id);
    this.aviso.mostrar(
      entraram > 0
        ? { texto: `${nome} entrou na cesta.`, acao: { rotulo: 'Ver cesta', rota: '/cesta' } }
        : {
            texto: `Você já tem ${LIMITE_POR_ITEM} unidades de ${nome} na cesta, o máximo por produto.`,
          },
    );
  }
}
