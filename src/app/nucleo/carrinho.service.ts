import { Injectable, computed, effect, inject, signal, untracked } from '@angular/core';
import { ehObjeto, gravar, ler } from './armazenamento';
import { CatalogoService } from './catalogo.service';
import { ItemCesta, LinhaCesta } from './modelos';

const CHAVE = 'migalha.cesta';
export const LIMITE_POR_ITEM = 20;

function ehListaDeItens(valor: unknown): valor is ItemCesta[] {
  return (
    Array.isArray(valor) &&
    valor.every(
      (i) =>
        ehObjeto(i) &&
        Number.isInteger(i['produtoId']) &&
        Number.isInteger(i['qtd']) &&
        (i['qtd'] as number) > 0,
    )
  );
}

@Injectable({ providedIn: 'root' })
export class CarrinhoService {
  private readonly catalogo = inject(CatalogoService);
  private readonly itens = signal<ItemCesta[]>(ler(CHAVE, [], ehListaDeItens));

  readonly linhas = computed<LinhaCesta[]>(() =>
    this.itens().flatMap(({ produtoId, qtd }) => {
      const produto = this.catalogo.produto(produtoId);
      return produto ? [{ produto, qtd, subtotal: this.multiplicar(produto.preco, qtd) }] : [];
    }),
  );
  readonly quantidade = computed(() => this.itens().reduce((soma, i) => soma + i.qtd, 0));
  readonly total = computed(() => this.linhas().reduce((soma, l) => soma + l.subtotal, 0));

  constructor() {
    effect(() => gravar(CHAVE, this.itens()));

    effect(() => {
      if (this.catalogo.estado() !== 'pronto') return;
      const existentes = new Set(this.catalogo.produtos().map((p) => p.id));
      const atuais = untracked(this.itens);
      const validos = atuais.filter((i) => existentes.has(i.produtoId));
      if (validos.length !== atuais.length) this.itens.set(validos);
    });
  }

  qtdDoProduto(produtoId: number): number {
    return this.itens().find((i) => i.produtoId === produtoId)?.qtd ?? 0;
  }

  adicionar(produtoId: number, qtd = 1): number {
    const atual = this.qtdDoProduto(produtoId);
    const nova = Math.min(atual + qtd, LIMITE_POR_ITEM);
    this.definir(produtoId, nova);
    return nova - atual;
  }

  definir(produtoId: number, qtd: number): void {
    const valida = Math.min(Math.max(Math.trunc(qtd), 0), LIMITE_POR_ITEM);
    this.itens.update((lista) => {
      const resto = lista.filter((i) => i.produtoId !== produtoId);
      if (valida === 0) return resto;
      const existe = lista.some((i) => i.produtoId === produtoId);
      return existe
        ? lista.map((i) => (i.produtoId === produtoId ? { ...i, qtd: valida } : i))
        : [...resto, { produtoId, qtd: valida }];
    });
  }

  remover(produtoId: number): void {
    this.definir(produtoId, 0);
  }

  limpar(): void {
    this.itens.set([]);
  }

  private multiplicar(preco: number, qtd: number): number {
    return (Math.round(preco * 100) * qtd) / 100;
  }
}
