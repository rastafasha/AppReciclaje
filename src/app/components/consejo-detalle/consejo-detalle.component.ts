import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { closeCircle } from 'ionicons/icons';
import { IonButton, IonIcon } from '@ionic/angular';

// Interfaz rápida para estructurar los consejos
export interface IConsejoData {
  titulo: string;
  contenido: string;
}

@Component({
  selector: 'app-consejo-detalle',
  templateUrl: './consejo-detalle.component.html',
  styleUrls: ['./consejo-detalle.component.scss'],
  standalone: true,
  imports: [CommonModule, IonButton, IonIcon]
})
export class DetalleConsejoComponent {
  
  // 🚦 Angular 22 Signal Input: Recibe obligatoriamente el objeto del consejo seleccionado
  public consejo = input.required<IConsejoData>();

  // ⚡ Estándar Estricto: Nueva función output() libre del prefijo "on"
  public cerrarModal = output<void>();

  constructor() {
    addIcons({ closeCircle });
  }

  notificarCierre() {
    this.cerrarModal.emit();
  }
}
