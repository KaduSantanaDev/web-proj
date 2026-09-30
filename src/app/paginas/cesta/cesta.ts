import { CurrencyPipe, NgFor, NgIf } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Dialogo } from '../../compartilhado/dialogo';
import { EstadoCatalogo } from '../../compartilhado/estado-catalogo';
import { Quantidade } from '../../compartilhado/quantidade';
import { AuthService } from '../../nucleo/auth.service';
import { AvisoService } from '../../nucleo/aviso.service';
import { CarrinhoService } from '../../nucleo/carrinho.service';
import { LinhaCesta } from '../../nucleo/modelos';

interface Pedido {
  numero: string;
  total: number;
  itens: number;
  email: string;
}

@Component({
  selector: 'app-cesta',
  imports: [CurrencyPipe, NgFor, NgIf, RouterLink, Dialogo, EstadoCatalogo, Quantidade],
  templateUrl: './cesta.html',
  styleUrl: './cesta.css',
})
export class Cesta {
  protected readonly carrinho = inject(CarrinhoService);
  private readonly auth = inject(AuthService);
  private readonly aviso = inject(AvisoService);
  private readonly router = inject(Router);

  protected readonly porProduto = (_: number, linha: LinhaCesta) => linha.produto.id;
  protected readonly confirmandoLimpeza = signal(false);
  protected readonly pedido = signal<Pedido | null>(null);

  protected limpar(): void {
    this.carrinho.limpar();
    this.confirmandoLimpeza.set(false);
  }

  protected remover(produtoId: number, nome: string): void {
    this.carrinho.remover(produtoId);
    this.aviso.mostrar({ texto: `${nome} saiu da cesta.` });
  }

  protected finalizar(): void {
    const sessao = this.auth.sessao();
    if (!sessao) {
      this.aviso.mostrar({
        texto: 'Entre na sua conta para finalizar a compra. Sua cesta continua guardada.',
      });
      this.router.navigate(['/login'], { queryParams: { retorno: '/cesta' } });
      return;
    }
    this.pedido.set({
      numero: String(Date.now()).slice(-6),
      total: this.carrinho.total(),
      itens: this.carrinho.quantidade(),
      email: sessao.email,
    });
    this.carrinho.limpar();
  }

  protected fecharPedido(): void {
    this.pedido.set(null);
    this.router.navigateByUrl('/');
  }
}
