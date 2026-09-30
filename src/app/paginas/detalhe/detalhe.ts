import { CurrencyPipe, NgIf, NgStyle } from '@angular/common';
import { Component, computed, effect, inject, input, linkedSignal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';
import { EstadoCatalogo } from '../../compartilhado/estado-catalogo';
import { Quantidade } from '../../compartilhado/quantidade';
import { AvisoService } from '../../nucleo/aviso.service';
import { CarrinhoService, LIMITE_POR_ITEM } from '../../nucleo/carrinho.service';
import { CatalogoService } from '../../nucleo/catalogo.service';
import { estiloDoSelo } from '../../nucleo/selos';

@Component({
  selector: 'app-detalhe',
  imports: [CurrencyPipe, NgIf, NgStyle, RouterLink, EstadoCatalogo, Quantidade],
  templateUrl: './detalhe.html',
  styleUrl: './detalhe.css',
})
export class Detalhe {
  readonly id = input.required<string>();

  protected readonly estiloDoSelo = estiloDoSelo;
  private readonly catalogo = inject(CatalogoService);
  private readonly carrinho = inject(CarrinhoService);
  private readonly aviso = inject(AvisoService);
  private readonly router = inject(Router);
  private readonly tituloDaPagina = inject(Title);

  protected readonly produto = computed(() => this.catalogo.produto(Number(this.id())));
  protected readonly categoria = computed(() =>
    this.catalogo.nomeDaCategoria(this.produto()?.categoria ?? ''),
  );

  protected readonly qtd = linkedSignal({ source: this.id, computation: () => 1 });

  constructor() {
    effect(() => {
      if (this.catalogo.estado() !== 'pronto') return;
      const p = this.produto();
      this.tituloDaPagina.setTitle(p ? `${p.nome} · Migalha` : 'Produto não encontrado · Migalha');
    });
  }

  protected comprar(): void {
    const produto = this.produto();
    if (!produto) return;
    const pedidas = this.qtd();
    const entraram = this.carrinho.adicionar(produto.id, pedidas);
    if (entraram < pedidas) {
      this.aviso.mostrar({
        texto: `O máximo é ${LIMITE_POR_ITEM} unidades de cada produto na cesta.`,
      });
    }
    if (entraram > 0) this.router.navigateByUrl('/cesta');
  }
}
