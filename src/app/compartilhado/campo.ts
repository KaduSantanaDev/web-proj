import { NgClass, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { Component, computed, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { startWith, switchMap } from 'rxjs';
import { Mascara, TipoMascara } from './mascara';

@Component({
  selector: 'app-campo',
  imports: [ReactiveFormsModule, Mascara, NgClass, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault],
  templateUrl: './campo.html',
  styleUrl: './campo.css',
})
export class Campo {
  readonly idCampo = input.required<string>();
  readonly rotulo = input.required<string>();
  readonly controle = input.required<FormControl<string>>();
  readonly tipo = input<'text' | 'email' | 'password' | 'tel' | 'search'>('text');
  readonly autocomplete = input<string>();
  readonly inputmode = input<string>();
  readonly mascara = input<TipoMascara | null>(null);
  readonly placeholder = input('');
  readonly dica = input('');
  readonly mensagens = input<Record<string, string>>({});
  readonly foco = input(false);

  protected readonly obrigatorio = Validators.required;
  protected readonly senhaVisivel = signal(false);
  protected readonly ehSenha = computed(() => this.tipo() === 'password');
  protected readonly tipoAtual = computed(() =>
    this.ehSenha() && this.senhaVisivel() ? 'text' : this.tipo(),
  );

  private readonly eventos = toSignal(
    toObservable(this.controle).pipe(switchMap((c) => c.events.pipe(startWith(null)))),
    { initialValue: null },
  );

  protected readonly erro = computed(() => {
    this.eventos();
    const c = this.controle();
    if (!c.invalid || !(c.touched || c.dirty)) return '';
    const mensagens = this.mensagens();
    const chave = Object.keys(c.errors ?? {}).find((k) => k in mensagens);
    return chave ? mensagens[chave] : 'Confira este campo.';
  });

  protected readonly validando = computed(() => {
    this.eventos();
    return this.controle().pending;
  });

  protected readonly situacao = computed(() =>
    this.erro() ? 'erro' : this.validando() ? 'validando' : 'dica',
  );
}
