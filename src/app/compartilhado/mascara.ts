import { Directive, ElementRef, HostListener, inject, input } from '@angular/core';
import { NgControl } from '@angular/forms';
import { somenteDigitos } from '../nucleo/texto';

export type TipoMascara = 'cpf' | 'telefone';

export function formatarCpf(texto: string): string {
  const d = somenteDigitos(texto).slice(0, 11);
  const [a, b, c, dv] = [d.slice(0, 3), d.slice(3, 6), d.slice(6, 9), d.slice(9, 11)];
  return a + (b ? `.${b}` : '') + (c ? `.${c}` : '') + (dv ? `-${dv}` : '');
}

export function formatarTelefone(texto: string): string {
  const d = somenteDigitos(texto).slice(0, 11);
  if (d.length === 0) return '';
  if (d.length <= 2) return `(${d}`;
  const ddd = d.slice(0, 2);
  const resto = d.slice(2);
  const corte = resto.length > 8 ? 5 : 4;
  return `(${ddd}) ${resto.length > corte ? `${resto.slice(0, corte)}-${resto.slice(corte)}` : resto}`;
}

const formatadores: Record<TipoMascara, (texto: string) => string> = {
  cpf: formatarCpf,
  telefone: formatarTelefone,
};

@Directive({ selector: 'input[appMascara]' })
export class Mascara {
  readonly appMascara = input<TipoMascara | null>(null);
  private readonly elemento = inject<ElementRef<HTMLInputElement>>(ElementRef).nativeElement;
  private readonly controle = inject(NgControl, { optional: true, self: true });

  @HostListener('input')
  aoDigitar(): void {
    const tipo = this.appMascara();
    if (!tipo) return;

    const formatado = formatadores[tipo](this.elemento.value);
    if (formatado === this.elemento.value) return;
    
    this.elemento.value = formatado;
    this.controle?.control?.setValue(formatado, { emitModelToViewChange: false });
  }
}
