import { Component, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { addIcons } from 'ionicons';
import { closeCircle, pizza, refreshCircleOutline, restaurant, ribbon } from 'ionicons/icons';
import { IonButton, IonIcon, IonInput, IonTextarea, IonSpinner } from '@ionic/angular';
import { MaterialesService } from '../../services/materiales';
import { HojaAnimadaComponent } from '../hoja-animada/hoja-animada.component';

@Component({
  selector: 'app-formulario-avance',
  templateUrl: './formulario-avance.component.html',
  styleUrls: ['./formulario-avance.component.scss'],
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    IonButton, IonIcon, IonInput, IonTextarea,
    IonSpinner,
    HojaAnimadaComponent
]
})
export class FormularioAvanceComponent {
  private fb = inject(FormBuilder);
  private materialesService = inject(MaterialesService);
  public errorMessage: string | null = null;
  
  // 🚦 Signals de Estado de Carga y Feedback Visual
  public isLoading = signal<boolean>(false);

  public estadoActual = signal<any>('apuntando');
  
  // Opciones y Signals para la fila de Momento del Hábito
  public opcionesComida = ['DESAYUNO', 'ALMUERZO', 'CENA'];
  public comidaSeleccionada = signal<string>('DESAYUNO'); // Por defecto según tu seeder

  // Opciones y Signals para la fila de Categorías de Alimentos
  public opcionesCategoria = ['Proteínas', 'Carbohidratos', 'Vegetales / Frutas'];
  public categoriaSeleccionada = signal<string>('');
  

  // ⚡ Estándar de Angular 22: Nueva función output() y nombre limpio sin el prefijo "on"
  public cerrarModal = output<void>();

  public avanceForm: FormGroup = this.fb.group({
    comida: ['DESAYUNO', [Validators.required]],
    categoria: ['', [Validators.required]],
    nombreItem: ['', [Validators.required, Validators.minLength(2)]],
    descripcion: ['', [Validators.required, Validators.minLength(5)]]
  });

  constructor() {
    addIcons({ closeCircle, pizza, restaurant, ribbon, refreshCircleOutline });
  }

  // Asigna de forma reactiva la comida elegida en los globos
  seleccionarComida(opcion: string) {
    this.comidaSeleccionada.set(opcion);
    this.avanceForm.patchValue({ comida: opcion });
  }

  // Asigna de forma reactiva la categoría elegida en los globos
  seleccionarCategoria(opcion: string) {
    this.categoriaSeleccionada.set(opcion);
    this.avanceForm.patchValue({ categoria: opcion });
  }

 onAgregarAvance() {
    if (this.avanceForm.invalid) {
      this.avanceForm.markAllAsTouched();
      return;
    }

    this.errorMessage = null;
    this.isLoading.set(true); // 🚀 Encendemos el spinner del botón

    console.log('🚀 Enviando registro diario a Node.js:', this.avanceForm.value);

    this.materialesService.crearEntrega(this.avanceForm.value).subscribe({
      next: (resp) => {
        console.log('✅ Hábito guardado con éxito en MongoDB Atlas:', resp);
        
        // Limpiamos el formulario y reseteamos los globos
        this.avanceForm.reset({ comida: 'DESAYUNO', categoria: '' });
        this.comidaSeleccionada.set('DESAYUNO');
        this.categoriaSeleccionada.set('');
        
        this.isLoading.set(false); // Apagamos el loading
        this.cerrarModal.emit();
      },
      error: (err) => {
        // Captura el error 400 del índice único si el usuario intenta duplicar comida hoy
        this.errorMessage = err.error?.msg || 'Error al conectar con el servidor ecológico';
        this.isLoading.set(false); // 🛡️ Apagamos el loading para permitir corregir
      }
    });
  }

  notificarCierre() {
    this.cerrarModal.emit();
  }
}
