import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { closeCircle } from 'ionicons/icons';
import { IonButton, IonIcon } from '@ionic/angular';
import { HojaAnimadaComponent } from '../hoja-animada/hoja-animada.component';

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
  imports: [CommonModule, IonButton, IonIcon, HojaAnimadaComponent]
})
export class DetalleConsejoComponent {
  
  // 🚦 Angular 22 Signal Input: Recibe obligatoriamente el objeto del consejo seleccionado
  public consejo = input.required<IConsejoData>();

  // ⚡ Estándar Estricto: Nueva función output() libre del prefijo "on"
  public cerrarModal = output<void>();

  public estadoActual = signal<any>('saludando');

  constructor() {
    addIcons({ closeCircle });
  }

  notificarCierre() {
    this.cerrarModal.emit();
  }
}
