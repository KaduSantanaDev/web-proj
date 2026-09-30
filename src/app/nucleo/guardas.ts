import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const soVisitante: CanActivateFn = () => {
  return inject(AuthService).logado() ? inject(Router).parseUrl('/') : true;
};
