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
import { provideLottieOptions } from 'ngx-lottie';
import player from 'lottie-web'; // 🚀 IMPORTACIÓN DIRECTA: Asegura que el Service Worker lo empaquete en el bundle core


const socketConfig: SocketIoConfig = { url: environment.sockets, options: {} };

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideHttpClient(),
    provideIonicAngular({}),
    
    provideAppInitializer(() => {
      const authService = inject(AuthService);
      return authService.cargarSesionPersistente();
    }),
    
    // 🧼 REMOVEMOS la inyección de SocketIoModule antigua para evitar colisiones
    
    provideRouter(routes, withPreloading(PreloadAllModules), withComponentInputBinding()),
    
    provideIonicAngular({
      mode: 'ios',
      scrollPadding: false,
      scrollAssist: true,
    }),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(), 
      registrationStrategy: 'registerWhenStable:3000'
    }),
    provideLottieOptions({
      player: () => player
    }),
  ],
});

