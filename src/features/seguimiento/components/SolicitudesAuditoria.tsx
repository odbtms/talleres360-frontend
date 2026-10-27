import { useCallback, useState } from 'react';
import { seguimientoApi } from '../../../api/seguimientoApi';
import { formatDate } from '../../../utils/format';
import { FILTROS_AUDITORIA } from '../constants';
import { usePagina } from '../hooks/usePagina';
import type { FiltrosAuditoria, SolicitudAuditoria } from '../types';
import ListaAuditoria from './ListaAuditoria';
import Paginacion from './Paginacion';

function HistorialSolicitud({ orderId, filtros }: { orderId: number; filtros: FiltrosAuditoria }) {
  const [pagina, setPagina] = useState(0);
  const cargar = useCallback((signal: AbortSignal) => seguimientoApi.auditoria({ ...filtros, orderId: String(orderId) }, pagina, signal), [orderId, filtros, pagina]);
  const { datos, cargando, error, actualizar } = usePagina(cargar, 'No pudimos cargar el historial de esta solicitud.');
  return <div className="auditoria-historial" aria-busy={cargando}>
    {cargando && <p role="status">Cargando movimientos…</p>}
    {error && <div className="alert" role="alert">{error}<button className="btn ghost" onClick={actualizar}>Reintentar</button></div>}
    {datos && <>{datos.content.length ? <ListaAuditoria eventos={datos.content} /> : <p>No hay movimientos para estos filtros.</p>}
      <Paginacion pagina={pagina} totalPaginas={datos.totalPages} total={datos.totalElements} onCambiar={setPagina} /></>}
  </div>;
}

function BloqueSolicitud({ solicitud, filtros }: { solicitud: SolicitudAuditoria; filtros: FiltrosAuditoria }) {
  const [abierto, setAbierto] = useState(false);
  return <li><details className="auditoria-solicitud" onToggle={event => {
    if (event.target === event.currentTarget) setAbierto(event.currentTarget.open);
  }}>
    <summary><span className="auditoria-resumen"><strong>Solicitud #{solicitud.orderId}</strong>
      <span className="auditoria-actor">{solicitud.eventos} {solicitud.eventos === 1 ? 'movimiento' : 'movimientos'}</span></span>
      <span className="auditoria-actividad">Última actividad<time dateTime={solicitud.ultimaActividad}>{formatDate(solicitud.ultimaActividad)}</time></span>
      <span className="auditoria-abrir" aria-hidden="true">{abierto ? 'Cerrar historial' : 'Ver historial'}</span>
    </summary>
    {abierto && <HistorialSolicitud orderId={solicitud.orderId} filtros={filtros} />}
  </details></li>;
}

export default function SolicitudesAuditoria({ solicitudes, filtros = FILTROS_AUDITORIA }: {
  solicitudes: readonly SolicitudAuditoria[]; filtros?: FiltrosAuditoria;
}) {
  return <ol className="auditoria-solicitudes">{solicitudes.map(solicitud =>
    <BloqueSolicitud key={solicitud.orderId} solicitud={solicitud} filtros={filtros} />)}</ol>;
}
