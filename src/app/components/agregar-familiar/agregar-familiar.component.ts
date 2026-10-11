// src/app/components/agregar-familiar/agregar-familiar.component.ts
import { Component, effect, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {  IonIcon, } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { closeCircle } from 'ionicons/icons';
import { FamiliarService } from '../../services/familiar-service';

@Component({
  selector: 'app-agregar-familiar',
  templateUrl: './agregar-familiar.component.html',
  styleUrls: ['./agregar-familiar.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,  IonIcon]
})
export class AgregarFamiliarComponent {
  private fb = inject(FormBuilder);
  private familiarService = inject(FamiliarService);

  // 🚦 API input() de Angular 22: Recibe la data desde MiCuentaPage para activar la edición
  public familiarAEditar = input<any | null>(null);

  public cerrarModal = output<void>();
  public familiarAgregado = output<void>();

  // 🚦 Listado de opciones fijas para renderizar los globos
  public opcionesParentesco = [
    'Esposa / Esposo',
    'Hijo / Hija',
    'Padre / Madre',
    'Hermano / Hermana'
  ];

  // 🚦 Signal para controlar cuál globo está seleccionado visualmente
  public parentescoSeleccionado = signal<string>('');

  constructor() {
    addIcons({ closeCircle });

    // 🧠 EFFECT REACTIVO: Escucha en tiempo real si el input 'familiarAEditar' cambia
    effect(() => {
      const familiar = this.familiarAEditar();
      
      if (familiar) {
        console.log('✏️ Componente en Modo Edición. Cargando datos:', familiar);
        
        // Mapeamos las llaves físicas que vengan de tu base de datos (first_name o nombre)
        this.familiarForm.patchValue({
          nombre: familiar.nombre || familiar.first_name || '',
          apellido: familiar.apellido || familiar.last_name || '',
          parentesco: familiar.parentesco || ''
        });

        // Activamos visualmente el globo correspondiente
        this.parentescoSeleccionado.set(familiar.parentesco || '');
      } else {
        // Si es null, nos aseguramos de que el formulario empiece completamente limpio
        this.familiarForm.reset();
        this.parentescoSeleccionado.set('');
      }
    });
  }

  public familiarForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required]],
    apellido: ['', [Validators.required]],
    parentesco: ['', [Validators.required]] // Este campo se llenará con la Signal
  });

  // Método que se dispara al tocar un globo
  seleccionarParentesco(opcion: string) {
    this.parentescoSeleccionado.set(opcion);
    this.familiarForm.patchValue({ parentesco: opcion });
  }

  guardarFamiliar() {
    if (this.familiarForm.invalid) {
      this.familiarForm.markAllAsTouched();
      return;
    }

    const familiarData = this.familiarAEditar();

    // 🔄 BIFURCACIÓN DE FLUJO: ¿Estamos editando o creando uno nuevo?
    if (familiarData && familiarData.id) {
      console.log('🔄 Actualizando familiar existente en Atlas con ID:', familiarData.id);
      
      // Adaptamos el body mapeando 'nombre' como 'first_name' y 'apellido' como 'last_name' según tu backend
      const payloadActualizar = {
        nombre: this.familiarForm.value.nombre,
        apellido: this.familiarForm.value.apellido,
        parentesco: this.familiarForm.value.parentesco
      };

      this.familiarService.actualizarFamiliar(familiarData.id, payloadActualizar).subscribe({
        next: (resp) => {
          if (resp.ok) {
            console.log('✅ Familiar actualizado correctamente en MongoDB:', resp.msg);
            this.finalizarFlujo();
          }
        },
        error: (err) => console.error('❌ Error al actualizar familiar:', err)
      });

    } else {
      // 🆕 FLUJO ORIGINAL: Creación de un familiar nuevo
      console.log('🚀 Enviando nuevo familiar a la colección independiente de Atlas:', this.familiarForm.value);
      
      // Ajustamos el payload de creación por si tu backend espera first_name/last_name
      const payloadCrear = {
        nombre: this.familiarForm.value.nombre,
        apellido: this.familiarForm.value.apellido,
        parentesco: this.familiarForm.value.parentesco
      };

      this.familiarService.crearFamiliar(payloadCrear).subscribe({
        next: (resp) => {
          if (resp.ok) {
            console.log('✅ Familiar guardado exitosamente en MongoDB:', resp.msg);
            this.finalizarFlujo();
          }
        },
        error: (err) => console.error('❌ Error al guardar el familiar:', err)
      });
    }
  }

 private finalizarFlujo() {
  this.familiarForm.reset();
  this.parentescoSeleccionado.set('');
  
  // ⚡ Esto le avisa al padre que limpie los estados y refresque la lista de Atlas
  this.familiarAgregado.emit(); 
}
  

  notificarCierre() {
    this.cerrarModal.emit();
  }
}
