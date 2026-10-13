import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonInput, IonButton, IonIcon, IonText, IonCheckbox, IonRouterLink, LoadingController } from '@ionic/angular';
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
  private loadingCtrl = inject(LoadingController);

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

  this.errorMessage = null; // Limpiamos rastros de errores anteriores

  // 1. Extraemos los valores de forma directa y segura del Form Control
  const emailVal = this.loginForm.get('email')?.value;
  const passwordVal = this.loginForm.get('password')?.value;
  // Forzamos a que evalúe el booleano real del checkbox de Ionic
  const recuerdameVal = !!this.loginForm.get('recuerdame')?.value;

  // Presentamos el loader para congelar la pantalla mientras viaja a Node.js
  this.loadingCtrl.create({
    message: 'Ingresando al Reto...',
    spinner: 'crescent'
  }).then(async (loader) => {
    await loader.present();

    // Enviamos el payload limpio al AuthService
    this.authService.login({ email: emailVal, password: passwordVal }).subscribe({
      next: (isSuccess) => {
        loader.dismiss();

        if (isSuccess) {
          // 6. PERSISTENCIA SEGURA ELECTRÓNICA:
          // Validamos contra nuestra variable booleana directa recuerdameVal
          if (recuerdameVal) {
            console.log('💾 Check "Recordarme" activo. Guardando correo en LocalStorage:', emailVal);
            localStorage.setItem('usuario_recuerdame', emailVal.trim());
          } else {
            console.log('🧼 Check "Recordarme" apagado. Limpiando LocalStorage.');
            localStorage.removeItem('usuario_recuerdame');
          }

          console.log('✅ Autenticación y perfil sincronizados con Atlas.');
          this.router.navigateByUrl('/bienvenida');
        } else {
          this.errorMessage = 'Credenciales incorrectas o error de usuario';
        }
      },
      error: (err) => {
        loader.dismiss();
        this.errorMessage = err.error?.msg || 'Error de conexión con el servidor';
      }
    });
  });
}


}
