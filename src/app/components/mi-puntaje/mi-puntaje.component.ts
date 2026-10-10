import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { closeCircle, pizza, restaurant, ribbon } from 'ionicons/icons';
import { IonButton, IonIcon } from '@ionic/angular';
import { Router } from '@angular/router';
import { MaterialesService } from '../../services/materiales';

@Component({
  selector: 'app-mi-puntaje',
  templateUrl: './mi-puntaje.component.html',
  styleUrls: ['./mi-puntaje.component.scss'],
  standalone: true,
  imports: [CommonModule, IonButton, IonIcon,]
})
export class MiPuntajeComponent {
  private materialesService = inject(MaterialesService); // 🚀 Acceso al estado de MongoDB Atlas
  
  
  // ⚡ Estándar de Angular 22: Nueva función output() y nombre limpio sin el prefijo "on"
  public cerrarModal = output<void>();

  // Exponemos las Signals reales al HTML
  public totalComidas = this.materialesService.totalRegistros;
  public rango = this.materialesService.rangoActual;

  constructor() {
    // Registramos los íconos del Figma requeridos por las filas del panel
    addIcons({ closeCircle, pizza, restaurant, ribbon });
  }

  notificarCierre() {
    // Emitimos el cierre reactivo hacia la página padre (InicioPage)
    this.cerrarModal.emit();
  }

 
}
