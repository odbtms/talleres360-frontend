import { useCallback, useState } from 'react';
import { seguimientoApi } from '../../../api/seguimientoApi';
import { formatDate } from '../../../utils/format';
import { ESTADOS_NOTIFICACION } from '../constants';
import { usePagina } from '../hooks/usePagina';
import type { SolicitudNotificaciones } from '../types';
import Paginacion from './Paginacion';
import '../notificaciones.css';

function HistorialAvisos({ orderId }: { orderId: number }) {
  const [pagina, setPagina] = useState(0);
  const cargar = useCallback((signal: AbortSignal) => seguimientoApi.notificaciones(String(orderId), pagina, signal), [orderId, pagina]);
  const { datos, cargando, error, actualizar } = usePagina(cargar, 'No pudimos cargar los avisos de esta solicitud.');
  return <div className="notificaciones-historial" aria-busy={cargando}>
    {cargando && <p role="status">Cargando avisos…</p>}
    {error && <div className="alert" role="alert">{error}<button type="button" className="btn ghost" onClick={actualizar}>Reintentar</button></div>}
    {datos && <>{datos.content.length ? <ol className="notificaciones-avisos">{datos.content.map(aviso =>
      <li key={aviso.commandId}><details className="notificaciones-detalle">
        <summary><span className="notificaciones-resumen"><strong>{aviso.asunto}</strong>
          <span className="notificaciones-tipo">{aviso.tipo === 'CORREO' ? 'Correo' : 'Comprobante'}</span></span>
          <span className="seguimiento-estado">{ESTADOS_NOTIFICACION[aviso.estado]}</span>
          <time dateTime={aviso.occurredAt}>{formatDate(aviso.occurredAt)}</time>
          <span className="notificaciones-enlace" aria-hidden="true">Ver mensaje</span>
        </summary>
        <div className="notificaciones-contenido"><p className="seguimiento-mensaje">{aviso.mensaje}</p>
          {aviso.estado === 'FALLIDA' && <p role="status">No fue posible enviar este aviso. Contacta al taller si necesitas información.</p>}
        </div>
      </details></li>)}</ol> : <p>No hay avisos para esta solicitud.</p>}
      <Paginacion pagina={pagina} totalPaginas={datos.totalPages} total={datos.totalElements} onCambiar={setPagina} /></>}
  </div>;
}

function BloqueSolicitud({ solicitud }: { solicitud: SolicitudNotificaciones }) {
  const [abierto, setAbierto] = useState(false);
  return <li><details className="notificaciones-solicitud" onToggle={event => {
    if (event.target === event.currentTarget) setAbierto(event.currentTarget.open);
  }}>
    <summary><span className="notificaciones-resumen"><strong>Solicitud #{solicitud.orderId}</strong>
      <span className="notificaciones-tipo">{solicitud.avisos} {solicitud.avisos === 1 ? 'aviso' : 'avisos'}</span></span>
      <span className="notificaciones-actividad">Última actividad<time dateTime={solicitud.ultimaActividad}>{formatDate(solicitud.ultimaActividad)}</time></span>
      <span className="notificaciones-enlace" aria-hidden="true">{abierto ? 'Cerrar historial' : 'Ver historial'}</span>
    </summary>
    {abierto && <HistorialAvisos orderId={solicitud.orderId} />}
  </details></li>;
}

export default function SolicitudesNotificaciones({ orden }: { orden: string }) {
  const [pagina, setPagina] = useState(0);
  const cargar = useCallback((signal: AbortSignal) => seguimientoApi.solicitudesNotificaciones(orden, pagina, signal), [orden, pagina]);
  const { datos, cargando, error, actualizar } = usePagina(cargar, 'No pudimos cargar tus notificaciones. Inténtalo nuevamente.');
  return <section className="panel seguimiento-resultados" aria-label="Notificaciones por solicitud" aria-busy={cargando}>
    {cargando && <p role="status">Cargando solicitudes…</p>}
    {error && <div className="alert" role="alert">{error}<button className="btn ghost" type="button" onClick={actualizar}>Reintentar</button></div>}
    {datos && <>{datos.content.length ? <ol className="notificaciones-solicitudes">{datos.content.map(solicitud =>
      <BloqueSolicitud key={solicitud.orderId} solicitud={solicitud} />)}</ol>
      : <p className="empty">No hay notificaciones para los filtros seleccionados.</p>}
      <Paginacion pagina={pagina} totalPaginas={datos.totalPages} total={datos.totalElements} onCambiar={setPagina} /></>}
  </section>;
}
