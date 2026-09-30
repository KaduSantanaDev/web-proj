import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';

@Component({
  selector: 'app-dialogo',
  template: `
    <dialog
      #janela
      class="dialogo"
      [attr.aria-labelledby]="idTitulo()"
      (close)="aoFechar()"
      (click)="cliqueNoFundo($event)"
    >
      <div class="dialogo__caixa">
        <ng-content />
        <button
          type="button"
          class="dialogo__x"
          (click)="janela.close()"
          aria-label="Fechar janela"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path
              d="M6 6l12 12M18 6L6 18"
              fill="none"
              stroke="currentColor"
              stroke-width="2.6"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>
    </dialog>
  `,
  styleUrl: './dialogo.css',
})
export class Dialogo {
  readonly idTitulo = input.required<string>();
  readonly fechar = output<void>();
  private readonly janela = viewChild.required<ElementRef<HTMLDialogElement>>('janela');

  private destruido = false;

  constructor() {
    afterNextRender(() => this.janela().nativeElement.showModal());

    inject(DestroyRef).onDestroy(() => {
      this.destruido = true;
      this.janela().nativeElement.close();
    });
  }

  protected aoFechar(): void {
    if (!this.destruido) this.fechar.emit();
  }

  protected cliqueNoFundo(evento: MouseEvent): void {
    if (evento.target === this.janela().nativeElement) this.janela().nativeElement.close();
  }
}
