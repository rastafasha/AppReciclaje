import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'register', // 🚀 MOVEMOS EL REGISTRO AQUÍ ARRIBA
    loadComponent: () => import('./pages/register/register.page').then(m => m.RegisterPage)
  },
  {
    path: 'bienvenida',
    loadComponent: () => import('./pages/bienvenida/bienvenida.page').then( m => m.BienvenidaPage)
  },
  {
    path: 'historial',
    loadComponent: () => import('./pages/historial/historial.page').then(m => m.HistorialPage),
    canActivate:[authGuard]
  },
  {
    path: 'perfil-editar',
    loadComponent: () => import('./pages/perfil-editar/perfil-editar.page').then( m => m.PerfilEditarPage),
    canActivate:[authGuard]
  },
  {
    path: 'inicio',
    loadComponent: () => import('./pages/inicio/inicio.page').then( m => m.InicioPage),
    canActivate:[authGuard]
  },
  
  {
    path: 'consejos',
    loadComponent: () => import('./pages/consejos/consejos.page').then( m => m.ConsejosPage),
    canActivate:[authGuard]
  },
  {
    path: 'notificaciones',
    loadComponent: () => import('./pages/notificaciones/notificaciones.page').then( m => m.NotificacionesPage),
    canActivate:[authGuard]
  },
  {
    path: 'reglas',
    loadComponent: () => import('./pages/reglas/reglas.page').then( m => m.ReglasPage),
    canActivate:[authGuard]
  },
   {
    path: 'terminosycondiciones',
    loadComponent: () => import('./pages/terminosycondiciones/terminosycondiciones.page').then( m => m.TerminosycondicionesPage)
  },
  {
    path: 'mi-cuenta',
    loadComponent: () => import('./pages/mi-cuenta/mi-cuenta.page').then( m => m.MiCuentaPage),
    canActivate:[authGuard]
  },

  {
    path: 'recuperar-password',
    loadComponent: () => import('./pages/recuperar-password/recuperar-password.page').then( m => m.RecuperarPasswordPage)
  },
  {
    path: '**', // 🛑 EL COMODÍN DEBE SER SIEMPRE LA ÚLTIMA LÍNEA DEL ARREGLO
    redirectTo: 'login'
  },
 
  
  
  
  
  
  
  
];

