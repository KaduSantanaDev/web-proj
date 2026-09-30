import { AbstractControl, AsyncValidatorFn, ValidationErrors, ValidatorFn } from '@angular/forms';
import { from, map, catchError, of } from 'rxjs';
import { somenteDigitos } from '../nucleo/texto';

const vazio = (valor: unknown) =>
  valor === null || valor === undefined || String(valor).trim() === '';

export const emailValido: ValidatorFn = (controle) => {
  const valor = String(controle.value ?? '').trim();
  if (vazio(valor)) return null;
  return /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[^\s@.]{2,}$/.test(valor) ? null : { email: true };
};

export const textoMinimo =
  (minimo: number): ValidatorFn =>
  (controle) => {
    const tamanho = String(controle.value ?? '').trim().length;
    return tamanho === 0 || tamanho >= minimo ? null : { textoMinimo: { minimo } };
  };

export const nomeCompleto: ValidatorFn = (controle) => {
  if (vazio(controle.value)) return null;
  const partes = String(controle.value).trim().split(/\s+/);
  const valido =
    partes.length >= 2 &&
    partes.every((p) => p.length >= 2) &&
    /^[\p{L}][\p{L}'’. -]*$/u.test(partes.join(' '));
  return valido ? null : { nomeCompleto: true };
};

export function cpfEhValido(cpf: string): boolean {
  const d = somenteDigitos(cpf);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  const digito = (tamanho: number) => {
    const soma = [...d.slice(0, tamanho)].reduce((s, n, i) => s + Number(n) * (tamanho + 1 - i), 0);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };
  return digito(9) === Number(d[9]) && digito(10) === Number(d[10]);
}

export const cpfValido: ValidatorFn = (controle) =>
  vazio(controle.value) || cpfEhValido(String(controle.value)) ? null : { cpf: true };

export const telefoneValido: ValidatorFn = (controle) => {
  if (vazio(controle.value)) return null;
  const d = somenteDigitos(String(controle.value));
  const ddd = /^[1-9][1-9]/.test(d);
  const ok = ddd && (d.length === 10 ? /^\d{2}[2-8]/.test(d) : d.length === 11 && d[2] === '9');
  return ok ? null : { telefone: true };
};

export const senhaComLetraENumero: ValidatorFn = (controle) => {
  const valor = String(controle.value ?? '');
  if (valor === '') return null;
  return /\p{L}/u.test(valor) && /\d/.test(valor) ? null : { senhaFraca: true };
};

export const igualA =
  (outroCampo: string): ValidatorFn =>
  (controle: AbstractControl): ValidationErrors | null => {
    const outro = controle.parent?.get(outroCampo);
    if (!outro || vazio(controle.value)) return null;
    return controle.value === outro.value ? null : { confirmacao: true };
  };

export const emailDisponivel =
  (jaCadastrado: (email: string) => Promise<boolean>): AsyncValidatorFn =>
  (controle) =>
    from(jaCadastrado(String(controle.value))).pipe(
      map((existe): ValidationErrors | null => (existe ? { emailEmUso: true } : null)),
      catchError(() => of(null)),
    );
