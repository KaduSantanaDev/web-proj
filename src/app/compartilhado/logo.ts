import { Component } from '@angular/core';

@Component({
  selector: 'app-logo',
  template: `
    <span class="logo">
      <svg class="logo__marca" viewBox="0 0 64 64" aria-hidden="true">
        <path
          d="M32 4a28 28 0 1 0 28 28 12 12 0 0 1-12-12A12 12 0 0 1 32 4Z"
          fill="#FFCF4A"
          stroke="#1A2A8C"
          stroke-width="4"
          stroke-linejoin="round"
        />
        <circle cx="21" cy="24" r="4" fill="#1A2A8C" />
        <circle cx="30" cy="42" r="4" fill="#1A2A8C" />
        <circle cx="44" cy="38" r="3" fill="#1A2A8C" />
      </svg>
      <span class="logo__texto">
        <span class="logo__nome">migalha</span>
        <span class="logo__sub">bolachas e quitutes</span>
      </span>
    </span>
  `,
  styles: `
    .logo {
      display: inline-flex;
      align-items: center;
      gap: 10px;
    }
    .logo__marca {
      width: 46px;
      height: 46px;
      flex: none;
    }
    .logo__texto {
      display: grid;
      line-height: 1;
    }
    .logo__nome {
      font-size: 1.6rem;
      font-weight: 700;
      letter-spacing: -0.035em;
      color: var(--azul);
    }
    .logo__sub {
      margin-top: 3px;
      font-size: 0.72rem;
      font-weight: 500;
      color: var(--cacau-suave);
    }
    @media (max-width: 479px) {
      .logo__marca {
        width: 38px;
        height: 38px;
      }
      .logo__nome {
        font-size: 1.35rem;
      }
      .logo__sub {
        display: none;
      }
    }
  `,
})
export class Logo {}
