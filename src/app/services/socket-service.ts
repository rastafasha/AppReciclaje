import { inject, Service, signal } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { environment } from '../../environments/environment';
import { NotificationService } from './notificacion-service';

@Service()
export class SocketService {

    private notificationService = inject(NotificationService);
  private socket!: Socket;
  
  // Signal reactiva para saber en todo momento si el cel está conectado al servidor de Atlas
  public statusConexion = signal<'CONECTADO' | 'DESCONECTADO'>('DESCONECTADO');

  constructor() {
    // Intentamos conectar automáticamente si el usuario ya está logueado al arrancar la app
    const token = localStorage.getItem('token');
    if (token) {
      this.conectarSocket();
    }
  }

  /**
   * 🔌 ABRE EL CANAL ASÍNCRONO MULTIPLATAFORMA CONTRA NODE.JS
   */
  conectarSocket() {
    const token = localStorage.getItem('token');
    if (!token || this.socket?.connected) return;

    console.log('📡 [SOCKET CLIENTE]: Abriendo canal asíncrono con el backend de Atlas...');

    // Inicializamos el socket apuntando a tu puerto real de Node.js
    this.socket = io(environment.apiUrl.replace('/api', ''), {
      transports: ['websocket', 'polling'], // 🚀 Forzamos transporte limpio
      auth: {
        'x-token': token // 🔐 Le pasamos el token en el handshake para tu validarJWT
      },
      forceNew: true,
      reconnectionAttempts: 5,
      timeout: 10000
    });

    // =========================================================================
    // 🎛️ ESCUCHADORES DE HARDWARE NATIVOS DE SOCKET.IO
    // =========================================================================
    this.socket.on('connect', () => {
      console.log('🟢 [SOCKET CONECTADO]: Enlace en tiempo real establecido con éxito.');
      this.statusConexion.set('CONECTADO');
    });

    this.socket.on('disconnect', () => {
      console.log('🔴 [SOCKET DESCONECTADO]: Se perdió la conexión con el servidor.');
      this.statusConexion.set('DESCONECTADO');
    });

    // =========================================================================
    // ♻️ OYENTE DE CAMPAÑA EN TIEMPO REAL (El corazón del requerimiento)
    // =========================================================================
    // Cuando el backend avise que llegó una notificación o se editó una regla:
    this.socket.on('notificacion-recibida', (data: any) => {
      console.log('🔔 [SOCKET EVENTO]: ¡Nueva alerta detectada por red asíncrona!', data);
      
      // 1. Forzamos al NotificationService a refrescar el BehaviorSubject de la campana en el Header
      this.notificationService.actualizarContadorBackend();
      
      // 2. Opcionalmente disparamos el Toast flotante In-App si está navegando
      this.notificationService.checkUnreadNotificationsInApp();
    });
  }

  /**
   * 🚪 DESCONEXIÓN SEGURA (Se llama al hacer Logout)
   */
  desconectarSocket() {
    if (this.socket) {
      console.log('🧼 [SOCKET]: Cerrando canal asíncrono de forma segura por cierre de sesión.');
      this.socket.disconnect();
    }
  }
}
