import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withComponentInputBinding, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';
import {  importProvidersFrom, inject } from '@angular/core';
import { environment } from './environments/environment';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { AuthService } from './app/services/auth';
import { provideAppInitializer } from '@angular/core'; // 🚀 LA SOLUCIÓN MODERNA PARA ANGULAR 22
import { provideServiceWorker } from '@angular/service-worker';
import { isDevMode } from '@angular/core';
const socketConfig: SocketIoConfig = { url: environment.sockets, options: {} };

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideHttpClient(),
    provideIonicAngular({}),
    // 🛡️ GUARDAESPALDAS DE SESIÓN: Verifica el token antes de disparar rutas y guardianes
    provideAppInitializer(() => {
      const authService = inject(AuthService);
      // Angular 22 esperará a que se resuelva esta promesa antes de disparar el enrutador
      return authService.cargarSesionPersistente();
    }),
    importProvidersFrom(SocketIoModule.forRoot(socketConfig)),
    
    provideRouter(routes, withPreloading(PreloadAllModules), withComponentInputBinding()),
    // ⚡ Inicializa el motor de Ionic y sus estados globales (Como los Menús Raíz)
    provideIonicAngular({
      mode: 'ios', // O 'md' según prefieras
      // 🚀 BLINDAJE DE TECLADO: Evita que empuje de forma violenta los modales hacia arriba
      scrollPadding: false,
      scrollAssist: true,
    }),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(), // Se activa automáticamente al compilar para producción (--prod)
      registrationStrategy: 'registerWhenStable:3000' // Espera 3 segundos a que la app esté estable
    })
  ],
});

