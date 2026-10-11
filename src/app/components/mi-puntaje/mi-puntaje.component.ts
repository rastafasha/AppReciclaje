import { Component, computed, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { checkmarkCircleOutline, closeCircle, pizza, restaurant, ribbon, trophyOutline } from 'ionicons/icons';
import {  IonIcon } from '@ionic/angular';
import { MaterialesService } from '../../services/materiales';

@Component({
  selector: 'app-mi-puntaje',
  templateUrl: './mi-puntaje.component.html',
  styleUrls: ['./mi-puntaje.component.scss'],
  standalone: true,
  imports: [CommonModule,  IonIcon,]
})
export class MiPuntajeComponent {
  private materialesService = inject(MaterialesService); // 🚀 Acceso al estado de MongoDB Atlas
  
  
  // ⚡ Estándar de Angular 22: Nueva función output() y nombre limpio sin el prefijo "on"
  public cerrarModal = output<void>();

  // Exponemos las Signals reales al HTML
  public totalComidas = this.materialesService.totalRegistros;
  public rango = this.materialesService.rangoActual;

  /**
   * 🏆 REGLA DE NEGOCIO COMPUTADA: 
   * Evalúa instantáneamente si el usuario tiene 55 o más puntos para habilitar el sorteo
   */
  public esElegibleSorteo = computed(() => {
    return this.totalComidas() >= 55;
  });

  constructor() {
    // Agregamos iconos para el banner del sorteo final
    addIcons({ closeCircle, pizza, restaurant, ribbon, trophyOutline, checkmarkCircleOutline });
  }

  notificarCierre() {
    // Emitimos el cierre reactivo hacia la página padre (InicioPage)
    this.cerrarModal.emit();
  }

 
}
