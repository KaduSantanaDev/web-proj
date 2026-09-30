import { Produto } from './modelos';

export type Ordenacao = 'mais-vendidos' | 'menor-preco' | 'maior-preco' | 'novidade';

export const ORDENACAO_PADRAO: Ordenacao = 'mais-vendidos';

export const ORDENACOES: readonly { valor: Ordenacao; rotulo: string }[] = [
  { valor: 'mais-vendidos', rotulo: 'Mais vendidos' },
  { valor: 'menor-preco', rotulo: 'Menor preço' },
  { valor: 'maior-preco', rotulo: 'Maior preço' },
  { valor: 'novidade', rotulo: 'Novidade' },
];

export function ehOrdenacao(valor: unknown): valor is Ordenacao {
  return ORDENACOES.some((o) => o.valor === valor);
}

const porNome = (a: Produto, b: Produto) => a.nome.localeCompare(b.nome, 'pt-BR');
const porVendas = (a: Produto, b: Produto) => b.vendas - a.vendas || porNome(a, b);

const comparadores: Record<Ordenacao, (a: Produto, b: Produto) => number> = {
  'mais-vendidos': porVendas,
  'menor-preco': (a, b) => a.preco - b.preco || porVendas(a, b),
  'maior-preco': (a, b) => b.preco - a.preco || porVendas(a, b),
  novidade: (a, b) => Date.parse(b.lancadoEm) - Date.parse(a.lancadoEm) || porVendas(a, b),
};

export function ordenar(produtos: readonly Produto[], ordem: Ordenacao): Produto[] {
  return [...produtos].sort(comparadores[ordem]);
}
