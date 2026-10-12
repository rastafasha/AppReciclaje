import { Component, computed, inject, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { addIcons } from 'ionicons';
import { notificationsOutline, menuOutline, chevronBackOutline, cameraOutline } from 'ionicons/icons';
import { IonContent, IonButton, IonInput, IonModal, ToastController, IonIcon, IonSpinner } from '@ionic/angular';
import { HeaderComponent } from '../../shared/header/header.component';
import { AuthService } from '../../services/auth';
import { UserService } from '../../services/user';
import { ProfileService } from '../../services/profile';
import { BackbuttonComponent } from '../../shared/backbutton/backbutton.component';
import { FileUploadService } from '../../services/file-upload.service';
import { ImagenPipe } from '../../pipes/imagen.pipe';

@Component({
  selector: 'app-perfil-editar',
  templateUrl: './perfil-editar.page.html',
  styleUrls: ['./perfil-editar.page.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonContent,
    IonButton, IonInput, RouterModule, HeaderComponent, BackbuttonComponent, ImagenPipe, IonIcon, IonModal, IonSpinner]
})
export class PerfilEditarPage implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  public authService = inject(AuthService);
  private usuarioService = inject(UserService);
  private profileService = inject(ProfileService);
  private fileUploadService = inject(FileUploadService);
  private toastController = inject(ToastController);

  @ViewChild('modalFoto') modalFoto!: IonModal;

  // 🚦 Angular 22 Signals: Mapean la interfaz superior leyendo del AuthService
  public username = signal<string>('Cargando...');
  public email = signal<string>('Cargando...');
  public avatarPreview = signal<string>('assets/images/default.jpeg');

  // 🚦 Signal de Avatar: Guardará el string limpio del nombre del archivo o URL de Cloudinary
  public avatarUrl = signal<string>('');
  
  // 🚦 Signals temporales para el modal de recorte/selección
  public imagenSubir!: File;
  public imgTemp = signal<string | ArrayBuffer | null>(null);
  public cargandoImagen = signal<boolean>(false);


  public identificacion = computed(() => {
    const user = this.authService.usuarioActual();
    if (!user || !user.identificacion || user.identificacion.trim() === '') {
      return 'Sin identificacion registrado';
    }
    return user.identificacion;
  });
  public perfilForm: FormGroup = this.fb.group({
    first_name: ['', [Validators.required]],
    last_name: ['', [Validators.required]], // Si tu base de datos no usa last_name, puedes dejarlo opcional
    phone_office: [''],
    phone_mobile: ['', [Validators.required]]
  });

  constructor() {
    addIcons({ notificationsOutline, menuOutline, chevronBackOutline, cameraOutline });
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
            identificacion: (perfil as any).identificacion || '',
            phone_office: (perfil as any).phone_office || '',
            phone_mobile: (perfil as any).phone_mobile || ''
          });


        }
      },
      error: (err) => {
        console.error('❌ Error al conectar con user_profile:', err);
      }
    });
  }

  dispararSelectorArchivo() {

    const usuarioLogueado = this.authService.usuarioActual();
    if (!usuarioLogueado) return;

    // 1. Creamos un disparador invisible en memoria RAM
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*'; // Solo permitimos formatos de imagen
    fileInput.click(); // Levantamos el selector nativo del celular o PC

    // 2. Escuchamos el microsegundo en el que el usuario elige la foto
    fileInput.onchange = (event: any) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      const archivoSeleccionado: File = files[0];
      this.imagenSubir = archivoSeleccionado; // Guardamos el binario para tu servicio

      // 3. GENERAMOS PREVIEW: Render instantáneo en tu Signal para feedback visual
      const reader = new FileReader();
      reader.readAsDataURL(archivoSeleccionado);
      reader.onloadend = () => {
        this.imgTemp.set(reader.result); // Pinta la foto temporal en el Figma
      };

      // 4. ☁️ SUBIDA A LA NUBE: Consumimos tu servicio real FileUploadService con Fetch
      this.cargandoImagen.set(true);
      
      this.fileUploadService.actualizarFoto(archivoSeleccionado, 'perfiles', usuarioLogueado.uid)
        .then(async (nombreArchivo) => {
          this.cargandoImagen.set(false);
          
          if (nombreArchivo) {
            console.log('✅ Foto guardada exitosamente en Cloudinary. Archivo:', nombreArchivo);
            
            // Sincronizamos tu Signal de avatar con el nombre físico devuelto por Express
            this.avatarUrl.set(nombreArchivo);

            // Sincronizamos dentro del objeto .profile de la sesión global en memoria RAM
            if (usuarioLogueado && usuarioLogueado.profile) {
              if (typeof usuarioLogueado.profile !== 'string') {
                usuarioLogueado.profile.avatar_url = nombreArchivo;
                this.authService['_usuarioActual'].set({ ...usuarioLogueado });
              }
            }

            // Desplegamos un Toast nativo elegante de confirmación
            const toast = await this.toastController.create({
              message: '¡Foto de perfil actualizada correctamente! 📸',
              duration: 3000,
              position: 'bottom',
              color: 'success',
              icon: 'checkmark-circle-outline'
            });
            await toast.present();
          }
        })
        .catch((err) => {
          this.cargandoImagen.set(false);
          console.error('❌ Error crítico al procesar la carga en Cloudinary:', err);
        });
    };
  }


  /**
   * 📸 Intercepta el archivo binario seleccionado desde el hardware del celular
   */
  cambiarImagen(event: any): void {
    const files = event.target.files;
    if (!files || files.length === 0) {
      this.imgTemp.set(null);
      return;
    }

    const file: File = files[0];
    this.imagenSubir = file;

    // Generamos el preview temporal asíncrono para el modal
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      this.imgTemp.set(reader.result);
    };
  }

  /**
   * ☁️ Dispara tu lógica asíncrona fetch hacia el controlador de carga en Node.js
   */
 /**
   * ☁️ Dispara tu carga manual enviando el ID del documento de perfil (o uid según tu backend)
   */
  subirImagen() {
    const usuarioLogueado = this.authService.usuarioActual();
    if (!usuarioLogueado || !this.imagenSubir) return;

    this.cargandoImagen.set(true);
    
    // Pasamos el archivo al FileUploadService apuntando a la carpeta de perfiles en tu backend si aplica, 
    // o reutilizamos 'usuarios' si centralizaste las imágenes allí.
    this.fileUploadService.actualizarFoto(this.imagenSubir, 'perfiles', usuarioLogueado.uid)
      .then(async (nombreArchivo) => {
        this.cargandoImagen.set(false);
        
        if (nombreArchivo) {
          console.log('✅ Foto subida exitosamente a Cloudinary:', nombreArchivo);
          
          // 1. Sincronizamos la Signal local con el nuevo string/URL para refrescar la vista
          this.avatarUrl.set(nombreArchivo);
          
          // 2. 🛡️ REGLA CORE CORREGIDA: Sincronizamos dentro del objeto '.profile' de la sesión global en RAM
          const usuarioData = this.authService.usuarioActual();
          if (usuarioData && usuarioData.profile) {
            if (typeof usuarioData.profile !== 'string') {
              usuarioData.profile.avatar_url = nombreArchivo; // Inyectamos la foto en el hijo profile
              this.authService['_usuarioActual'].set({ ...usuarioData });
            }
          }

          this.modalFoto.dismiss();
          this.imgTemp.set(null);

          const toast = await this.toastController.create({
            message: 'Foto de perfil actualizada correctamente 📸',
            duration: 3000,
            position: 'bottom',
            color: 'success'
          });
          await toast.present();
        }
      })
      .catch((err) => {
        this.cargandoImagen.set(false);
        console.error('❌ Error al procesar la carga multimedia:', err);
      });
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

}
