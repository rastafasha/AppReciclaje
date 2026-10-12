import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonButton, IonContent, IonHeader, IonInput, IonSpinner, IonTitle, IonToolbar } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';
import { HojaAnimadaComponent } from '../../components/hoja-animada/hoja-animada.component';

@Component({
  selector: 'app-recuperar-password',
  templateUrl: './recuperar-password.page.html',
  styleUrls: ['./recuperar-password.page.scss'],
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, RouterModule,
    IonContent, IonInput, IonButton, IonSpinner, HojaAnimadaComponent
  ]
})
export class RecuperarPasswordPage  {

 private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);

  public recoverForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  public isLoading: boolean = false;
  public errorMessage: string | null = null;
  public isSuccess: boolean = false; // Controla si ya se disparó el token a Atlas con éxito

  onRecover() {
    if (this.recoverForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = null;

    const { email } = this.recoverForm.value;
    const apiUrl = `${environment.apiUrl}/usuarios/user_token/set/${email}`; // Ajusta según tu ruta de Node

    this.http.post(apiUrl, { email }).subscribe({
      next: () => {
        this.isLoading = false;
        this.isSuccess = true;
        console.log('🔐 Controlador de Node inyectó el token de restauración de forma exitosa.');
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.msg || 'El correo ingresado no pertenece a ningún retador activo.';
      }
    });
  }

  volverAlLogin() {
    this.router.navigateByUrl('/login');
  }

}
