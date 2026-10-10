import { Platform } from '@angular/cdk/platform';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter, map } from 'rxjs';
import { IonIcon } from '@ionic/angular';

@Component({
  selector: 'app-pwa-notif-installer',
  standalone: true,
  imports: [CommonModule, IonIcon],
  templateUrl: './pwa-notif-installer.component.html',
  styleUrls: ['./pwa-notif-installer.component.scss']
})
export class PwaNotifInstallerComponent implements OnInit {
  private swUpdate = inject(SwUpdate);

  // 🚦 Signals reactivas para ocultar/mostrar los banners de tu HTML
  public hayNuevaVersion = signal<boolean>(false);
  public mostrarBannerInstalar = signal<boolean>(false);

  // Almacena temporalmente el evento nativo del navegador para disparar la instalación
  private deferredPrompt: any = null;

  ngOnInit() {
    // 1. 🛡️ ESCUCHA DE ACTUALIZACIONES: Si subes cambios al Backend/Frontend en Render
    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates.subscribe((evt) => {
        // Al detectar que terminó de descargarse el nuevo ngsw.json, encendemos el banner
        if (evt.type === 'VERSION_READY') {
          console.log('🔄 ¡Nueva versión detectada en el servidor de Mercadona!');
          this.hayNuevaVersion.set(true);
        }
      });
    }

    // 2. 📱 PROMPT DE INSTALACIÓN: Escucha si el dispositivo permite crear el acceso directo
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('🎈 El dispositivo es apto para instalar la PWA.');
      e.preventDefault(); // Frenamos el prompt feo por defecto del navegador
      this.deferredPrompt = e; // Guardamos el evento
      this.mostrarBannerInstalar.set(true); // Encendemos tu banner personalizado
    });
  }

  /**
   * 🔄 Acción: Forzar recarga inmediata para aplicar los nuevos chunks de código
   */
  actualizarApp() {
    this.hayNuevaVersion.set(false);
    // Recarga la pestaña limpiando la memoria RAM vieja
    window.location.reload();
  }

  /**
   * 📲 Acción: Disparar la ventana nativa de instalación de Android / iOS
   */
  instalarPwa() {
    if (!this.deferredPrompt) return;

    this.mostrarBannerInstalar.set(false);
    // Desplegamos el prompt oficial del sistema operativo
    this.deferredPrompt.prompt();

    this.deferredPrompt.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('🎉 El usuario aceptó e instaló "Mercadona Premia tu Reciclaje"');
      }
      this.deferredPrompt = null;
    });
  }

  cerrarBannerInstalacion() {
    this.mostrarBannerInstalar.set(false);
  }

}
