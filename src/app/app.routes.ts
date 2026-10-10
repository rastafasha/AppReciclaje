import { Routes } from '@angular/router';

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
    loadComponent: () => import('./pages/historial/historial.page').then(m => m.HistorialPage)
  },
  {
    path: 'perfil-editar',
    loadComponent: () => import('./pages/perfil-editar/perfil-editar.page').then( m => m.PerfilEditarPage)
  },
  {
    path: 'inicio',
    loadComponent: () => import('./pages/inicio/inicio.page').then( m => m.InicioPage)
  },
  
  {
    path: 'consejos',
    loadComponent: () => import('./pages/consejos/consejos.page').then( m => m.ConsejosPage)
  },
  {
    path: 'notificaciones',
    loadComponent: () => import('./pages/notificaciones/notificaciones.page').then( m => m.NotificacionesPage)
  },
  {
    path: 'reglas',
    loadComponent: () => import('./pages/reglas/reglas.page').then( m => m.ReglasPage)
  },
  {
    path: 'mi-cuenta',
    loadComponent: () => import('./pages/mi-cuenta/mi-cuenta.page').then( m => m.MiCuentaPage)
  },
  {
    path: '**', // 🛑 EL COMODÍN DEBE SER SIEMPRE LA ÚLTIMA LÍNEA DEL ARREGLO
    redirectTo: 'login'
  },
  
  
  
  
  
  
  
];

