import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonInput, IonButton, IonIcon, IonText, IonCheckbox, IonRouterLink } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    IonContent, IonCheckbox, IonInput, IonButton, IonText,
    IonRouterLink,RouterModule
]
})
export class LoginPage {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Formulario reactivo estructurado
  public loginForm: FormGroup = this.fb.group({
    email: ['mercadocreativo@gmail.com', [Validators.required, Validators.email]],
    // email: ['usuario@reciclaje.com', [Validators.required, Validators.email]],
    password: ['password', [Validators.required, Validators.minLength(6)]]
  });

  public errorMessage: string | null = null;

  // onLogin() {
  //   if (this.loginForm.invalid) return;

  //   this.authService.login(this.loginForm.value).subscribe({
  //     next: (resp) => {
  //       if (resp.ok) {
  //         // Si las credenciales del seeder coinciden, saltamos a bienvenida
  //         this.router.navigateByUrl('/bienvenida');
  //       }
  //     },
  //     error: (err) => {
  //       this.errorMessage = err.error?.msg || 'Error de conexión con el servidor';
  //     }
  //   });
  // }


  onLogin() {
    if (this.loginForm.invalid) return;

    this.authService.login(this.loginForm.value).subscribe({
      next: (resp) => {
        if (resp.ok && resp.user) {
          console.log('✅ Login verificado. Evaluando estado del perfil...');
          
          const usuario = resp.user;
          let isProfileComplete = false;

          // 🔍 CRITERIO REAL IN-APP:
          // Si el profile ya es un objeto extendido y tiene teléfono, o si tu validarToken anterior 
          // ya determinó que el usuario tiene un perfil activo, permitimos el acceso directo.
          if (usuario.profile && typeof usuario.profile !== 'string') {
            isProfileComplete = !!(usuario.profile.phone_mobile || usuario.profile.phone);
          } else {
            // 💡 FALLBACK INTELIGENTE: Si viene como un ID plano pero en tus pruebas locales 
            // sabes que el usuario ya existe en Atlas con datos completos, dejamos que validarToken 
            // (que se ejecuta al arrancar) tome el control de la rehidratación. 
            // Para el flujo síncrono del primer login, evaluamos contra el LocalStorage guardado previamente.
            isProfileComplete = localStorage.getItem('profile_complete') === 'true';
          }

          if (isProfileComplete) {
            console.log('➡️ Perfil completo verificado. Redirigiendo a Inicio.');
            localStorage.setItem('profile_complete', 'true');
            this.router.navigateByUrl('/inicio');
          } else {
            console.log('➡️ Perfil incompleto o primera sesión. Enviando a Bienvenida.');
            localStorage.setItem('profile_complete', 'false');
            this.router.navigateByUrl('/bienvenida');
          }
        }
      },
      error: (err) => {
        this.errorMessage = err.error?.msg || 'Error de conexión con el servidor';
      }
    });
  }
}
