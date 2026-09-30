export interface Categoria {
  slug: string;
  nome: string;
}

export interface Produto {
  id: number;
  nome: string;
  categoria: string;
  preco: number;
  peso: string;
  imagem: string;
  tags: string[];
  vendas: number;
  lancadoEm: string;
  destaque?: string;
  descricao: string;
  detalhes: string;
  ingredientes: string;
}

export interface Usuario {
  nome: string;
  email: string;
  senha: string;
  cpf: string;
  telefone: string;
}

export interface Sessao {
  nome: string;
  email: string;
}

export interface ItemCesta {
  produtoId: number;
  qtd: number;
}

export interface LinhaCesta {
  produto: Produto;
  qtd: number;
  subtotal: number;
}
