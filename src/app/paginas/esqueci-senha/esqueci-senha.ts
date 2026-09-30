import { NgIf } from '@angular/common';
import { Component, ElementRef, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Campo } from '../../compartilhado/campo';
import { Dialogo } from '../../compartilhado/dialogo';
import { emailValido } from '../../compartilhado/validadores';

@Component({
  selector: 'app-esqueci-senha',
  imports: [ReactiveFormsModule, NgIf, Campo, Dialogo],
  templateUrl: './esqueci-senha.html',
})
export class EsqueciSenha {
  private readonly router = inject(Router);
  private readonly rota = inject(ActivatedRoute);
  private readonly elemento = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  protected readonly form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, emailValido],
    }),
  });
  protected readonly enviadoPara = signal('');

  protected readonly mensagens = {
    required: 'Informe o e-mail do seu cadastro.',
    email: 'Digite um e-mail válido, como nome@exemplo.com.',
  };

  protected enviar(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.elemento.querySelector<HTMLInputElement>('input.ng-invalid')?.focus();
      return;
    }
    this.enviadoPara.set(this.form.controls.email.value.trim());
  }

  protected voltar(): void {
    this.router.navigate(['..'], { relativeTo: this.rota, queryParamsHandling: 'preserve' });
  }
}
