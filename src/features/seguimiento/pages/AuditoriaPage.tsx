import { useCallback, useState } from 'react';
import { seguimientoApi } from '../../../api/seguimientoApi';
import { formatDate, formatMoney } from '../../../utils/format';
import type { Session } from '../../../types';
import { EVENTOS, FILTROS_AUDITORIA } from '../constants';
import { usePagina } from '../hooks/usePagina';
import Paginacion from '../components/Paginacion';
import type { FiltrosAuditoria } from '../types';
import '../seguimiento.css';

export default function AuditoriaPage({ session }: { session: Session }) {
  const [entrada, setEntrada] = useState<FiltrosAuditoria>(FILTROS_AUDITORIA);
  const [filtros, setFiltros] = useState<FiltrosAuditoria>(FILTROS_AUDITORIA);
  const [pagina, setPagina] = useState(0);
  const [errorFiltro, setErrorFiltro] = useState('');
  const cargar = useCallback((signal: AbortSignal) => seguimientoApi.auditoria(filtros, pagina, signal), [filtros, pagina]);
  const { datos, cargando, error, actualizar } = usePagina(cargar, 'No pudimos cargar la auditoría. Inténtalo nuevamente.');
  const campo = (nombre: keyof FiltrosAuditoria, valor: string) => setEntrada((actual) => ({ ...actual, [nombre]: valor }));
  if (!session.roles.includes('Admin')) return <p role="alert">Tu cuenta no tiene acceso a auditoría.</p>;

  return <main className="seguimiento-page" aria-busy={cargando}>
    <header className="management-page-heading"><h1>Auditoría</h1><p>Trazabilidad de órdenes y acciones de usuarios. Información de solo lectura.</p></header>
    <form className="panel seguimiento-filtros" onSubmit={(event) => {
      event.preventDefault();
      if (entrada.desde && entrada.hasta && entrada.desde > entrada.hasta) { setErrorFiltro('La fecha inicial no puede ser posterior a la final.'); return; }
      setErrorFiltro(''); setFiltros({ ...entrada }); setPagina(0); actualizar();
    }}>
      <label>Número de orden<input type="number" min="1" step="1" max="9007199254740991" value={entrada.orderId} onChange={(event) => campo('orderId', event.target.value)} /></label>
      <label>Usuario (correo completo)<input type="text" maxLength={160} value={entrada.actor} onChange={(event) => campo('actor', event.target.value)} /></label>
      <label>Tipo de evento<select value={entrada.type} onChange={(event) => campo('type', event.target.value)}><option value="">Todos</option>{Object.entries(EVENTOS).map(([valor, texto]) => <option key={valor} value={valor}>{texto}</option>)}</select></label>
      <label>Desde<input type="date" value={entrada.desde} onChange={(event) => campo('desde', event.target.value)} /></label>
      <label>Hasta<input type="date" value={entrada.hasta} onChange={(event) => campo('hasta', event.target.value)} /></label>
      <button className="btn primary" type="submit" disabled={cargando}>Filtrar</button>
      <button className="btn ghost" type="button" disabled={cargando} onClick={() => { setEntrada(FILTROS_AUDITORIA); setFiltros(FILTROS_AUDITORIA); setPagina(0); setErrorFiltro(''); actualizar(); }}>Actualizar / limpiar</button>
    </form>
    {errorFiltro && <p className="alert" role="alert">{errorFiltro}</p>}
    {cargando && <p role="status">Cargando auditoría…</p>}
    {error && <div className="alert" role="alert">{error}<button className="btn ghost" type="button" onClick={actualizar}>Reintentar</button></div>}
    {datos && <section className="panel seguimiento-resultados" aria-label="Historial de eventos">
      {datos.content.length === 0 ? <p className="empty">No hay eventos para los filtros seleccionados.</p>
        : <ol className="seguimiento-timeline">{datos.content.map((evento) => <li key={evento.eventId}>
          <article><header><h2>{EVENTOS[evento.type] ?? evento.type}</h2><time dateTime={evento.occurredAt}>{formatDate(evento.occurredAt)}</time></header>
            <dl><dt>Orden</dt><dd>#{evento.orderId}</dd><dt>Usuario</dt><dd>{evento.actor}</dd><dt>Estado</dt><dd>{evento.status.replaceAll('_', ' ')}</dd><dt>Total registrado</dt><dd>{formatMoney(evento.total)}</dd></dl>
            {evento.reason && <p>{evento.reason}</p>}
            <details><summary>Identificación del evento</summary><p>ID: {evento.eventId}</p><p>Origen: {evento.source}</p></details>
          </article>
        </li>)}</ol>}
      <Paginacion pagina={pagina} totalPaginas={datos.totalPages} total={datos.totalElements} onCambiar={setPagina} />
    </section>}
  </main>;
}
