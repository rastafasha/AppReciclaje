export type TipoNotificacion = 'NUEVO_RECICLAJE' | 'RECOMPENSA_CANJEADA' | 'LOGRO_DESBLOQUEADO' | 'AVISO_GENERAL';

export interface INotificacion {
  id: string;
  usuario?: string;
  titulo: string;
  mensaje: string;
  tipo: TipoNotificacion;
  leido: boolean;
  createdAt: string;
}
