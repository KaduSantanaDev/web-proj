import { NgFor, NgIf } from '@angular/common';
import { Component, computed, effect, inject, input } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';
import { EstadoCatalogo } from '../../compartilhado/estado-catalogo';
import { GradeProdutos } from '../../compartilhado/grade-produtos';
import { CatalogoService } from '../../nucleo/catalogo.service';
import {
  ORDENACAO_PADRAO,
  ORDENACOES,
  Ordenacao,
  ehOrdenacao,
  ordenar,
} from '../../nucleo/ordenacao';

@Component({
  selector: 'app-vitrine',
  imports: [EstadoCatalogo, GradeProdutos, NgFor, NgIf, RouterLink],
  templateUrl: './vitrine.html',
  styleUrl: './vitrine.css',
})
export class Vitrine {
  readonly categoria = input<string>();
  readonly ordem = input<string>();

  private readonly catalogo = inject(CatalogoService);
  private readonly router = inject(Router);
  private readonly tituloDaPagina = inject(Title);

  protected readonly ordenacoes = ORDENACOES;
  protected readonly porValor = (_: number, ordenacao: { valor: Ordenacao }) => ordenacao.valor;
  protected readonly ordemAtual = computed<Ordenacao>(() => {
    const ordem = this.ordem();
    return ehOrdenacao(ordem) ? ordem : ORDENACAO_PADRAO;
  });
  protected readonly rotuloDaOrdem = computed(
    () => ORDENACOES.find((o) => o.valor === this.ordemAtual())?.rotulo ?? '',
  );

  protected readonly categoriaAtual = computed(() =>
    this.catalogo.categorias().find((c) => c.slug === this.categoria()),
  );
  protected readonly produtos = computed(() => {
    const slug = this.categoria();
    const todos = this.catalogo.produtos();
    const daCategoria = slug ? todos.filter((p) => p.categoria === slug) : todos;
    return ordenar(daCategoria, this.ordemAtual());
  });
  protected readonly titulo = computed(() => this.categoriaAtual()?.nome ?? 'Vitrine');
  protected readonly apoio = computed(() => {
    const n = this.produtos().length;
    if (!this.categoria())
      return 'Tudo o que saiu do forno esta semana. Escolha uma foto para ver os detalhes.';
    return n === 1 ? '1 produto nesta categoria.' : `${n} produtos nesta categoria.`;
  });

  constructor() {
    effect(() => this.tituloDaPagina.setTitle(`${this.titulo()} · Migalha`));
  }

  protected mudarOrdem(evento: Event): void {
    const valor = (evento.target as HTMLSelectElement).value;
    this.router.navigate([], {
      queryParams: { ordem: valor === ORDENACAO_PADRAO ? null : valor },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
