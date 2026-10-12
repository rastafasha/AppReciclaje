import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonInput, IonButton } from '@ionic/angular';
import { UserService } from '../../services/user';
import { AuthService } from '../../services/auth';
import { HojaAnimadaComponent } from '../../components/hoja-animada/hoja-animada.component';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonContent, IonInput, IonButton, HojaAnimadaComponent]
})
export class RegisterPage {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private userService = inject(UserService);
  private authService = inject(AuthService);

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
    // 1. Freno de mano si el formulario es inválido
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    console.log('🚀 Enviando datos de registro a Node.js:', this.registerForm.value);

    // 2. Pasamos el valor del formulario a tu servicio
    this.userService.crearUsuario(this.registerForm.value).subscribe({
      next: (resp: any) => {
        if (resp.ok) {
          console.log('✅ Usuario y Perfil creados con éxito en Atlas:', resp);

          // 3. Si tu backend genera el token en el registro, lo guardamos de una vez
          if (resp.token) {
            this.authService.setSession(resp.token);

            // Al ser un usuario nuevo, 'profile_complete' se inicializa en false 
            // porque aún debe pasar por el flujo de bienvenida/onboarding
            localStorage.setItem('profile_complete', 'false');

            // Lo mandamos a la pantalla de Bienvenida para que conozca el reto
            this.router.navigate(['/bienvenida']);
          } else {
            // Si no genera token inmediato, lo redirigimos al login con un aviso
            this.router.navigate(['/login']);
          }
        }
      },
      error: (err) => {
        console.error('❌ Error al registrar el usuario:', err);
        // Aquí puedes disparar un Toast de Ionic o alerta con err.error.msg
      }
    });
  }

  irAlLogin() {
    this.router.navigateByUrl('/login');
  }
}
