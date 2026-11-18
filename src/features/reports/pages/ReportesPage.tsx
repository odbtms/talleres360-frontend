import { useState, type FormEvent } from 'react';
import { formatDate, formatMinutes, formatMoney } from '../../../utils/format';
import { useReporteVentas } from '../hooks/useReporteVentas';
import { fechaParaVista, fechasParaPeriodo, type PeriodoReporte, type RangoReporte } from '../utils/fechasReporte';
import { LeadTimeChartComponent, SalesChartComponent, TopProductsChartComponent } from '../components/GraficosKpis';
import './reportes-kpis.css';

const PERIODOS: ReadonlyArray<{ periodo: PeriodoReporte; etiqueta: string }> = [
  { periodo: 'dia', etiqueta: 'Hoy' },
  { periodo: 'semana', etiqueta: 'Esta semana' },
  { periodo: 'mes', etiqueta: 'Este mes' },
];

export default function ReportesPage({ onOpenAudit }: { onOpenAudit: () => void }) {
  const [fechas, setFechas] = useState(() => fechasParaPeriodo('mes'));
  const [periodo, setPeriodo] = useState<PeriodoReporte | null>('mes');
  const { resultado, cargando, error, errorFechas, generarReporte } = useReporteVentas(fechas.desde, fechas.hasta);

  function elegirPeriodo(nuevoPeriodo: PeriodoReporte) {
    const rango = fechasParaPeriodo(nuevoPeriodo);
    setFechas(rango);
    setPeriodo(nuevoPeriodo);
    generarReporte(rango.desde, rango.hasta);
  }

  function editarFecha(campo: keyof RangoReporte, valor: string) {
    setFechas(actual => ({ ...actual, [campo]: valor }));
    setPeriodo(null);
  }

  function enviar(evento: FormEvent<HTMLFormElement>): void {
    evento.preventDefault();
    generarReporte(fechas.desde, fechas.hasta);
  }

  return (
    <main className="reports-page" aria-busy={cargando}>
      <header className="management-page-heading reportes-kpis-encabezado">
        <div>
          <h1>Reportería y KPIs</h1>
          <p>Indicadores de pedidos entregados, actualizados cada 10 segundos a partir de los eventos procesados.</p>
        </div>
        <button className="btn ghost" type="button" onClick={onOpenAudit}>Ver tiempos por pedido</button>
      </header>
      <form className="panel reports-filters" onSubmit={enviar}>
        <div className="reportes-periodos" role="group" aria-label="Período del reporte">
          {PERIODOS.map(opcion => (
            <button key={opcion.periodo} className={periodo === opcion.periodo ? 'btn primary' : 'btn ghost'}
              type="button" aria-pressed={periodo === opcion.periodo} onClick={() => elegirPeriodo(opcion.periodo)}>
              {opcion.etiqueta}
            </button>
          ))}
        </div>
        <label>Desde<input type="date" required value={fechas.desde} disabled={cargando} onChange={(evento) => editarFecha('desde', evento.target.value)} /></label>
        <label>Hasta<input type="date" required min={fechas.desde || undefined} value={fechas.hasta} disabled={cargando} onChange={(evento) => editarFecha('hasta', evento.target.value)} /></label>
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
              <div><dt>Tiempo medio de entrega</dt><dd>{formatMinutes(resultado.datos.promedioMinutos)}</dd>
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
