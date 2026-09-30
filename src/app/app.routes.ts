import { Routes } from '@angular/router';
import { soVisitante } from './nucleo/guardas';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Vitrine · Migalha',
    loadComponent: () => import('./paginas/vitrine/vitrine').then((m) => m.Vitrine),
  },
  {
    path: 'busca',
    title: 'Busca · Migalha',
    loadComponent: () => import('./paginas/busca/busca').then((m) => m.Busca),
  },
  {
    path: 'produto/:id',
    title: 'Produto · Migalha',
    loadComponent: () => import('./paginas/detalhe/detalhe').then((m) => m.Detalhe),
  },
  {
    path: 'cesta',
    title: 'Cesta · Migalha',
    loadComponent: () => import('./paginas/cesta/cesta').then((m) => m.Cesta),
  },
  {
    path: 'login',
    title: 'Entrar · Migalha',
    canActivate: [soVisitante],
    loadComponent: () => import('./paginas/login/login').then((m) => m.Login),
    children: [
      {
        path: 'esqueci-senha',
        title: 'Esqueci minha senha · Migalha',
        loadComponent: () =>
          import('./paginas/esqueci-senha/esqueci-senha').then((m) => m.EsqueciSenha),
      },
    ],
  },
  {
    path: 'cadastro',
    title: 'Cadastro · Migalha',
    canActivate: [soVisitante],
    loadComponent: () => import('./paginas/cadastro/cadastro').then((m) => m.Cadastro),
  },
  {
    path: '**',
    title: 'Página não encontrada · Migalha',
    loadComponent: () =>
      import('./paginas/nao-encontrada/nao-encontrada').then((m) => m.NaoEncontrada),
  },
];
