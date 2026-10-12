import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonInput, IonButton, IonIcon, IonText, IonCheckbox, IonRouterLink } from '@ionic/angular';
import { HojaAnimadaComponent } from '../../components/hoja-animada/hoja-animada.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    IonContent, IonCheckbox, IonInput, IonButton,
    IonRouterLink, RouterModule,
    HojaAnimadaComponent
]
})
export class LoginPage implements OnInit{
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Formulario reactivo estructurado
  public loginForm: FormGroup = this.fb.group({
    email: ['usuario@reciclaje.com', [Validators.required, Validators.email]],
    password: ['password', [Validators.required, Validators.minLength(6)]],
    recuerdame: [false]
  });

  public errorMessage: string | null = null;

   public estadoActual = signal<any>('saludando');

  ngOnInit() {
    // 2. REHIDRATACIÓN EN FRÍO: Al abrir la app, revisamos si el teléfono guardó un correo previo
    const correoGuardado = localStorage.getItem('usuario_recuerdame');
    if (correoGuardado) {
      this.loginForm.patchValue({
        email: correoGuardado,
        recuerdame: true
      });
    }
  }

 onLogin() {
    if (this.loginForm.invalid) return;

    const { email, password, recuerdame } = this.loginForm.value;

    this.authService.login({ email, password }).subscribe({
      next: (isSuccess) => {
        if (isSuccess) {
          // 3. PERSISTENCIA SEGURA: Si el login es exitoso y el check está marcado, guardamos el correo
          if (recuerdame) {
            localStorage.setItem('usuario_recuerdame', email);
          } else {
            localStorage.removeItem('usuario_recuerdame'); // Lo borra si el usuario se desmarcó
          }

          console.log('✅ Autenticación y perfil sincronizados con Atlas.');
          this.router.navigateByUrl('/bienvenida');
        } else {
          this.errorMessage = 'Credenciales incorrectas o error de usuario';
        }
      },
      error: (err) => {
        this.errorMessage = err.error?.msg || 'Error de conexión con el servidor';
      }
    });
  }


}
