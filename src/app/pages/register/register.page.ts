import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonInput, IonButton } from '@ionic/angular';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonContent, IonInput, IonButton]
})
export class RegisterPage {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  // 🚦 Angular 22 Signal para controlar el Stepper del Figma
  public pasoActual = signal<number>(1);

  public registerForm: FormGroup = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    identificacion: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  });

  irAlPaso(paso: number) {
    // Si intentas ir al paso 2, validamos que los dos primeros campos estén llenos
    if (paso === 2 && (this.registerForm.get('username')?.invalid || this.registerForm.get('identificacion')?.invalid)) {
      this.registerForm.get('username')?.markAsTouched();
      this.registerForm.get('identificacion')?.markAsTouched();
      return;
    }
    this.pasoActual.set(paso);
  }

  onRegistrar() {
    if (this.registerForm.invalid) return;
    console.log('🚀 Enviando datos de reciclaje a Node.js:', this.registerForm.value);
    // Aquí conectarás tu servicio HTTP POST a /api/usuarios/crear
  }

  irAlLogin() {
    this.router.navigateByUrl('/login');
  }
}
