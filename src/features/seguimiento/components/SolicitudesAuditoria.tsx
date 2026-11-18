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
  const [historialCompleto, setHistorialCompleto] = useState(false);
  const hayFiltros = Boolean(filtros.actor || filtros.type || filtros.desde || filtros.hasta);
  const criterios = historialCompleto ? FILTROS_AUDITORIA : filtros;
  const cargar = useCallback((signal: AbortSignal) =>
    seguimientoApi.auditoria({ ...criterios, orderId: String(orderId) }, pagina, signal),
  [orderId, criterios, pagina]);
  const { datos, cargando, error, actualizar } = usePagina(cargar, 'No pudimos cargar el historial de esta solicitud.');
  return <div className="auditoria-historial" aria-busy={cargando}>
    {hayFiltros && <button className="btn ghost auditoria-ver-todo" type="button"
      aria-pressed={historialCompleto} onClick={() => { setHistorialCompleto(valor => !valor); setPagina(0); }}>
      {historialCompleto ? 'Aplicar filtros de nuevo' : 'Ver historial completo del pedido'}
    </button>}
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
