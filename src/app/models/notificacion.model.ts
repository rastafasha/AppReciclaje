export type TipoNotificacion = 'SORTEO' | 'PREMIO_MERCADONA' | 'MANTENIMIENTO_PWA' | 'URGENTE' | 'AVISO_GENERAL';
export interface INotificacion {
  _id: string;
  usuario?: string;
  titulo: string;
  mensaje: string;
  tipo: TipoNotificacion;
  leido: boolean;
   urlDestino?: string;
  createdAt: string;
}




export interface NotificationResponse {
  ok: boolean;
  msg?: string;
  alertas?: INotificacion[];
}
