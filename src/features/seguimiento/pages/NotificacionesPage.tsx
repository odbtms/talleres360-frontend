import { useCallback, useState } from 'react';
import { seguimientoApi } from '../../../api/seguimientoApi';
import { formatDate } from '../../../utils/format';
import type { Session } from '../../../types';
import { ESTADOS_NOTIFICACION } from '../constants';
import { usePagina } from '../hooks/usePagina';
import Paginacion from '../components/Paginacion';
import '../seguimiento.css';

export default function NotificacionesPage({ session }: { session: Session }) {
  const [entrada, setEntrada] = useState('');
  const [orden, setOrden] = useState('');
  const [pagina, setPagina] = useState(0);
  const cargar = useCallback((signal: AbortSignal) => seguimientoApi.notificaciones(orden, pagina, signal), [orden, pagina]);
  const { datos, cargando, error, actualizar } = usePagina(cargar, 'No pudimos cargar tus notificaciones. Inténtalo nuevamente.');
  const operador = session.roles.includes('Operador');
  if (!operador && !session.roles.includes('Cliente')) return <p role="alert">Tu cuenta no tiene acceso a notificaciones.</p>;

  return <main className="seguimiento-page" aria-busy={cargando}>
    <header className="management-page-heading"><h1>Notificaciones</h1>
      <p>{operador ? 'Tickets de trabajo y cambios de estado de las órdenes del taller.' : 'Avisos sobre tus solicitudes y el estado de tu vehículo.'}</p>
    </header>
    <form className="panel seguimiento-filtros" onSubmit={(event) => { event.preventDefault(); setOrden(entrada); setPagina(0); actualizar(); }}>
      <label>Número de orden<input type="number" min="1" step="1" max="9007199254740991" value={entrada} onChange={(event) => setEntrada(event.target.value)} placeholder="Todas las órdenes" /></label>
      <button className="btn primary" type="submit" disabled={cargando}>Buscar</button>
      <button className="btn ghost" type="button" disabled={cargando} onClick={() => { setEntrada(''); setOrden(''); setPagina(0); actualizar(); }}>Actualizar / limpiar</button>
    </form>
    {cargando && <p role="status">Cargando notificaciones…</p>}
    {error && <div className="alert" role="alert">{error}<button className="btn ghost" type="button" onClick={actualizar}>Reintentar</button></div>}
    {datos && <section className="panel seguimiento-resultados" aria-label="Avisos registrados">
      {datos.content.length === 0 ? <p className="empty">No hay notificaciones para los filtros seleccionados.</p>
        : <div className="seguimiento-lista">{datos.content.map((aviso) => <article key={aviso.commandId} className="seguimiento-aviso">
          <header><h2>{aviso.asunto}</h2><span className="seguimiento-estado">{ESTADOS_NOTIFICACION[aviso.estado]}</span></header>
          <p className="muted">Orden #{aviso.orderId} · {formatDate(aviso.occurredAt)} · {aviso.tipo === 'CORREO' ? 'Correo' : 'Ticket de taller'}</p>
          <details><summary>Ver mensaje</summary><p className="seguimiento-mensaje">{aviso.mensaje}</p></details>
          {aviso.estado === 'FALLIDA' && <p role="status">No fue posible enviar este aviso. Contacta al taller si necesitas información.</p>}
        </article>)}</div>}
      <Paginacion pagina={pagina} totalPaginas={datos.totalPages} total={datos.totalElements} onCambiar={setPagina} />
    </section>}
  </main>;
}
