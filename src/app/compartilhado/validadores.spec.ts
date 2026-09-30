import { FormControl, FormGroup } from '@angular/forms';
import { formatarCpf, formatarTelefone } from './mascara';
import {
  cpfEhValido,
  cpfValido,
  emailValido,
  igualA,
  nomeCompleto,
  senhaComLetraENumero,
  telefoneValido,
  textoMinimo,
} from './validadores';

const c = (valor: string) => new FormControl(valor);

describe('validadores', () => {
  describe('CPF', () => {
    it('aceita CPFs com dígitos verificadores corretos, com ou sem máscara', () => {
      expect(cpfEhValido('529.982.247-25')).toBe(true);
      expect(cpfEhValido('52998224725')).toBe(true);
    });

    it('recusa dígito verificador errado, tamanho errado e sequências repetidas', () => {
      expect(cpfEhValido('529.982.247-26')).toBe(false);
      expect(cpfEhValido('529.982.247')).toBe(false);
      expect(cpfEhValido('111.111.111-11')).toBe(false);
      expect(cpfEhValido('')).toBe(false);
    });

    it('deixa o campo vazio para o Validators.required', () => {
      expect(cpfValido(c(''))).toBeNull();
      expect(cpfValido(c('123'))).toEqual({ cpf: true });
    });
  });

  describe('telefone', () => {
    it('aceita celular (11 dígitos com 9) e fixo (10 dígitos)', () => {
      expect(telefoneValido(c('(11) 91234-5678'))).toBeNull();
      expect(telefoneValido(c('(11) 3234-5678'))).toBeNull();
    });

    it('recusa DDD inválido, celular sem 9 e tamanho errado', () => {
      expect(telefoneValido(c('(01) 91234-5678'))).toEqual({ telefone: true });
      expect(telefoneValido(c('(11) 81234-5678'))).toEqual({ telefone: true });
      expect(telefoneValido(c('(11) 1234-567'))).toEqual({ telefone: true });
    });
  });

  describe('e-mail', () => {
    it('exige domínio com ponto (Validators.email aceitaria ana@casa)', () => {
      expect(emailValido(c('ana@casa'))).toEqual({ email: true });
      expect(emailValido(c('ana@casa.com.br'))).toBeNull();
      expect(emailValido(c('ana casa@x.com'))).toEqual({ email: true });
      expect(emailValido(c('@x.com'))).toEqual({ email: true });
    });
  });

  describe('nome completo', () => {
    it('pede nome e sobrenome', () => {
      expect(nomeCompleto(c('Ana'))).toEqual({ nomeCompleto: true });
      expect(nomeCompleto(c('Ana Souza'))).toBeNull();
      expect(nomeCompleto(c('José da Silva'))).toBeNull();
      expect(nomeCompleto(c('Ana 123'))).toEqual({ nomeCompleto: true });
    });
  });

  describe('senha', () => {
    it('pede letra e número', () => {
      expect(senhaComLetraENumero(c('somenteletras'))).toEqual({ senhaFraca: true });
      expect(senhaComLetraENumero(c('12345678'))).toEqual({ senhaFraca: true });
      expect(senhaComLetraENumero(c('Doce1234'))).toBeNull();
    });

    it('confere a confirmação com o campo de senha', () => {
      const form = new FormGroup({
        senha: c('Doce1234'),
        confirmacao: new FormControl('', igualA('senha')),
      });
      form.controls.confirmacao.setValue('Doce12345');
      expect(form.controls.confirmacao.errors).toEqual({ confirmacao: true });
      form.controls.confirmacao.setValue('Doce1234');
      expect(form.controls.confirmacao.errors).toBeNull();
    });
  });

  describe('busca', () => {
    it('ignora espaços nas pontas ao contar caracteres', () => {
      expect(textoMinimo(2)(c('  a  '))).toEqual({ textoMinimo: { minimo: 2 } });
      expect(textoMinimo(2)(c(' ab '))).toBeNull();
    });
  });
});

describe('máscaras', () => {
  it('formata CPF progressivamente e descarta o que não é dígito', () => {
    expect(formatarCpf('5')).toBe('5');
    expect(formatarCpf('5299')).toBe('529.9');
    expect(formatarCpf('529982247')).toBe('529.982.247');
    expect(formatarCpf('52998224725')).toBe('529.982.247-25');
    expect(formatarCpf('529.982.247-25999')).toBe('529.982.247-25');
    expect(formatarCpf('abc')).toBe('');
  });

  it('formata telefone fixo e celular', () => {
    expect(formatarTelefone('')).toBe('');
    expect(formatarTelefone('1')).toBe('(1');
    expect(formatarTelefone('11')).toBe('(11');
    expect(formatarTelefone('119')).toBe('(11) 9');
    expect(formatarTelefone('1132345678')).toBe('(11) 3234-5678');
    expect(formatarTelefone('11912345678')).toBe('(11) 91234-5678');
    expect(formatarTelefone('(11) 91234-5678')).toBe('(11) 91234-5678');
  });
});
