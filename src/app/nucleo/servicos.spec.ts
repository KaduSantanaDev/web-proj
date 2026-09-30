import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthService, EmailEmUsoError } from './auth.service';
import { CarrinhoService, LIMITE_POR_ITEM } from './carrinho.service';
import { CatalogoService } from './catalogo.service';
import { Categoria, Produto, Usuario } from './modelos';
import { ORDENACOES, Ordenacao, ehOrdenacao, ordenar } from './ordenacao';

const produto = (
  id: number,
  nome: string,
  preco: number,
  extra: Partial<Produto> = {},
): Produto => ({
  id,
  nome,
  preco,
  categoria: 'bolos',
  peso: '1 un',
  imagem: 'x.svg',
  tags: [],
  vendas: 0,
  lancadoEm: '2026-01-01',
  descricao: '',
  detalhes: '',
  ingredientes: '',
  ...extra,
});

const PRODUTOS = [
  produto(1, 'Bolo de fubá', 0.1, { tags: ['bolo'] }),
  produto(2, 'Café torrado', 0.2, { categoria: 'cafes', tags: ['bebida'] }),
  produto(3, 'Pão de queijo', 12.9, { categoria: 'salgados' }),
];
const CATEGORIAS: Categoria[] = [
  { slug: 'bolos', nome: 'Bolos' },
  { slug: 'cafes', nome: 'Cafés e chás' },
  { slug: 'salgados', nome: 'Salgados' },
];
const SEMENTE: Usuario[] = [
  {
    nome: 'Kadu Teste',
    email: 'kadu@teste.com',
    senha: '1234',
    cpf: '529.982.247-25',
    telefone: '(11) 91234-5678',
  },
];

function iniciar() {
  TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
  return TestBed.inject(HttpTestingController);
}

function abertas(http: HttpTestingController, url: string) {
  return http.match(url).filter((req) => !req.cancelled);
}

function carregarCatalogo(http: HttpTestingController) {
  abertas(http, 'data/produtos.json')[0].flush(PRODUTOS);
  abertas(http, 'data/categorias.json')[0].flush(CATEGORIAS);
}

beforeEach(() => localStorage.clear());

describe('CatalogoService', () => {
  it('carrega produtos e categorias dos JSON', () => {
    const http = iniciar();
    const catalogo = TestBed.inject(CatalogoService);
    expect(catalogo.estado()).toBe('carregando');
    carregarCatalogo(http);
    expect(catalogo.estado()).toBe('pronto');
    expect(catalogo.produtos().length).toBe(3);
    expect(catalogo.nomeDaCategoria('cafes')).toBe('Cafés e chás');
  });

  it('entra em estado de erro quando o JSON falha e permite tentar de novo', () => {
    const http = iniciar();
    const catalogo = TestBed.inject(CatalogoService);
    abertas(http, 'data/produtos.json')[0].error(new ProgressEvent('error'));
    expect(catalogo.estado()).toBe('erro');

    catalogo.carregar();
    carregarCatalogo(http);
    expect(catalogo.estado()).toBe('pronto');
  });

  it('busca sem diferenciar acento ou caixa, exigindo todos os termos', () => {
    const http = iniciar();
    const catalogo = TestBed.inject(CatalogoService);
    carregarCatalogo(http);
    expect(catalogo.buscar('CAFE').map((p) => p.id)).toEqual([2]);
    expect(catalogo.buscar('pao queijo').map((p) => p.id)).toEqual([3]);
    expect(catalogo.buscar('bebida').map((p) => p.id)).toEqual([2]);
    expect(catalogo.buscar('cafés e chás').map((p) => p.id)).toEqual([2]);
    expect(catalogo.buscar('bolo cafe')).toEqual([]);
    expect(catalogo.buscar('   ')).toEqual([]);
  });
});

describe('CarrinhoService', () => {
  function criar() {
    const http = iniciar();
    const carrinho = TestBed.inject(CarrinhoService);
    carregarCatalogo(http);
    TestBed.tick();
    return carrinho;
  }

  it('soma quantidades e calcula o total em centavos, sem erro de ponto flutuante', () => {
    const carrinho = criar();
    carrinho.adicionar(1, 3);
    expect(carrinho.total()).toBe(0.3);
    carrinho.adicionar(3, 2);
    expect(carrinho.quantidade()).toBe(5);
    expect(carrinho.total()).toBe(26.1);
    expect(carrinho.linhas().map((l) => l.subtotal)).toEqual([0.3, 25.8]);
  });

  it('respeita o limite por produto e informa quantas unidades entraram', () => {
    const carrinho = criar();
    expect(carrinho.adicionar(1, 18)).toBe(18);
    expect(carrinho.adicionar(1, 5)).toBe(LIMITE_POR_ITEM - 18);
    expect(carrinho.qtdDoProduto(1)).toBe(LIMITE_POR_ITEM);
    expect(carrinho.adicionar(1)).toBe(0);
  });

  it('definir(…, 0) e remover() tiram o item; limpar() esvazia', () => {
    const carrinho = criar();
    carrinho.adicionar(1);
    carrinho.adicionar(2);
    carrinho.definir(1, 0);
    expect(carrinho.linhas().map((l) => l.produto.id)).toEqual([2]);
    carrinho.remover(2);
    expect(carrinho.quantidade()).toBe(0);
    carrinho.adicionar(3);
    carrinho.limpar();
    expect(carrinho.linhas()).toEqual([]);
  });

  it('guarda a cesta no localStorage e descarta produtos que deixaram de existir', () => {
    localStorage.setItem(
      'migalha.cesta',
      JSON.stringify([
        { produtoId: 2, qtd: 2 },
        { produtoId: 99, qtd: 1 },
      ]),
    );
    const carrinho = criar();
    TestBed.tick();
    expect(carrinho.linhas().map((l) => l.produto.id)).toEqual([2]);
    expect(carrinho.quantidade()).toBe(2);
    carrinho.adicionar(1);
    TestBed.tick();
    expect(JSON.parse(localStorage.getItem('migalha.cesta') ?? '[]')).toEqual([
      { produtoId: 2, qtd: 2 },
      { produtoId: 1, qtd: 1 },
    ]);
  });

  it('ignora dados corrompidos no localStorage', () => {
    localStorage.setItem('migalha.cesta', '{não é json');
    expect(criar().quantidade()).toBe(0);
    localStorage.setItem('migalha.cesta', JSON.stringify([{ produtoId: 'x', qtd: -1 }]));
    TestBed.resetTestingModule();
    expect(criar().quantidade()).toBe(0);
  });
});

describe('AuthService', () => {
  async function comSemente<T>(http: HttpTestingController, acao: Promise<T>): Promise<T> {
    await Promise.resolve();
    http.expectOne('data/usuarios.json').flush(SEMENTE);
    return acao;
  }

  it('entra com e-mail (sem diferenciar caixa) e senha corretos e guarda a sessão', async () => {
    const http = iniciar();
    const auth = TestBed.inject(AuthService);
    const sessao = await comSemente(http, auth.entrar(' KADU@teste.com ', '1234'));
    expect(sessao).toEqual({ nome: 'Kadu Teste', email: 'kadu@teste.com' });
    expect(auth.logado()).toBe(true);
    expect(JSON.parse(localStorage.getItem('migalha.sessao') ?? 'null')).toEqual(sessao);
    expect(localStorage.getItem('migalha.sessao')).not.toContain('1234');
  });

  it('recusa senha errada e e-mail desconhecido', async () => {
    const http = iniciar();
    const auth = TestBed.inject(AuthService);
    const resultado = auth.entrar('kadu@teste.com', 'errada');
    expect(await comSemente(http, resultado)).toBeNull();
    expect(await auth.entrar('ninguem@x.com', '1234')).toBeNull();
    expect(auth.logado()).toBe(false);
  });

  it('cadastra, impede e-mail repetido e permite entrar depois', async () => {
    const http = iniciar();
    const auth = TestBed.inject(AuthService);
    const novo: Usuario = {
      nome: 'Bia Silva',
      email: 'bia@exemplo.com',
      senha: 'Doce12345',
      cpf: '529.982.247-25',
      telefone: '(11) 91234-5678',
    };

    const sessao = await comSemente(http, auth.cadastrar(novo));
    expect(sessao.nome).toBe('Bia Silva');
    expect(auth.logado()).toBe(true);

    await expect(auth.cadastrar({ ...novo, email: 'BIA@exemplo.com' })).rejects.toBeInstanceOf(
      EmailEmUsoError,
    );
    await expect(auth.cadastrar({ ...novo, email: 'kadu@teste.com' })).rejects.toBeInstanceOf(
      EmailEmUsoError,
    );

    auth.sair();
    expect(auth.logado()).toBe(false);
    expect(await auth.entrar('bia@exemplo.com', 'Doce12345')).toEqual({
      nome: 'Bia Silva',
      email: 'bia@exemplo.com',
    });
  });

  it('tenta de novo depois de uma falha ao ler os usuários', async () => {
    const http = iniciar();
    const auth = TestBed.inject(AuthService);
    const primeira = auth.entrar('kadu@teste.com', '1234');
    await Promise.resolve();
    http.expectOne('data/usuarios.json').error(new ProgressEvent('error'));
    await expect(primeira).rejects.toBeTruthy();

    const segunda = auth.entrar('kadu@teste.com', '1234');
    expect(await comSemente(http, segunda)).not.toBeNull();
  });
});

describe('ordenar', () => {
  const lista = [
    produto(1, 'Broa', 10, { vendas: 50, lancadoEm: '2026-01-10' }),
    produto(2, 'Alfajor', 10, { vendas: 90, lancadoEm: '2026-08-01' }),
    produto(3, 'Cuca', 4.5, { vendas: 10, lancadoEm: '2026-05-20' }),
    produto(4, 'Docinho', 32, { vendas: 90, lancadoEm: '2026-08-01' }),
  ];
  const ids = (ordem: Ordenacao) => ordenar(lista, ordem).map((p) => p.id);

  it('mais vendidos: mais vendas primeiro, desempatando pelo nome', () => {
    expect(ids('mais-vendidos')).toEqual([2, 4, 1, 3]);
  });

  it('menor e maior preço: desempata pelas vendas', () => {
    expect(ids('menor-preco')).toEqual([3, 2, 1, 4]);
    expect(ids('maior-preco')).toEqual([4, 2, 1, 3]);
  });

  it('novidade: lançamento mais recente primeiro', () => {
    expect(ids('novidade')).toEqual([2, 4, 3, 1]);
  });

  it('não altera a lista original', () => {
    const copia = lista.map((p) => p.id);
    ordenar(lista, 'menor-preco');
    expect(lista.map((p) => p.id)).toEqual(copia);
  });

  it('reconhece só valores de ordenação válidos', () => {
    expect(ehOrdenacao('menor-preco')).toBe(true);
    expect(ehOrdenacao('aleatorio')).toBe(false);
    expect(ehOrdenacao(undefined)).toBe(false);
    expect(ORDENACOES.map((o) => o.rotulo)).toEqual([
      'Mais vendidos',
      'Menor preço',
      'Maior preço',
      'Novidade',
    ]);
  });
});
