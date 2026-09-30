import { NgFor, NgIf } from '@angular/common';
import { Component, computed, effect, inject, input } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { EstadoCatalogo } from '../../compartilhado/estado-catalogo';
import { GradeProdutos } from '../../compartilhado/grade-produtos';
import { CatalogoService } from '../../nucleo/catalogo.service';
import { Categoria } from '../../nucleo/modelos';

@Component({
  selector: 'app-busca',
  imports: [EstadoCatalogo, GradeProdutos, NgFor, NgIf, RouterLink],
  templateUrl: './busca.html',
})
export class Busca {
  readonly q = input<string>('');

  protected readonly catalogo = inject(CatalogoService);
  protected readonly porSlug = (_: number, categoria: Categoria) => categoria.slug;
  private readonly tituloDaPagina = inject(Title);

  protected readonly termo = computed(() => this.q().trim());
  protected readonly resultados = computed(() => this.catalogo.buscar(this.termo()));

  protected readonly resumo = computed(() => {
    const n = this.resultados().length;
    return n === 0
      ? 'Nenhum produto encontrado.'
      : n === 1
        ? '1 produto encontrado.'
        : `${n} produtos encontrados.`;
  });

  constructor() {
    effect(() =>
      this.tituloDaPagina.setTitle(
        this.termo() ? `Busca por ${this.termo()} · Migalha` : 'Busca · Migalha',
      ),
    );
  }
}
