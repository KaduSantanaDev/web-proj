import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ehObjeto, gravar, ler, remover } from './armazenamento';
import { Sessao, Usuario } from './modelos';
import { normalizar } from './texto';

const CHAVE_SESSAO = 'migalha.sessao';
const CHAVE_USUARIOS = 'migalha.usuarios';

export class EmailEmUsoError extends Error {
  constructor() {
    super('E-mail já cadastrado');
  }
}

function ehSessao(valor: unknown): valor is Sessao {
  return ehObjeto(valor) && typeof valor['nome'] === 'string' && typeof valor['email'] === 'string';
}

function ehUsuario(valor: unknown): valor is Usuario {
  return (
    ehObjeto(valor) &&
    ['nome', 'email', 'senha', 'cpf', 'telefone'].every((campo) => typeof valor[campo] === 'string')
  );
}

function ehListaDeUsuarios(valor: unknown): valor is Usuario[] {
  return Array.isArray(valor) && valor.every(ehUsuario);
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private usuariosDeExemplo?: Promise<Usuario[]>;

  private readonly _sessao = signal<Sessao | null>(ler(CHAVE_SESSAO, null, ehSessao));
  readonly sessao = this._sessao.asReadonly();
  readonly logado = computed(() => this._sessao() !== null);

  async emailCadastrado(email: string): Promise<boolean> {
    const alvo = normalizar(email);
    return (await this.todosOsUsuarios()).some((u) => normalizar(u.email) === alvo);
  }

  async entrar(email: string, senha: string): Promise<Sessao | null> {
    const alvo = normalizar(email);
    const usuario = (await this.todosOsUsuarios()).find(
      (u) => normalizar(u.email) === alvo && u.senha === senha,
    );
    return usuario ? this.iniciarSessao(usuario) : null;
  }

  async cadastrar(novo: Usuario): Promise<Sessao> {
    if (await this.emailCadastrado(novo.email)) throw new EmailEmUsoError();
    const usuario = { ...novo, email: novo.email.trim(), nome: novo.nome.trim() };
    gravar(CHAVE_USUARIOS, [...this.usuariosCadastrados(), usuario]);
    return this.iniciarSessao(usuario);
  }

  sair(): void {
    this._sessao.set(null);
    remover(CHAVE_SESSAO);
  }

  private iniciarSessao({ nome, email }: Usuario): Sessao {
    const sessao = { nome, email };
    this._sessao.set(sessao);
    gravar(CHAVE_SESSAO, sessao);
    return sessao;
  }

  private usuariosCadastrados(): Usuario[] {
    return ler(CHAVE_USUARIOS, [], ehListaDeUsuarios);
  }

  private async todosOsUsuarios(): Promise<Usuario[]> {
    this.usuariosDeExemplo ??= firstValueFrom(this.http.get<Usuario[]>('data/usuarios.json')).catch(
      (erro) => {
        this.usuariosDeExemplo = undefined;
        throw erro;
      },
    );
    return [...(await this.usuariosDeExemplo), ...this.usuariosCadastrados()];
  }
}
