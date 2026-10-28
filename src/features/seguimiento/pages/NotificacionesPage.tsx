import { useCallback, useState } from 'react';
import { seguimientoApi } from '../../../api/seguimientoApi';
import { formatDate } from '../../../utils/format';
import type { Session } from '../../../types';
import { ESTADOS_NOTIFICACION } from '../constants';
import { usePagina } from '../hooks/usePagina';
import Paginacion from '../components/Paginacion';
import SolicitudesNotificaciones from '../components/SolicitudesNotificaciones';
import '../seguimiento.css';

function AvisosOperador({ orden }: { orden: string }) {
  const [pagina, setPagina] = useState(0);
  const cargar = useCallback((signal: AbortSignal) => seguimientoApi.notificaciones(orden, pagina, signal, { operativo: true }), [orden, pagina]);
  const { datos, cargando, error, actualizar } = usePagina(cargar, 'No pudimos cargar tus notificaciones. Inténtalo nuevamente.', 5000);
  return <div aria-busy={cargando}>
    {cargando && <p role="status">Cargando notificaciones…</p>}
    {error && <div className="alert" role="alert">{error}<button className="btn ghost" type="button" onClick={actualizar}>Reintentar</button></div>}
    {datos && <section className="panel seguimiento-resultados" aria-label="Avisos registrados">
      {datos.content.length === 0 ? <p className="empty">No hay notificaciones para los filtros seleccionados.</p>
        : <div className="seguimiento-lista">{datos.content.map((aviso) => <article key={aviso.commandId} className="seguimiento-aviso">
          <header><h2>{aviso.asunto}</h2><span className="seguimiento-estado">{ESTADOS_NOTIFICACION[aviso.estado]}</span></header>
          <p className="muted">{aviso.orderId === null ? 'Mensaje general' : `Solicitud #${aviso.orderId}`} · {formatDate(aviso.occurredAt)} · {aviso.tipo === 'CORREO' ? 'Correo' : aviso.tipo === 'COMPROBANTE' ? 'Comprobante' : 'Ticket de taller'}</p>
          {aviso.destinatario && <p>Destinatario: {aviso.destinatario}</p>}
          <details><summary>Ver mensaje</summary><p className="seguimiento-mensaje">{aviso.mensaje}</p></details>
          {aviso.estado === 'FALLIDA' && <p role="status">No fue posible enviar este aviso. Contacta al taller si necesitas información.</p>}
        </article>)}</div>}
      <Paginacion pagina={pagina} totalPaginas={datos.totalPages} total={datos.totalElements} onCambiar={setPagina} />
    </section>}
  </div>;
}

export default function NotificacionesPage({ session }: { session: Session }) {
  const [entrada, setEntrada] = useState('');
  const [orden, setOrden] = useState('');
  const [revision, setRevision] = useState(0);
  const [operativo, setOperativo] = useState(false);
  const operador = session.roles.includes('Operador');
  if (!session.roles.some(rol => ['Cliente', 'Operador', 'Admin'].includes(rol))) return <p role="alert">Tu cuenta no tiene acceso a notificaciones.</p>;
  return <main className="seguimiento-page">
    <header className="management-page-heading"><h1>Notificaciones</h1>
      <p>{operativo ? 'Seguimiento operativo de los correos enviados a clientes.' : 'Consulta los avisos dirigidos a tu cuenta. Los mensajes sin pedido están en Mensajes generales.'}</p>
      {operador && <div className="actions"><button type="button" className={`btn ${!operativo ? 'primary' : 'ghost'}`} aria-pressed={!operativo} onClick={() => setOperativo(false)}>Mis notificaciones</button><button type="button" className={`btn ${operativo ? 'primary' : 'ghost'}`} aria-pressed={operativo} onClick={() => setOperativo(true)}>Seguimiento de envíos</button></div>}
    </header>
    <form className="panel seguimiento-filtros" onSubmit={event => {
      event.preventDefault(); setOrden(entrada); setRevision(valor => valor + 1);
    }}>
      <label>Número de solicitud<input type="number" min="1" step="1" max="9007199254740991" value={entrada}
        onChange={event => setEntrada(event.target.value)} placeholder="Todas las solicitudes" /></label>
      <button className="btn primary" type="submit">Buscar</button>
      <button className="btn ghost" type="button" onClick={() => {
        setEntrada(''); setOrden(''); setRevision(valor => valor + 1);
      }}>Actualizar / limpiar</button>
    </form>
    {operativo ? <AvisosOperador key={`${orden}-${revision}`} orden={orden} />
      : <SolicitudesNotificaciones key={`${orden}-${revision}`} orden={orden} />}
  </main>;
}
