import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-nao-encontrada',
  imports: [RouterLink],
  template: `
    <section class="pagina">
      <div class="vazio">
        <h1>Essa página esfarelou</h1>
        <p>O endereço não existe ou mudou de lugar. Volte para a vitrine e escolha o que levar.</p>
        <a class="btn btn--primario" routerLink="/">Ir para a vitrine</a>
      </div>
    </section>
  `,
})
export class NaoEncontrada {}
