import { useCallback, useState, type ReactNode } from 'react';
import { seguimientoApi } from '../../../api/seguimientoApi';
import SolicitudesAuditoria from '../components/SolicitudesAuditoria';
import type { Session } from '../../../types';
import { EVENTOS, FILTROS_AUDITORIA } from '../constants';
import { usePagina } from '../hooks/usePagina';
import Paginacion from '../components/Paginacion';
import ListaAuditoria from '../components/ListaAuditoria';
import type { FiltrosAuditoria, Pagina } from '../types';
import '../seguimiento.css';

function ResultadosAuditoria<T>({ filtros, consultar, mostrar }: {
  filtros: FiltrosAuditoria;
  consultar: (filtros: FiltrosAuditoria, pagina: number, signal: AbortSignal) => Promise<Pagina<T>>;
  mostrar: (filas: T[]) => ReactNode;
}) {
  const [pagina, setPagina] = useState(0);
  const cargar = useCallback((signal: AbortSignal) => consultar(filtros, pagina, signal), [consultar, filtros, pagina]);
  const { datos, cargando, error, actualizar } = usePagina(cargar, 'No pudimos cargar la auditoría. Inténtalo nuevamente.');
  return <section className="panel seguimiento-resultados" aria-label="Historial de eventos" aria-busy={cargando}>
    {cargando && <p role="status">Cargando auditoría…</p>}
    {error && <div className="alert" role="alert">{error}<button className="btn ghost" type="button" onClick={actualizar}>Reintentar</button></div>}
    {datos && <>
      {datos.content.length ? mostrar(datos.content) : <p className="empty">No hay eventos para los filtros seleccionados.</p>}
      <Paginacion pagina={pagina} totalPaginas={datos.totalPages} total={datos.totalElements} onCambiar={setPagina} />
    </>}
  </section>;
}

export default function AuditoriaPage({ session }: { session: Session }) {
  const [entrada, setEntrada] = useState<FiltrosAuditoria>(FILTROS_AUDITORIA);
  const [filtros, setFiltros] = useState<FiltrosAuditoria>(FILTROS_AUDITORIA);
  const [vista, setVista] = useState<'pedidos' | 'eventos'>('pedidos');
  const [revision, setRevision] = useState(0);
  const [errorFiltro, setErrorFiltro] = useState('');
  const campo = (nombre: keyof FiltrosAuditoria, valor: string) => setEntrada((actual) => ({ ...actual, [nombre]: valor }));
  if (!session.roles.includes('Admin')) return <p role="alert">Tu cuenta no tiene acceso a auditoría.</p>;

  return <main className="seguimiento-page">
    <header className="management-page-heading"><h1>Auditoría</h1><p>Revisa el historial de cada pedido o consulta las acciones por usuario, fecha y tipo de evento.</p></header>
    <form className="panel seguimiento-filtros" onSubmit={(event) => {
      event.preventDefault();
      if (entrada.desde && entrada.hasta && entrada.desde > entrada.hasta) { setErrorFiltro('La fecha inicial no puede ser posterior a la final.'); return; }
      setErrorFiltro(''); setFiltros({ ...entrada }); setRevision(valor => valor + 1);
    }}>
      <label>Número de solicitud<input type="number" min="1" step="1" max="9007199254740991" value={entrada.orderId} onChange={(event) => campo('orderId', event.target.value)} /></label>
      <label>Usuario (correo completo)<input type="text" maxLength={160} value={entrada.actor} onChange={(event) => campo('actor', event.target.value)} /></label>
      <label>Tipo de evento<select value={entrada.type} onChange={(event) => campo('type', event.target.value)}><option value="">Todos</option>{Object.entries(EVENTOS).map(([valor, texto]) => <option key={valor} value={valor}>{texto}</option>)}</select></label>
      <label>Desde<input type="date" value={entrada.desde} onChange={(event) => campo('desde', event.target.value)} /></label>
      <label>Hasta<input type="date" value={entrada.hasta} onChange={(event) => campo('hasta', event.target.value)} /></label>
      <button className="btn primary" type="submit">Filtrar</button>
      <button className="btn ghost" type="button" onClick={() => {
        setEntrada(FILTROS_AUDITORIA); setFiltros(FILTROS_AUDITORIA);
        setErrorFiltro(''); setRevision(valor => valor + 1);
      }}>Limpiar filtros</button>
    </form>
    {errorFiltro && <p className="alert" role="alert">{errorFiltro}</p>}
    <div className="auditoria-modos" role="group" aria-label="Vista de auditoría">
      <button className={vista === 'pedidos' ? 'btn primary' : 'btn ghost'} type="button"
        aria-pressed={vista === 'pedidos'} onClick={() => setVista('pedidos')}>Por pedido</button>
      <button className={vista === 'eventos' ? 'btn primary' : 'btn ghost'} type="button"
        aria-pressed={vista === 'eventos'} onClick={() => setVista('eventos')}>Acciones de usuarios</button>
    </div>
    {vista === 'pedidos'
      ? <ResultadosAuditoria key={`pedidos-${revision}`} filtros={filtros} consultar={seguimientoApi.solicitudesAuditoria}
          mostrar={filas => <SolicitudesAuditoria solicitudes={filas} filtros={filtros} />} />
      : <ResultadosAuditoria key={`eventos-${revision}`} filtros={filtros} consultar={seguimientoApi.auditoria}
          mostrar={filas => <ListaAuditoria eventos={filas} />} />}
  </main>;
}
