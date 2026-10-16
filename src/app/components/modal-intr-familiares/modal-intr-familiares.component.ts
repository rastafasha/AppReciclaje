import { CommonModule } from '@angular/common';
import { Component, input, OnInit, output } from '@angular/core';
import { IonModal } from '@ionic/angular';

@Component({
  selector: 'app-modal-intr-familiares',
  templateUrl: './modal-intr-familiares.component.html',
  styleUrls: ['./modal-intr-familiares.component.scss'],
  imports: [CommonModule, IonModal]
})
export class ModalIntrFamiliaresComponent   {

  // 🚦 Recibe el estado booleano de apertura desde el padre
  public isOpen = input<boolean>(false);

  // ⚡ Emite el evento de cierre hacia el padre
  public cerrar = output<void>();

  notificarCierre() {
    this.cerrar.emit();
  }

}
