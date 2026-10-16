import { Component, computed, effect, inject, input, OnInit, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { addIcons } from 'ionicons';
import { closeCircle, pizza, restaurant, ribbon } from 'ionicons/icons';
import { IonIcon, IonSpinner, ToastController } from '@ionic/angular';
import { MaterialesService } from '../../services/materiales';

@Component({
  selector: 'app-formulario-avance',
  templateUrl: './formulario-avance.component.html',
  styleUrls: ['./formulario-avance.component.scss'],
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, IonIcon,
    IonSpinner,
  ]
})
export class FormularioAvanceComponent implements OnInit {
  private fb = inject(FormBuilder);
  private materialesService = inject(MaterialesService);
  private toastController = inject(ToastController);

  public comidaPreseleccionada = input<string | null>(null);
  public errorMessage: string | null = null;

  // 🚦 Signals de Estado de Carga y Feedback Visual
  public isLoading = signal<boolean>(false);

  public estadoActual = signal<any>('apuntando');

  // Opciones y Signals para la fila de Momento del Hábito
  public opcionesComida = ['DESAYUNO', 'ALMUERZO', 'CENA'];
  public comidaSeleccionada = signal<string>('DESAYUNO'); // Por defecto según tu seeder

  // Opciones y Signals para la fila de Categorías de Alimentos
  public opcionesCategoria = [
    { label: 'Proteínas', valor: 'PROTEINAS' },
    { label: 'Carbohidratos', valor: 'CARBOHIDRATOS' },
    { label: 'Vegetales / Frutas', valor: 'VEGETALES_FRUTAS' } // Exactamente igual a tu .isIn()
  ];
  public categoriaSeleccionada = signal<string>('');


  // ⚡ Estándar de Angular 22: Nueva función output() y nombre limpio sin el prefijo "on"
  public cerrarModal = output<void>();

  public avanceForm: FormGroup = this.fb.group({
    comida: ['DESAYUNO', [Validators.required]],
    categoria: ['', [Validators.required]],
    nombreItem: ['', [Validators.required, Validators.minLength(2)]],
    descripcion: ['', [Validators.required, Validators.minLength(5)]]
  });

  /**
   * 🧠 REGLA DE NEGOCIO COMPUTADA:
   * Filtra el historial de Atlas y extrae un arreglo con las comidas registradas HOY.
   */
  public comidasRegistradasHoy = computed<string[]>(() => {
    // 🚀 AJUSTE: Accedemos al historial a través de la señal reactiva que expone tu servicio
    // (Asegúrate de cambiar '.historial()' por el nombre exacto de la señal de tu arreglo en tu MaterialesService, por ejemplo: '.materiales()')
    const registros = this.materialesService.historial?.() || [];

    // 🧪 LÍNEA TEMPORAL PARA PRUEBAS: Simulamos que hoy es 3 de octubre
    // const hoyStr = "2026-10-03"; 
    const hoyStr = new Date().toISOString().split('T')[0]; // Formato exacto "YYYY-MM-DD"

    return registros
      .filter((reg: any) => {
        if (!reg.createdAt) return false;
        const fechaReg = new Date(reg.createdAt).toISOString().split('T')[0];
        return fechaReg === hoyStr;
      })
      .map((reg: any) => reg.comida.toUpperCase()); // Retorna ej: ['DESAYUNO']
  });

  /**
   * 🏆 REGLA DE NEGOCIO: ¿Ya completó las 3 comidas del día?
   */
  public retoDelDiaCompletado = computed<boolean>(() => {
    return this.comidasRegistradasHoy().length >= 3;
  });

  constructor() {
    addIcons({ closeCircle, pizza, restaurant, ribbon });

    // 🚀 EL ARREGLO DEFINITIVO: Escucha activa de cambios del Padre
    effect(() => {
      const comidaRecibida = this.comidaPreseleccionada();
      const registradas = this.comidasRegistradasHoy();

      if (comidaRecibida) {
        const comidaElegida = comidaRecibida.toUpperCase();

        if (registradas.includes(comidaElegida)) {
          // Si el botón que pulsó en el Home ya fue registrado, le sugerimos el libre y avisamos
          this.seleccionarPrimerBloqueLibre();
          this.mostrarAvisoCambio();
        } else {
          this.comidaSeleccionada.set(comidaElegida);
          this.avanceForm.patchValue({ comida: comidaElegida });
        }
      } else {
        this.seleccionarPrimerBloqueLibre();
      }
    });
  }

  // 🍞 Función para lanzar el Toast amigable de Ionic
  async mostrarAvisoCambio() {
    const registradas = this.comidasRegistradasHoy();
    let sugerencia = 'tu próximo bloque libre';

    // Calculamos qué sugerencia darle textualmente
    if (!registradas.includes('DESAYUNO')) sugerencia = 'el Desayuno 🍳';
    else if (!registradas.includes('ALMUERZO')) sugerencia = 'el Almuerzo 🍽';
    else if (!registradas.includes('CENA')) sugerencia = 'la Cena 🌙';

    const toast = await this.toastController.create({
      message: `💡 Ese bloque ya está registrado. Te sugerimos seguir el orden con ${sugerencia}, pero puedes elegir otra opción libre si te saltaste una comida.`,
      duration: 4000,
      position: 'top', // Lo ponemos arriba para que no tape el formulario
      color: 'warning', // Color amarillo/naranja de advertencia amigable
      buttons: [
        {
          text: 'OK',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }

  ngOnInit() {
    this.seleccionarPrimerBloqueLibre();
  }

  /**
   * ⚙️ Lógica de asistencia: Pre-selecciona automáticamente el globo disponible
   */
  seleccionarPrimerBloqueLibre() {
    const registradas = this.comidasRegistradasHoy(); // Ej: ['DESAYUNO', 'ALMUERZO']

    // Busca el primer bloque en orden secuencial que NO haya sido registrado hoy
    const proximaComidaLibre = this.opcionesComida.find(comida => !registradas.includes(comida));

    if (proximaComidaLibre) {
      this.comidaSeleccionada.set(proximaComidaLibre);
      this.avanceForm.patchValue({ comida: proximaComidaLibre });
    } else {
      // Si ya registró las 3 comidas del día
      this.comidaSeleccionada.set('CENA');
      this.avanceForm.patchValue({ comida: 'CENA' });
    }
  }


  // Asigna de forma reactiva la comida elegida en los globos si no es un duplicado
  seleccionarComida(opcion: string) {
    // 🚫 VALIDACIÓN: Si la comida ya fue registrada hoy, ignoramos el clic por completo
    if (this.comidasRegistradasHoy().includes(opcion.toUpperCase())) {
      this.errorMessage = `La comida "${opcion}" ya fue registrada el día de hoy.`;
      return;
    }

    // Si está limpia, limpiamos cualquier error previo y procedemos a asignarla
    this.errorMessage = null;
    this.comidaSeleccionada.set(opcion);
    this.avanceForm.patchValue({ comida: opcion });
  }

  // Asigna de forma reactiva la categoría elegida en los globos
  seleccionarCategoria(valor: string) {
    this.categoriaSeleccionada.set(valor);
    this.avanceForm.patchValue({ categoria: valor });
  }

  onAgregarAvance() {
    if (this.avanceForm.invalid) {
      this.avanceForm.markAllAsTouched();
      return;
    }

    this.errorMessage = null;
    this.isLoading.set(true);

    this.materialesService.crearEntrega(this.avanceForm.value).subscribe({
      next: (resp) => {
        console.log('✅ Hábito guardado con éxito en MongoDB Atlas:', resp);

        // Recargamos el historial global del servicio para que se actualicen los computados
        this.materialesService.getHistorial().subscribe(() => {
          this.isLoading.set(false);
          this.cerrarModal.emit();
        });
      },
      error: (err) => {
        this.errorMessage = err.error?.msg || 'Error al conectar con el servidor ecológico';
        this.isLoading.set(false);
      }
    });
  }

  notificarCierre() {
    this.cerrarModal.emit();
  }
}
