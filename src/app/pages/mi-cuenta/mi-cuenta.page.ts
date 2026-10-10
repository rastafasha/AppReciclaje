// src/app/pages/mi-cuenta/mi-cuenta.page.ts
import { Component, inject, ViewChild, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  notificationsOutline, menuOutline, close, person,
  pencil, createOutline, powerOutline, refreshCircleOutline,
  documentTextOutline, personCircleOutline
} from 'ionicons/icons';
import { IonContent, IonIcon, IonToggle, IonButton, IonModal } from '@ionic/angular';
import { AgregarFamiliarComponent } from '../../components/agregar-familiar/agregar-familiar.component';
import { MenufooterComponent } from '../../shared/menufooter/menufooter.component';
import { HeaderComponent } from '../../shared/header/header.component';
import { AuthService } from '../../services/auth'; // 🚀 Inyectamos tu servicio de autenticación
import { FamiliarService } from '../../services/familiar-service';
import { IFamiliar } from '../../models/familiar.model';
import { SkeletonLoaderComponent } from '../../shared/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-mi-cuenta',
  templateUrl: './mi-cuenta.page.html',
  styleUrls: ['./mi-cuenta.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent,
    IonIcon, IonToggle, IonButton,
    AgregarFamiliarComponent, IonModal, MenufooterComponent, HeaderComponent, SkeletonLoaderComponent]
})
export class MiCuentaPage implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService); // ⚙️ Instanciamos la sesión global
  private familiarService = inject(FamiliarService);

  @ViewChild(IonModal) modal!: IonModal;

  public familiares = signal<IFamiliar[]>([]);
   // 🚦 Signal para inyectarle el familiar al modal cuando presiona el lápiz
  public familiarSeleccionado = signal<IFamiliar | null>(null);

  public isLoading = signal<boolean>(false);

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
      return 'Sin teléfono registrado';
    }
    return user.identificacion;
  });

  constructor() {
    addIcons({
      notificationsOutline, menuOutline, close, person,
      pencil, createOutline, powerOutline, refreshCircleOutline,
      documentTextOutline, personCircleOutline
    });
  }

  ngOnInit() {
    this.cargarFamiliares();
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

  /**
   * ✏️ Abre el Offcanvas en modo edición precargando el familiar seleccionado
   */
  abrirEdicionFamiliar(familiar: IFamiliar) {
    console.log('✏️ Editando familiar seleccionado:', familiar);
    this.familiarSeleccionado.set(familiar); // Guardamos la data en el puente
    this.modal.present(); // Abrimos el offcanvas Binance-style
  }

  /**
   * 🔄 Captura el evento output() cuando el formulario hijo termina en Atlas
   */
  onFamiliarProcesado() {
    this.modal.dismiss(); // Cerramos el modal de forma limpia
    this.familiarSeleccionado.set(null); // Limpiamos el puente
    this.cargarFamiliares(); // ⚡ Recargamos la lista en caliente desde MongoDB
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

  irAlInicio() {
    this.router.navigateByUrl('/inicio');
  }

  irAConsejos() {
    this.router.navigateByUrl('/consejos');
  }
}
