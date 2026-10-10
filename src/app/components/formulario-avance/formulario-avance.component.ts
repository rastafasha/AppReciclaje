import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { addIcons } from 'ionicons';
import { closeCircle, pizza, restaurant, ribbon } from 'ionicons/icons';
import { IonButton, IonIcon, IonInput, IonSelect, IonSelectOption, IonTextarea } from '@ionic/angular';
import { MaterialesService } from '../../services/materiales';

@Component({
  selector: 'app-formulario-avance',
  templateUrl: './formulario-avance.component.html',
  styleUrls: ['./formulario-avance.component.scss'],
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, 
    IonButton, IonIcon, IonInput, IonSelect, IonSelectOption, IonTextarea
  ]
})
export class FormularioAvanceComponent {
  private fb = inject(FormBuilder);
  private materialesService = inject(MaterialesService);
  public errorMessage: string | null = null;

  // ⚡ Estándar de Angular 22: Nueva función output() y nombre limpio sin el prefijo "on"
  public cerrarModal = output<void>();

  public avanceForm: FormGroup = this.fb.group({
    comida: ['DESAYUNO', [Validators.required]],
    categoria: ['', [Validators.required]],
    nombreItem: ['', [Validators.required, Validators.minLength(2)]],
    descripcion: ['', [Validators.required, Validators.minLength(5)]]
  });

  constructor() {
    addIcons({ closeCircle, pizza, restaurant, ribbon });
  }

  onAgregarAvance() {
    if (this.avanceForm.invalid) return;

    this.errorMessage = null;

    // ⚡ CONEXIÓN REAL: Despachamos el objeto hacia tu endpoint Node.js en Render
    this.materialesService.crearEntrega(this.avanceForm.value).subscribe({
      next: (resp) => {
        console.log('✅ Hábito guardado con éxito en MongoDB Atlas:', resp);
        this.avanceForm.reset({ comida: 'DESAYUNO', categoria: '' }); // Limpiamos campos
        this.cerrarModal.emit(); // Ocultamos el panel inferior automáticamente
      },
      error: (err) => {
        // Atrapamos el bloqueo de duplicados si intenta registrar dos desayunos el mismo día
        this.errorMessage = err.error?.msg || 'Error al conectar con el servidor ecológico';
      }
    });
  }

  notificarCierre() {
    this.cerrarModal.emit();
  }
}
