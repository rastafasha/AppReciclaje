// 1. Importamos la función nativa output en lugar de EventEmitter
import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { addIcons } from 'ionicons';
import { closeCircle, person, close } from 'ionicons/icons';
import { IonButton, IonIcon, IonInput, IonSelect, IonSelectOption } from '@ionic/angular';

@Component({
  selector: 'app-agregar-familiar',
  templateUrl: './agregar-familiar.component.html',
  styleUrls: ['./agregar-familiar.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonButton, IonIcon, IonInput, IonSelect, IonSelectOption]
})
export class AgregarFamiliarComponent {
  private fb = inject(FormBuilder);

  // 🚀 MODERNIZADO: Nueva función output() libre del prefijo conflictivo "on"
  public cerrarModal = output<void>();

  public familiarForm: FormGroup = this.fb.group({
    nombre: ['Familiar Usuario', [Validators.required]],
    apellido: ['', [Validators.required]],
    parentezco: ['ESPOSA', [Validators.required]]
  });

  constructor() {
    addIcons({ closeCircle, person, close });
  }

  guardarFamiliar() {
    if (this.familiarForm.invalid) return;
    console.log('👪 Guardando familiar modular en la lista:', this.familiarForm.value);
    
    // ⚡ Emitimos el evento llamando al método emit() nativo
    this.cerrarModal.emit();
  }

  notificarCierre() {
    this.cerrarModal.emit();
  }
}
