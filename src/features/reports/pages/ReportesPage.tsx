import { useState, type FormEvent } from 'react';
import { formatDate, formatMoney } from '../../../utils/format';
import { useReporteVentas } from '../hooks/useReporteVentas';
import { fechaParaInput, fechaParaVista } from '../utils/fechasReporte';
import { formatoTiempo, LeadTimeChartComponent, SalesChartComponent, TopProductsChartComponent } from '../components/GraficosKpis';
import './reportes-kpis.css';

export default function ReportesPage() {
  const [desde, setDesde] = useState(() => fechaParaInput(new Date(new Date().getFullYear(), new Date().getMonth(), 1)));
  const [hasta, setHasta] = useState(() => fechaParaInput(new Date()));
  const { resultado, cargando, error, errorFechas, generarReporte } = useReporteVentas(desde, hasta);

  function enviar(evento: FormEvent<HTMLFormElement>): void {
    evento.preventDefault();
    generarReporte(desde, hasta);
  }

  return (
    <main className="reports-page" aria-busy={cargando}>
      <header className="management-page-heading">
        <h1>Reportería y KPIs</h1>
        <p>Indicadores de pedidos entregados, actualizados cada 10 segundos a partir de los eventos procesados.</p>
      </header>
      <form className="panel reports-filters" onSubmit={enviar}>
        <label>Desde<input type="date" required value={desde} disabled={cargando} onChange={(evento) => setDesde(evento.target.value)} /></label>
        <label>Hasta<input type="date" required min={desde || undefined} value={hasta} disabled={cargando} onChange={(evento) => setHasta(evento.target.value)} /></label>
        <button className="btn primary" type="submit" disabled={cargando}>{cargando ? 'Consultando…' : 'Aplicar fechas'}</button>
      </form>
      {errorFechas && <p className="alert" role="alert">{errorFechas}</p>}
      {error && <div className="alert" role="alert">{error}</div>}
      {cargando && <p className="panel empty" role="status">Estamos preparando tu reporte…</p>}
      {resultado && (
        <>
          <section className="panel reports-result" aria-label="Resumen del período">
            <header><h2>Resumen del período</h2>
              <p>Del {fechaParaVista(resultado.desde)} al {fechaParaVista(resultado.hasta)} · Actualizado {formatDate(resultado.generadoEn)}</p>
            </header>
            <dl className="reports-metrics kpi-resumen">
              <div><dt>Ventas</dt><dd>{formatMoney(resultado.datos.resumen.revenue)}</dd></div>
              <div><dt>Pedidos entregados</dt><dd>{resultado.datos.resumen.deliveredOrders}</dd></div>
              <div><dt>Tiempo medio de entrega</dt><dd>{formatoTiempo(resultado.datos.promedioMinutos)}</dd>
                <small>Desde la creación · Entregas medidas: {resultado.datos.entregasMedidas}</small>
              </div>
            </dl>
          </section>
          <div className="kpi-graficos">
            <SalesChartComponent datos={resultado.datos.ventasPorDia} />
            <LeadTimeChartComponent datos={resultado.datos.tiemposPorDia} />
            <TopProductsChartComponent datos={resultado.datos.productos} />
          </div>
          {resultado.datos.pedidosConDetalle < resultado.datos.resumen.deliveredOrders && (
            <p className="muted">El ranking incluye {resultado.datos.pedidosConDetalle} de {resultado.datos.resumen.deliveredOrders} entregas con detalle de productos registrado.</p>
          )}
        </>
      )}
    </main>
  );
}
