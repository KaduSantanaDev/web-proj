import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map } from 'rxjs';
import { Logo } from '../compartilhado/logo';
import { textoMinimo } from '../compartilhado/validadores';
import { AuthService } from '../nucleo/auth.service';
import { AvisoService } from '../nucleo/aviso.service';
import { CarrinhoService } from '../nucleo/carrinho.service';
import { CatalogoService } from '../nucleo/catalogo.service';
import { Categoria } from '../nucleo/modelos';

@Component({
  selector: 'app-topo',
  imports: [ReactiveFormsModule, RouterLink, NgClass, NgFor, NgIf, Logo],
  templateUrl: './topo.html',
  styleUrl: './topo.css',
})
export class Topo {
  private readonly router = inject(Router);
  private readonly aviso = inject(AvisoService);
  protected readonly auth = inject(AuthService);
  protected readonly carrinho = inject(CarrinhoService);
  protected readonly catalogo = inject(CatalogoService);

  protected readonly porSlug = (_: number, categoria: Categoria) => categoria.slug;

  protected readonly busca = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, textoMinimo(2)],
  });
  protected readonly tentouBuscar = signal(false);
  protected readonly primeiroNome = computed(() => this.auth.sessao()?.nome.split(' ')[0] ?? '');
  protected readonly rotuloCesta = computed(() => {
    const n = this.carrinho.quantidade();
    return n === 0 ? 'Cesta, vazia' : `Cesta, ${n} ${n === 1 ? 'item' : 'itens'}`;
  });

  private readonly urlAtual = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => this.router.parseUrl(this.router.url)),
    ),
    { initialValue: null },
  );

  protected readonly categoriaAtiva = computed(() => {
    const url = this.urlAtual();
    if (!url || url.root.children['primary']) return undefined;
    return String(url.queryParams['categoria'] ?? '');
  });

  constructor() {
    effect(() => {
      const url = this.urlAtual();
      const naBusca = url?.root.children['primary']?.segments[0]?.path === 'busca';
      const termo = naBusca ? String(url?.queryParams['q'] ?? '') : '';
      untracked(() => {
        this.busca.setValue(termo);
        this.tentouBuscar.set(false);
      });
    });
  }

  protected buscar(evento: Event): void {
    evento.preventDefault();
    this.tentouBuscar.set(true);
    if (this.busca.invalid) return;
    this.router.navigate(['/busca'], { queryParams: { q: this.busca.value.trim() } });
  }

  protected sair(): void {
    this.auth.sair();
    this.aviso.mostrar({ texto: 'Você saiu da sua conta.' });
    this.router.navigateByUrl('/');
  }
}
