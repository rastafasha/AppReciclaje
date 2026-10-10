import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IonApp, IonContent, IonIcon, IonMenu, IonRouterOutlet, MenuController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { trophyOutline, documentTextOutline, powerOutline } from 'ionicons/icons';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet, IonMenu, IonContent, IonIcon] 
})
export class AppComponent {
   private router = inject(Router);
  private menuCtrl = inject(MenuController);

  public username = signal<string>('reciclador_pro');
  constructor() {
    addIcons({ trophyOutline, documentTextOutline, powerOutline });
  }

  navegarA(ruta: string) {
    this.menuCtrl.close('main-menu'); // Cerramos el panel antes de saltar
    this.router.navigateByUrl(`/${ruta}`);
  }

  abrirSoporte() {
    console.log('💬 Abriendo canal de chat directo con los administradores de UCC');
    this.menuCtrl.close('main-menu');
  }

  cerrarSesion() {
    this.menuCtrl.close('main-menu');
    localStorage.removeItem('token'); // Limpiamos la sesión NoSQL
    this.router.navigateByUrl('/login');
  }
}
