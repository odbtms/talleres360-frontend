import { formatDate, formatMoney } from '../../../utils/format';
import { EVENTOS } from '../constants';
import '../auditoria.css';

interface Evento {
  eventId: string; orderId: number; type: string; actor: string;
  occurredAt: string; status: string; total: number;
  reason?: string | null; source?: string;
}

const ESTADOS: Readonly<Record<string, string>> = {
  RECIBIDA: 'Recibida', ACEPTADA: 'Aceptada', EN_REPARACION: 'En reparación', EN_PREPARACION: 'En preparación',
  LISTA_PARA_ENTREGA: 'Lista para retirar', ENTREGADA: 'Entregada', CANCELADA: 'Rechazada',
};

/** El resumen evita duplicar el estado; los datos completos siguen disponibles por evento. */
export default function ListaAuditoria({ eventos }: { eventos: readonly Evento[] }) {
  return <ol className="auditoria-lista">{eventos.map(evento => <li key={evento.eventId}>
    <details className="auditoria-evento">
      <summary>
        <span className="auditoria-orden">#{evento.orderId}</span>
        <span className="auditoria-resumen"><strong>{EVENTOS[evento.type] ?? 'Evento registrado'}</strong>
          <span className="auditoria-actor" title={evento.actor}>{evento.actor}</span></span>
        <time dateTime={evento.occurredAt}>{formatDate(evento.occurredAt)}</time>
        <span className="auditoria-abrir" aria-hidden="true">Detalles</span>
      </summary>
      <dl className="auditoria-detalle">
        <dt>Usuario</dt><dd>{evento.actor}</dd>
        <dt>Estado</dt><dd>{ESTADOS[evento.status] ?? evento.status.replaceAll('_', ' ')}</dd>
        <dt>Total registrado</dt><dd>{formatMoney(evento.total)}</dd>
        {evento.reason && <><dt>Motivo</dt><dd>{evento.reason}</dd></>}
        <dt>ID del evento</dt><dd>{evento.eventId}</dd>
        <dt>Tipo registrado</dt><dd>{evento.type}</dd>
        {evento.source && <><dt>Origen</dt><dd>{evento.source}</dd></>}
      </dl>
    </details>
  </li>)}</ol>;
}
