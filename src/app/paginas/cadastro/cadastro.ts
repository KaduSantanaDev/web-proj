import { NgIf } from '@angular/common';
import { Component, DestroyRef, ElementRef, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { filter, firstValueFrom } from 'rxjs';
import { Campo } from '../../compartilhado/campo';
import {
  cpfValido,
  emailDisponivel,
  emailValido,
  igualA,
  nomeCompleto,
  senhaComLetraENumero,
  telefoneValido,
} from '../../compartilhado/validadores';
import { AuthService, EmailEmUsoError } from '../../nucleo/auth.service';
import { AvisoService } from '../../nucleo/aviso.service';
import { destinoSeguro } from '../login/login';

@Component({
  selector: 'app-cadastro',
  imports: [ReactiveFormsModule, NgIf, RouterLink, Campo],
  templateUrl: './cadastro.html',
  styleUrl: './cadastro.css',
})
export class Cadastro {
  readonly retorno = input<string>();

  private readonly auth = inject(AuthService);
  private readonly aviso = inject(AvisoService);
  private readonly router = inject(Router);
  private readonly elemento = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  protected readonly form = new FormGroup({
    nome: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, nomeCompleto],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, emailValido],
      asyncValidators: [emailDisponivel((email) => this.auth.emailCadastrado(email))],
    }),
    senha: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8), senhaComLetraENumero],
    }),
    confirmacao: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, igualA('senha')],
    }),
    cpf: new FormControl('', { nonNullable: true, validators: [Validators.required, cpfValido] }),
    telefone: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, telefoneValido],
    }),
  });

  protected readonly enviando = signal(false);
  protected readonly erro = signal('');

  protected readonly mensagens = {
    nome: { required: 'Informe seu nome.', nomeCompleto: 'Digite nome e sobrenome.' },
    email: {
      required: 'Informe seu e-mail.',
      email: 'Digite um e-mail válido, como nome@exemplo.com.',
      emailEmUso: 'Este e-mail já tem cadastro. Tente entrar na sua conta.',
    },
    senha: {
      required: 'Crie uma senha.',
      minlength: 'Use ao menos 8 caracteres.',
      senhaFraca: 'Misture letras e números.',
    },
    confirmacao: { required: 'Repita a senha.', confirmacao: 'As senhas não são iguais.' },
    cpf: { required: 'Informe seu CPF.', cpf: 'Esse CPF não é válido. Confira os números.' },
    telefone: {
      required: 'Informe um telefone com DDD.',
      telefone: 'Digite o DDD e o número, como (11) 91234-5678.',
    },
  };

  constructor() {
    this.form.controls.senha.valueChanges
      .pipe(takeUntilDestroyed(inject(DestroyRef)))
      .subscribe(() => this.form.controls.confirmacao.updateValueAndValidity());
  }

  protected async cadastrar(): Promise<void> {
    this.erro.set('');
    this.form.markAllAsTouched();
    if (this.form.pending) {
      await firstValueFrom(this.form.statusChanges.pipe(filter((status) => status !== 'PENDING')));
    }
    if (this.form.invalid) {
      this.elemento.querySelector<HTMLInputElement>('input.ng-invalid')?.focus();
      return;
    }

    this.enviando.set(true);
    try {
      const { confirmacao: _, ...dados } = this.form.getRawValue();
      const sessao = await this.auth.cadastrar(dados);
      this.aviso.mostrar({
        texto: `Cadastro criado. Você já está logado, ${sessao.nome.split(' ')[0]}.`,
      });
      await this.router.navigateByUrl(destinoSeguro(this.retorno()));
    } catch (e) {
      if (e instanceof EmailEmUsoError) {
        this.form.controls.email.setErrors({ emailEmUso: true });
        this.elemento.querySelector<HTMLInputElement>('#cadastro-email')?.focus();
      } else {
        this.erro.set('Não foi possível concluir o cadastro agora. Tente de novo em instantes.');
      }
    } finally {
      this.enviando.set(false);
    }
  }
}
