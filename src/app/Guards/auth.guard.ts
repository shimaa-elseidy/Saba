import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/Auth/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService) as AuthService;
  const router = inject(Router);

  if (authService.getToken()) {
    return true; // ✅ 
  } else {
    router.navigate(['/login']); 
    return false;
  }
};
