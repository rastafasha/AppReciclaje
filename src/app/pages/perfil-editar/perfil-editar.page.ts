import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { addIcons } from 'ionicons';
import { notificationsOutline, menuOutline, chevronBackOutline } from 'ionicons/icons';
import { IonContent, IonButton, IonIcon, IonInput } from '@ionic/angular';
import { HeaderComponent } from '../../shared/header/header.component';
import { AuthService } from '../../services/auth';
import { UserService } from '../../services/user';
import { ProfileService } from '../../services/profile';

@Component({
  selector: 'app-perfil-editar',
  templateUrl: './perfil-editar.page.html',
  styleUrls: ['./perfil-editar.page.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonContent,
     IonButton, IonIcon, IonInput, RouterModule, HeaderComponent]
})
export class PerfilEditarPage implements OnInit{
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private usuarioService = inject(UserService);
  private profileService = inject(ProfileService);

  // 🚦 Angular 22 Signals: Mapean la interfaz superior leyendo del AuthService
   public username = signal<string>('Cargando...');
  public email = signal<string>('Cargando...');
  public phone = signal<string>('Sin teléfono registrado');
  public avatarPreview = signal<string>('assets/images/default.jpeg');

  public perfilForm: FormGroup = this.fb.group({
    first_name: ['', [Validators.required]],
    last_name: ['', [Validators.required]], // Si tu base de datos no usa last_name, puedes dejarlo opcional
    phone_office: [''],
    phone_mobile: ['', [Validators.required]]
  });

  constructor() {
    addIcons({ notificationsOutline, menuOutline, chevronBackOutline });
  }

  ngOnInit() {
    // 1. Obtenemos el usuario en sesión desde el Signal global
    const usuarioLogueado = this.authService.usuarioActual();

    if (!usuarioLogueado) {
      console.warn('⚠️ No se detectó sesión activa en memoria RAM, abortando al login.');
      this.router.navigateByUrl('/login');
      return;
    }

    // Establecemos los datos básicos de la cuenta que ya conocemos
    this.username.set(usuarioLogueado.username);
    this.email.set(usuarioLogueado.email);

    // 2. 🚀 LLAMADA DIRECTA AL BACKEND: Traemos el perfil fresco de Atlas para rellenar los inputs
    console.log(`🔍 Extrayendo perfil en caliente de Atlas para el UID: ${usuarioLogueado.uid}`);
    
    this.usuarioService.getProfileUsuario(usuarioLogueado.uid).subscribe({
      next: (resp) => {
        if (resp.ok && resp.profile) {
          console.log('📦 Perfil populado recibido de Node.js:', resp.profile);
          const perfil = resp.profile;

          // Rellenamos el formulario reactivo con datos reales de la BD
          this.perfilForm.patchValue({
            first_name: perfil.first_name || usuarioLogueado.username,
            last_name: (perfil as any).last_name || '',
            phone_office: (perfil as any).phone_office || '',
            phone_mobile: (perfil as any).phone_mobile || ''
          });

          // Sincronizamos la señal visual del teléfono de la tarjeta superior
          const celular = (perfil as any).phone_mobile;
          if (celular && celular.trim() !== '') {
            this.phone.set(celular);
          } else {
            this.phone.set('Sin teléfono registrado');
          }
        }
      },
      error: (err) => {
        console.error('❌ Error al conectar con user_profile:', err);
      }
    });
  }

  dispararSelectorArchivo() {
    console.log('📸 Abriendo carrete/cámara del dispositivo para subir a /api/uploads/perfiles');
  }

 guardarCambiosPerfil() {
  if (this.perfilForm.invalid) {
    this.perfilForm.markAllAsTouched();
    return;
  }

  const usuario = this.authService.usuarioActual();
  if (!usuario) return;

  console.log('💾 Enviando payload unificado al backend:', this.perfilForm.value);
  
  // 📦 Construimos el body exacto que espera recibir el validador y el nuevo controlador
  const payloadUnificado = {
    usuario: usuario.uid, 
    first_name: this.perfilForm.value.first_name,
    last_name: this.perfilForm.value.last_name,
    phone_office: this.perfilForm.value.phone_office,
    phone_mobile: this.perfilForm.value.phone_mobile
  };

  // Usamos tu servicio original apuntando a PUT /api/usuarios/editar/:id
 this.profileService.actualizarPerfil(payloadUnificado).subscribe({
  next: (resp: any) => {
    // 🎉 CORREGIDO: Validamos contra 'resp.perfil' que es lo que envía Atlas
    if (resp.ok && resp.perfil) {
      console.log('✅ Perfil actualizado en Atlas con éxito:', resp);
      
      // 1. Refrescamos las Signals locales del componente usando el perfil devuelto
      this.username.set(resp.perfil.first_name);
      if (resp.perfil.phone) {
        this.phone.set(resp.perfil.phone);
      }
      
      // 2. Actualizamos el objeto en memoria RAM del AuthService para mantener la sincronía
      const usuarioActual = this.authService.usuarioActual();
      if (usuarioActual) {
        // Le inyectamos el perfil fresco populado al usuario en sesión
        usuarioActual.profile = resp.perfil;
        this.authService['_usuarioActual'].set({ ...usuarioActual });
      }

      // 3. 💾 FIJAMOS LA BANDERA: Ahora sí se guardará en LocalStorage con éxito
      localStorage.setItem('profile_complete', 'true');
      console.log('💾 profile_complete cambiado a true en LocalStorage.');

      // 4. Movimiento de navegación directo al tablero del Concurso de Reciclaje
      this.router.navigateByUrl('/inicio');
    }
  },
  error: (err) => {
    console.error('❌ Error crítico al actualizar el perfil en el componente:', err);
  }
});

}

  volverAtras() {
    this.router.navigateByUrl('/bienvenida');
  }
}
