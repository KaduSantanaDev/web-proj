import { Component, ElementRef, inject, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, pairwise, startWith, map } from 'rxjs';
import { AvisoToast } from './layout/aviso';
import { Rodape } from './layout/rodape';
import { Topo } from './layout/topo';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Topo, Rodape, AvisoToast],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly principal = viewChild.required<ElementRef<HTMLElement>>('principal');

  constructor() {
    inject(Router)
      .events.pipe(
        filter((e) => e instanceof NavigationEnd),
        map((e) => e.urlAfterRedirects.split('?')[0]),
        startWith(null),
        pairwise(),
        filter(([anterior, atual]) => anterior !== null && anterior !== atual),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.principal().nativeElement.focus({ preventScroll: true }));
  }

  protected irParaOConteudo(evento: Event): void {
    evento.preventDefault();
    this.principal().nativeElement.focus();
  }
}
