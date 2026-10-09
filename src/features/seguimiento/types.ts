export interface Pagina<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export type EstadoNotificacion = 'PENDIENTE' | 'REINTENTO' | 'ENVIADA' | 'GENERADA' | 'FALLIDA';

export interface Notificacion {
  commandId: string;
  orderId: number;
  tipo: 'CORREO' | 'TICKET_TALLER';
  destinatario: string | null;
  asunto: string;
  mensaje: string;
  estado: EstadoNotificacion;
  occurredAt: string;
  proximoIntento: string;
  procesadaEn: string | null;
  intentos: number;
  ultimoError: string | null;
}

export interface EventoAuditoria {
  eventId: string;
  orderId: number;
  type: string;
  actor: string;
  reason: string | null;
  occurredAt: string;
  status: string;
  total: number;
  source: string;
  correlationId: string | null;
}

export interface FiltrosAuditoria {
  orderId: string;
  actor: string;
  type: string;
  desde: string;
  hasta: string;
}
