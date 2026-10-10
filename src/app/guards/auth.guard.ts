// src/app/core/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const currentPath = route.routeConfig?.path;

  // 1. Caso: El usuario SI está autenticado
  if (authService.isAuthenticated()) {
    // Revisamos si ya completó el perfil (flag que guardas al terminar el stepper)
    const isProfileComplete = localStorage.getItem('profile_complete') === 'true';

    // Si ya tiene el perfil lleno e intenta ir a 'bienvenida', lo mandamos directo a 'inicio'
    if (currentPath === 'bienvenida' && isProfileComplete) {
      router.navigate(['/inicio']);
      return false;
    }

    // Para cualquier otra ruta protegida, lo dejamos pasar libremente
    return true;
  }

  // 2. Caso: El usuario NO está autenticado
  // Si no está autenticado pero va hacia la bienvenida, el login o el registro, lo dejamos pasar
  if (currentPath === 'bienvenida' || currentPath === 'login' || currentPath === 'registro') {
    return true;
  }

  // Si intenta forzar la entrada a inicio, consejos, etc., sin loguearse, va al login
  router.navigate(['/login']);
  return false;
};
