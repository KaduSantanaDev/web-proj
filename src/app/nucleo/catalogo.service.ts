import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { Categoria, Produto } from './modelos';
import { normalizar } from './texto';

export type EstadoCatalogo = 'carregando' | 'pronto' | 'erro';

@Injectable({ providedIn: 'root' })
export class CatalogoService {
  private readonly http = inject(HttpClient);

  private readonly _produtos = signal<Produto[]>([]);
  private readonly _categorias = signal<Categoria[]>([]);
  private readonly _estado = signal<EstadoCatalogo>('carregando');

  readonly produtos = this._produtos.asReadonly();
  readonly categorias = this._categorias.asReadonly();
  readonly estado = this._estado.asReadonly();

  constructor() {
    this.carregar();
  }

  carregar(): void {
    this._estado.set('carregando');
    forkJoin({
      produtos: this.http.get<Produto[]>('data/produtos.json'),
      categorias: this.http.get<Categoria[]>('data/categorias.json'),
    }).subscribe({
      next: ({ produtos, categorias }) => {
        this._produtos.set(produtos);
        this._categorias.set(categorias);
        this._estado.set('pronto');
      },
      error: () => this._estado.set('erro'),
    });
  }

  produto(id: number): Produto | undefined {
    return this._produtos().find((p) => p.id === id);
  }

  nomeDaCategoria(slug: string): string {
    return this._categorias().find((c) => c.slug === slug)?.nome ?? '';
  }

  buscar(termo: string): Produto[] {
    const termos = normalizar(termo).split(/\s+/).filter(Boolean);
    if (termos.length === 0) return [];
    return this._produtos().filter((p) => {
      const palheiro = normalizar([p.nome, this.nomeDaCategoria(p.categoria), ...p.tags].join(' '));
      return termos.every((t) => palheiro.includes(t));
    });
  }
}
