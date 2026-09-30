import { Injectable, signal } from '@angular/core';

export interface Aviso {
  texto: string;
  acao?: { rotulo: string; rota: string };
}

@Injectable({ providedIn: 'root' })
export class AvisoService {
  private readonly _atual = signal<Aviso | null>(null);
  private temporizador?: ReturnType<typeof setTimeout>;

  readonly atual = this._atual.asReadonly();

  mostrar(aviso: Aviso, duracaoMs = 4500): void {
    clearTimeout(this.temporizador);
    this._atual.set(aviso);
    this.temporizador = setTimeout(() => this.fechar(), duracaoMs);
  }

  fechar(): void {
    clearTimeout(this.temporizador);
    this._atual.set(null);
  }
}
