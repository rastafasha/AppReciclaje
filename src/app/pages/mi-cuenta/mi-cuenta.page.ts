// src/app/pages/mi-cuenta/mi-cuenta.page.ts
import { Component, inject, ViewChild, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  notificationsOutline, menuOutline, close, person,
  pencil, createOutline, powerOutline, refreshCircleOutline,
  documentTextOutline, personCircleOutline,
  closeCircle
} from 'ionicons/icons';
import { IonContent, IonIcon, IonToggle, IonModal, ToastController } from '@ionic/angular';
import { AgregarFamiliarComponent } from '../../components/agregar-familiar/agregar-familiar.component';
import { MenufooterComponent } from '../../shared/menufooter/menufooter.component';
import { HeaderComponent } from '../../shared/header/header.component';
import { AuthService } from '../../services/auth'; // 🚀 Inyectamos tu servicio de autenticación
import { FamiliarService } from '../../services/familiar-service';
import { IFamiliar } from '../../models/familiar.model';
import { SkeletonLoaderComponent } from '../../shared/skeleton-loader/skeleton-loader.component';
import { NotificationService } from '../../services/notificacion-service';
import { ImagenPipe } from '../../pipes/imagen.pipe';

@Component({
  selector: 'app-mi-cuenta',
  templateUrl: './mi-cuenta.page.html',
  styleUrls: ['./mi-cuenta.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent,
    IonIcon, IonToggle,
    AgregarFamiliarComponent, IonModal, MenufooterComponent, HeaderComponent,
    SkeletonLoaderComponent, ImagenPipe]
})
export class MiCuentaPage implements OnInit {
  private router = inject(Router);
  public authService = inject(AuthService); // ⚙️ Instanciamos la sesión global
  private familiarService = inject(FamiliarService);
  private notificationService = inject(NotificationService); // ⚙️ Instanciamos el servicio Push
  private toastController = inject(ToastController); // ⚙️ Instanciamos el manejador de alertas


  @ViewChild(IonModal) modal!: IonModal;

  public familiares = signal<IFamiliar[]>([]);
  // 🚦 Signal para inyectarle el familiar al modal cuando presiona el lápiz
  public familiarSeleccionado = signal<IFamiliar | null>(null);

  public isLoading = signal<boolean>(false);
  // 🚦 Signal independiente para controlar el estado de carga del botón Push
  public isPushLoading = signal<boolean>(false);
  public modalAbierto = signal<boolean>(false);

  public mostrarBannerFamiliares = signal<boolean>(localStorage.getItem('hide_family_banner') !== 'true');

  public imgTemp = signal<string | ArrayBuffer | null>(null);
  public avatarUrl = signal<string>('');

  // 🚀 SIGNAL MAESTRA: Sostendrá el estado real del interruptor en la interfaz
  public notificacionesActivas = signal<boolean>(false);

  // 🚦 Signals computados reactivos para pintar la tarjeta superior del Figma
  public nombreUsuario = computed(() => {
    const user = this.authService.usuarioActual();

    // 1. Si la señal ya se rehidrató desde Atlas, tomamos el valor en caliente
    if (user) {
      return user.profile?.first_name || user.username || 'Usuario';
    }

    // 2. 🛡️ FALLBACK EN FRÍO: Si la señal aún está en null por retraso de red,
    // extraemos temporalmente el nombre del usuario o su correo desde el localStorage
    const tokenToken = localStorage.getItem('token');
    if (tokenToken) {
      // Intentamos recuperar el string de usuario si lo guardaste en disco,
      // o devolvemos un texto genérico de bienvenida para que nunca quede vacío.
      return 'Retador';
    }

    return 'Usuario';
  });

  public email = computed(() => {
    const user = this.authService.usuarioActual();
    return user ? user.email : 'usuario@correo.com';
  });

  public identificacion = computed(() => {
    const user = this.authService.usuarioActual();
    if (!user || !user.identificacion || user.identificacion.trim() === '') {
      return 'Sin identificación registrado';
    }
    return user.identificacion;
  });

  constructor() {
    addIcons({
      notificationsOutline, menuOutline, close, person,
      pencil, createOutline, powerOutline, refreshCircleOutline,
      documentTextOutline, personCircleOutline, closeCircle
    });
  }

  ngOnInit() {
    window.scrollTo(0, 0);
    this.cargarFamiliares();
     // 🚀 REHIDRATACIÓN EN FRÍO: Escuchamos el BehaviorSubject del servicio para encender el switch
    this.notificationService.estaSuscrito$.subscribe((estadoReal) => {
      console.log(`🕵️‍♂️ Sincronizando Switch de Mi Cuenta con SW. Estado: ${estadoReal}`);
      this.notificacionesActivas.set(estadoReal);
    });
    
    // Forzamos al servicio a inspeccionar el hardware del navegador de inmediato
    this.notificationService.verificarEstadoSuscripcion();
  }

  // 3. Añade los dos nuevos métodos al final de tu archivo TS:
  ocultarBannerPermanente() {
    console.log('🙈 Ocultando banner de familiares permanentemente para este usuario.');
    localStorage.setItem('hide_family_banner', 'true');
    this.mostrarBannerFamiliares.set(false);
  }

  compartirAppConFamiliar() {
    console.log('📲 Abriendo Web Share API para invitar a un familiar...');

    const mensajeInvitacion = `¡Hola! Estoy usando la App de Reciclaje de Mercadona / UCC para ganar puntos y premios. ¡Regístrate tú también y salvemos el planeta juntos! ♻️✨`;

    if (navigator.share) {
      navigator.share({
        title: 'Concurso de Reciclaje UCC',
        text: mensajeInvitacion,
        url: window.location.origin // O el enlace real de descarga de tu app/PWA
      }).catch(err => console.log('Error al compartir:', err));
    } else {
      // Fallback si abren desde una PC de escritorio sin Share API (Copiar al portapapeles)
      navigator.clipboard.writeText(mensajeInvitacion);
      console.log('📋 Mensaje copiado al portapapeles para enviar por WhatsApp.');
    }
  }

  /**
   * 📋 Recuperar la lista de familiares desde MongoDB Atlas
   */
  cargarFamiliares() {
    this.isLoading.set(true);
    this.familiarService.obtenerFamiliares().subscribe({
      next: (resp) => {
        if (resp.ok && resp.familiares) {
          // Guardamos la lista en la señal (al venir como array, typescript infiere el tipo)
          this.familiares.set(resp.familiares as any);
          this.isLoading.set(false);
        }
      },
      error: (err) => {
        console.error('❌ Error al listar familiares:', err);
        this.isLoading.set(false);
      }
    });
  }

  /**
   * 🗑️ Ejecutar la eliminación desde un botón de la lista
   */
  eliminarFamiliar(id: string | undefined) {
    if (!id) return;
    this.isLoading.set(true);
    this.familiarService.borrarFamiliar(id).subscribe({
      next: (resp) => {
        if (resp.ok) {
          console.log('✅ Familiar eliminado, recargando lista...');
          this.cargarFamiliares(); // Refrescamos la interfaz al vuelo
        }
      },
      error: (err) => {
        console.error('❌ Error al borrar familiar:', err);
        this.isLoading.set(false);
      }
    });
  }

  abrirModalNuevoFamiliar() {
    console.log('➕ Abriendo modal para nuevo familiar.');
    this.familiarSeleccionado.set(null); // Nos aseguramos que vaya vacío
    this.modalAbierto.set(true); // Encendemos la bandera
  }
  /**
   * ✏️ Abre el Offcanvas en modo edición precargando el familiar seleccionado
   */
  abrirEdicionFamiliar(familiar: IFamiliar) {
    console.log('✏️ Editando familiar seleccionado:', familiar);
    this.familiarSeleccionado.set(familiar); // Inyectamos la data en el puente
    this.modalAbierto.set(true); // Encendemos la bandera
  }

  /**
   * 🔄 Captura el evento output() cuando el formulario hijo termina en Atlas
   */
  onFamiliarProcesado() {
    console.log('✅ Familiar guardado en Atlas con éxito. Limpiando modales...');
    this.modalAbierto.set(false);
    this.familiarSeleccionado.set(null);
    this.cargarFamiliares(); // Recargamos el listado al vuelo
  }

  onModalCerrado() {
    console.log('🧼 Modal cerrado por el usuario. Reseteando señales de control.');
    this.modalAbierto.set(false);
    this.familiarSeleccionado.set(null);
  }
  /**
   * 📲 CORE WEBPUSH: Disparador manual desde el botón de la vista Mi Cuenta
   */
 onToggleNotificaciones(event: any) {
    const estaActivado = event.detail.checked;

    // 🛡️ FILTRO DE SEGURIDAD: Si el switch cambió porque lo rehidratamos en el ngOnInit,
    // frenamos el disparo para evitar bucles infinitos con el servidor.
    if (estaActivado === this.notificationService.estaSuscrito$.value) {
      return;
    }

    if (estaActivado) {
      this.isPushLoading.set(true);
      console.log('🕵️‍♂️ ion-toggle encendido manualmente. Conectando con Atlas...');

      this.notificationService.solicitarPermisoYRegistrarDispositivo().subscribe({
        next: async (resp) => {
          if (resp.ok) {
            console.log('♻️ [WEBPUSH]: Dispositivo enlazado con éxito.');
            this.notificacionesActivas.set(true); // Fija el estado en caliente

            const toast = await this.toastController.create({
              message: '¡Notificaciones activadas con éxito! ♻️',
              duration: 3000,
              position: 'bottom',
              color: 'success',
              icon: 'checkmark-circle-outline'
            });
            await toast.present();
          }
          this.isPushLoading.set(false);
        },
        error: async (err) => {
          console.warn('⚠️ Fallo en el banner VAPID o denegado.', err);
          this.isPushLoading.set(false);
          
          // Forzamos el apagado del control por código debido al rechazo
          this.notificacionesActivas.set(false);
          event.target.checked = false;

          const toastWarning = await this.toastController.create({
            message: 'Permiso denegado o incompatible con el navegador.',
            duration: 3500,
            position: 'bottom',
            color: 'warning',
            icon: 'notifications-off-outline'
          });
          await toastWarning.present();
        }
      });
    } else {
      console.log('🔕 El usuario apagó manualmente el control.');
      // Opcional: Aquí podrías remover la suscripción local del SW si lo requieres
      this.notificacionesActivas.set(false);
      this.notificationService.estaSuscrito$.next(false);
    }
  }


  irANotificaciones() {
    this.router.navigateByUrl('/notificaciones');
  }

  irAEditarPerfil() {
    this.router.navigateByUrl('/perfil-editar');
  }

  /**
   * 🚪 Cierre de Sesión Seguro y Unificado
   */
  cerrarSesion() {
    console.log('🚪 Destruyendo x-token local y limpiando estados reactivos.');

    // 🧼 Borramos tokens y limpiamos las Signals en RAM
    this.authService.logout();

    // Sacamos al usuario al Login de inmediato
    this.router.navigateByUrl('/login');
  }

  irACompletarPerfil() {
    this.router.navigateByUrl('/perfil-editar');
  }
}
