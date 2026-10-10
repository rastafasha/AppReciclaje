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
    email: ['usuario@reciclaje.com', [Validators.required, Validators.email]],
    password: ['password', [Validators.required, Validators.minLength(6)]]
  });

  public errorMessage: string | null = null;

  onLogin() {
    if (this.loginForm.invalid) return;

    this.authService.login(this.loginForm.value).subscribe({
      next: (resp) => {
        if (resp.ok) {
          // Si las credenciales del seeder coinciden, saltamos a bienvenida
          this.router.navigateByUrl('/bienvenida');
        }
      },
      error: (err) => {
        this.errorMessage = err.error?.msg || 'Error de conexión con el servidor';
      }
    });
  }
}
