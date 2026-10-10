import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { INotificacion } from '../../models/notificacion.model';
import { addIcons } from 'ionicons';
import { closeCircle } from 'ionicons/icons';
import { IonButton} from '@ionic/angular';

@Component({
  selector: 'app-notificacion-detalle',
  templateUrl: './notificacion-detalle.component.html',
  styleUrls: ['./notificacion-detalle.component.scss'],
  standalone: true, // 🚀 Nos aseguramos de que declare formalmente que es Standalone
  imports: [CommonModule, IonButton]
})
export class NotificacionDetalleComponent {

  // 🚦 CORREGIDO: Cambiamos 'listaAlertas' de tipo array por 'notificacion' de tipo objeto único
  public notificacion = input.required<INotificacion>();

  // ⚡ Estándar Estricto: Nueva función de salida output() nativa libre de prefijos prohibidos
  public cerrarModal = output<void>();

  constructor() {
    addIcons({ closeCircle });
  }

  notificarCierre() {
    // ⚡ Emitimos la señal limpia hacia la página padre para indicarle a Mamp/Render que baje el panel
    this.cerrarModal.emit();
  }
}
