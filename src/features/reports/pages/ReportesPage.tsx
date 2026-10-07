import { useState, type FormEvent } from 'react';
import { formatDate, formatMoney } from '../../../utils/format';
import { useReporteVentas } from '../hooks/useReporteVentas';
import { fechaParaInput } from '../utils/fechasReporte';

export default function ReportesPage() {
  const [desde, setDesde] = useState(() => fechaParaInput(new Date(new Date().getFullYear(), new Date().getMonth(), 1)));
  const [hasta, setHasta] = useState(() => fechaParaInput(new Date()));
  const { resultado, cargando, error, generarReporte } = useReporteVentas();

  function enviar(evento: FormEvent<HTMLFormElement>): void {
    evento.preventDefault();
    void generarReporte(desde, hasta);
  }

  return (
    <main className="reports-page" aria-busy={cargando}>
      <header className="management-page-heading">
        <h1>Reportes de ventas</h1>
        <p>Selecciona un período para consultar las entregas y los ingresos registrados.</p>
      </header>
      <form className="panel reports-filters" onSubmit={enviar}>
        <label>Desde<input type="date" required value={desde} disabled={cargando} onChange={(evento) => setDesde(evento.target.value)} /></label>
        <label>Hasta<input type="date" required min={desde || undefined} value={hasta} disabled={cargando} onChange={(evento) => setHasta(evento.target.value)} /></label>
        <button className="btn primary" type="submit" disabled={cargando}>{cargando ? 'Generando…' : 'Generar reporte'}</button>
      </form>
      {error && <div className="alert" role="alert">{error}</div>}
      {cargando && <p className="panel empty" role="status">Estamos preparando tu reporte…</p>}
      {!resultado && !cargando && !error && <section className="panel reports-empty"><h2>Genera tu primer reporte</h2><p>Elige las fechas y presiona Generar reporte para ver los resultados.</p></section>}
      {resultado && (
        <section className="panel reports-result" aria-label="Resultado del reporte" aria-live="polite">
          <header><h2>Resumen de ventas</h2><p>Del {formatDate(`${resultado.desde}T00:00:00`)} al {formatDate(`${resultado.hasta}T00:00:00`)}</p></header>
          <dl className="reports-metrics">
            <div><dt>Órdenes entregadas</dt><dd>{resultado.datos.deliveredOrders}</dd></div>
            <div><dt>Total de ventas</dt><dd>{formatMoney(resultado.datos.revenue)}</dd></div>
          </dl>
          {resultado.datos.deliveredOrders === 0 && <p className="muted">No hay órdenes entregadas en el período seleccionado.</p>}
          <p className="muted">Solo se incluyen órdenes entregadas. Generado el {formatDate(resultado.generadoEn)}.</p>
        </section>
      )}
    </main>
  );
}
