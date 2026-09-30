import { NgIf } from '@angular/common';
import { Component, ElementRef, inject, input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { Campo } from '../../compartilhado/campo';
import { emailValido } from '../../compartilhado/validadores';
import { AuthService } from '../../nucleo/auth.service';
import { AvisoService } from '../../nucleo/aviso.service';

export function destinoSeguro(retorno: string | undefined): string {
  return retorno && retorno.startsWith('/') && !retorno.startsWith('//') ? retorno : '/';
}

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, NgIf, RouterLink, RouterOutlet, Campo],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  readonly retorno = input<string>();

  private readonly auth = inject(AuthService);
  private readonly aviso = inject(AvisoService);
  private readonly router = inject(Router);
  private readonly elemento = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  protected readonly form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, emailValido],
    }),
    senha: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  protected readonly enviando = signal(false);
  protected readonly erro = signal('');

  protected readonly mensagens = {
    email: {
      required: 'Informe o e-mail do seu cadastro.',
      email: 'Digite um e-mail válido, como nome@exemplo.com.',
    },
    senha: { required: 'Informe sua senha.' },
  };

  protected async entrar(): Promise<void> {
    this.erro.set('');
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.elemento.querySelector<HTMLInputElement>('input.ng-invalid')?.focus();
      return;
    }

    this.enviando.set(true);
    try {
      const { email, senha } = this.form.getRawValue();
      const sessao = await this.auth.entrar(email, senha);
      if (!sessao) {
        this.erro.set('E-mail ou senha incorretos. Confira os dados ou use “Esqueci minha senha”.');
        return;
      }
      this.aviso.mostrar({ texto: `Bem-vindo de volta, ${sessao.nome.split(' ')[0]}.` });
      await this.router.navigateByUrl(destinoSeguro(this.retorno()));
    } catch {
      this.erro.set('Não foi possível entrar agora. Tente de novo em instantes.');
    } finally {
      this.enviando.set(false);
    }
  }
}
