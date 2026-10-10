import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
// 🚀 Ajustado a las APIs Standalone oficiales de Ionic
import { addIcons } from 'ionicons';
import { notificationsOutline, menuOutline } from 'ionicons/icons';
import { IonHeader, IonToolbar, IonIcon, IonMenuToggle } from '@ionic/angular';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true, // 🚀 Declaramos formalmente el modo standalone
  imports: [CommonModule, IonHeader, IonToolbar, IonIcon, IonMenuToggle]
})
export class HeaderComponent {
  private router = inject(Router);

  constructor() {
    addIcons({ notificationsOutline, menuOutline });
  }

  irANotificaciones() {
    this.router.navigateByUrl('/notificaciones');
  }
}
