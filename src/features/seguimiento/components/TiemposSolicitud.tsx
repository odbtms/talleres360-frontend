import { useEffect, useState } from 'react';
import { seguimientoApi } from '../../../api/seguimientoApi';
import { formatDate, formatMinutes } from '../../../utils/format';
import { FILTROS_AUDITORIA } from '../constants';
import type { EventoAuditoria } from '../types';

const HITOS = ['CREADA', 'ENTREGADA', 'CANCELADA'] as const;

export default function TiemposSolicitud({ orderId }: { orderId: number }) {
  const [eventos, setEventos] = useState<EventoAuditoria[] | null>(null);
  const [error, setError] = useState(false);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const criterios = { ...FILTROS_AUDITORIA, orderId: String(orderId) };
    // Se buscan hitos del pedido completo, aunque su historial visible esté paginado o filtrado.
    Promise.all(HITOS.map(type => seguimientoApi.auditoria({ ...criterios, type }, 0, controller.signal, 1)))
      .then(paginas => {
        if (!controller.signal.aborted) setEventos(paginas.flatMap(pagina => pagina.content));
      })
      .catch(() => {
        if (!controller.signal.aborted) setError(true);
      });
    return () => controller.abort();
  }, [orderId, revision]);

  if (error) {
    return <div className="auditoria-tiempos">
      <p role="status">No pudimos consultar los tiempos de este pedido.</p>
      <button className="btn ghost" type="button" onClick={() => { setError(false); setRevision(valor => valor + 1); }}>Reintentar tiempos</button>
    </div>;
  }
  if (!eventos) return <p className="auditoria-tiempos muted" role="status">Consultando tiempos del pedido…</p>;

  const inicio = eventos.find(evento => evento.type === 'CREADA');
  const cierres = eventos.filter(evento => evento.type !== 'CREADA');
  return (
    <section className="auditoria-tiempos" aria-label="Tiempos del pedido">
      <h3>Tiempos del pedido</h3>
      {cierres.length === 0 ? <p className="muted">Aún no hay una entrega ni un rechazo registrado.</p>
        : !inicio ? <p className="muted">Falta el evento de creación para calcular el tiempo.</p>
          : <>
            <p className="muted">Desde la creación el <time dateTime={inicio.occurredAt}>{formatDate(inicio.occurredAt)}</time>.</p>
            <dl>
              {cierres.map(cierre => {
                const minutos = (Date.parse(cierre.occurredAt) - Date.parse(inicio.occurredAt)) / 60_000;
                return <div key={cierre.eventId}>
                  <dt>{cierre.type === 'ENTREGADA' ? 'Tiempo hasta la entrega' : 'Tiempo hasta el rechazo o cancelación'}</dt>
                  <dd><strong>{formatMinutes(Number.isFinite(minutos) && minutos >= 0 ? minutos : null)}</strong></dd>
                  <dd><time dateTime={cierre.occurredAt}>{formatDate(cierre.occurredAt)}</time></dd>
                </div>;
              })}
            </dl>
          </>}
    </section>
  );
}
