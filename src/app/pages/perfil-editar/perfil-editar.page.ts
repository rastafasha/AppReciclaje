import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { addIcons } from 'ionicons';
import { notificationsOutline, menuOutline, chevronBackOutline } from 'ionicons/icons';
import { IonContent, IonButton, IonIcon, IonInput } from '@ionic/angular';
import { HeaderComponent } from '../../shared/header/header.component';

@Component({
  selector: 'app-perfil-editar',
  templateUrl: './perfil-editar.page.html',
  styleUrls: ['./perfil-editar.page.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonContent,
     IonButton, IonIcon, IonInput, RouterModule, HeaderComponent]
})
export class PerfilEditarPage {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  // 🚦 Angular 22 Signals: Mapean reactivamente la tarjeta superior del Figma
  public username = signal<string>('Nombre de Usuario');
  public email = signal<string>('usuario@correo.com');
  public phone = signal<string>('1234567899');
  public avatarPreview = signal<string>('assets/icon/avatar-placeholder.png'); // Asegúrate de tener un icono gris de usuario plano

  public perfilForm: FormGroup = this.fb.group({
    first_name: ['', [Validators.required]],
    last_name: ['', [Validators.required]],
    phone_office: [''],
    phone_mobile: ['', [Validators.required]]
  });

  constructor() {
    addIcons({ notificationsOutline, menuOutline, chevronBackOutline });
    
    // Simulación: Inyectamos los datos del seeder en las Signals al inicializar
    // Cuando acoples el AuthService, leerás: this.username.set(this.authService.usuarioActual.username)
    this.username.set('reciclador_pro');
    this.email.set('usuario@reciclaje.com');
    this.phone.set('04241874370');
  }

  dispararSelectorArchivo() {
    console.log('📸 Abriendo carrete/cámara del dispositivo para subir a /api/uploads/perfiles');
    // Aquí invocarás tu lógica de carga de imágenes en Render / Cloudinary
  }

  guardarCambiosPerfil() {
    this.router.navigateByUrl('/inicio');
    // if (this.perfilForm.invalid) return;
    console.log('💾 Guardando cambios extendidos en MongoDB:', this.perfilForm.value);
    
    // Actualizamos la Signal de teléfono al vuelo para reflejar el cambio en caliente
    this.phone.set(this.perfilForm.value.phone_mobile);
    
    // Regresamos al menú inicial tras guardar con éxito
    // this.router.navigateByUrl('/bienvenida');
    
  }

  volverAtras() {
    this.router.navigateByUrl('/bienvenida');
  }
}
