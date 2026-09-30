import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-rodape',
  imports: [RouterLink],
  template: `
    <footer class="rodape">
      <div class="rodape__conteudo">
        <p class="rodape__marca">migalha</p>
        <p class="rodape__texto">Bolachas, bolos e quitutes assados em fornadas pequenas.</p>
        <ul class="rodape__links">
          <li><a routerLink="/">Vitrine</a></li>
          <li><a routerLink="/cesta">Cesta</a></li>
          <li><a routerLink="/login">Entrar</a></li>
          <li><a routerLink="/cadastro">Cadastrar</a></li>
        </ul>
      </div>
    </footer>
  `,
  styles: `
    .rodape {
      position: relative;
      margin-top: 3.5rem;
      background: var(--azul);
      color: var(--papel);
    }
    .rodape::before {
      content: '';
      position: absolute;
      bottom: 100%;
      left: 0;
      right: 0;
      height: 10px;
      background: radial-gradient(circle at 10px 100%, var(--azul) 0 10px, transparent 10.5px) 0 0 /
        20px 10px repeat-x;
    }
    .rodape__conteudo {
      display: grid;
      gap: 0.5rem 2rem;
      max-width: var(--largura);
      margin-inline: auto;
      padding: 2rem var(--gutter) 2.25rem;
    }
    .rodape__marca {
      font-size: 1.6rem;
      font-weight: 700;
      letter-spacing: -0.035em;
      color: var(--manteiga);
    }
    .rodape__links {
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem 1.25rem;
      margin: 0.5rem 0 0;
      padding: 0;
      list-style: none;
    }
    a {
      color: inherit;
      font-weight: 600;
    }
    a:focus-visible {
      outline-color: var(--manteiga);
    }
    @media (min-width: 720px) {
      .rodape__conteudo {
        grid-template-columns: 1fr auto;
        align-items: end;
      }
      .rodape__texto {
        grid-column: 1;
      }
      .rodape__links {
        grid-column: 2;
        grid-row: 1 / 3;
        margin: 0;
      }
    }
  `,
})
export class Rodape {}
