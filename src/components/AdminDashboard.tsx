import { useEffect, useState } from 'react';
import { reportsApi, type SalesReport } from '../api/reportsApi';
import { seguimientoApi } from '../api/seguimientoApi';
import { FILTROS_AUDITORIA } from '../features/seguimiento/constants';
import type { SolicitudAuditoria } from '../features/seguimiento/types';
import { productsApi } from '../api/productsApi';
import { ordersApi } from '../api/ordersApi';
import { formatMoney } from '../utils/format';
import SolicitudesAuditoria from '../features/seguimiento/components/SolicitudesAuditoria';
import type { Product } from '../types';

interface Props { onOpenOrders: () => void; onOpenProducts: () => void; }
const dateValue = (date: Date) => [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
export default function AdminDashboard({ onOpenOrders, onOpenProducts }: Props) {
  const [fromDate, setFromDate] = useState(() => dateValue(new Date(new Date().getFullYear(), new Date().getMonth(), 1)));
  const [toDate, setToDate] = useState(() => dateValue(new Date()));
  const [sales, setSales] = useState<SalesReport | null>(null);
  const [audit, setAudit] = useState<SolicitudAuditoria[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orderCount, setOrderCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    async function refresh() {
    if (!fromDate || !toDate || fromDate > toDate) { setError('Selecciona un rango de fechas válido.'); setLoading(false); return; }
    const from = new Date(`${fromDate}T00:00:00`).toISOString();
    const until = new Date(`${toDate}T00:00:00`);
    until.setDate(until.getDate() + 1);
    const to = until.toISOString();
    try {
      const [report, events, catalog, allOrders] = await Promise.all([
        reportsApi.sales(from, to), seguimientoApi.solicitudesAuditoria(FILTROS_AUDITORIA, 0, undefined, 5), productsApi.list(), ordersApi.list(),
      ]);
      if (active) { setSales(report); setAudit(events.content); setProducts(catalog); setOrderCount(allOrders.length); setError(''); }
    } catch { if (active) setError('No pudimos cargar el dashboard. Revisa la conexión e inténtalo nuevamente.'); }
    finally { if (active) setLoading(false); }
    }
    void refresh();
    const timer = window.setInterval(() => void refresh(), 5000);
    return () => { active = false; window.clearInterval(timer); };
  }, [fromDate, toDate]);
  const lowStock = products.filter((product) => product.active && product.stock <= 5);
  return <main className="dashboard">
    <header className="dashboard-heading"><div><h1>Dashboard</h1><p>Resumen operativo, ventas y actividad registrada. Se actualiza cada 5 segundos.</p></div>
      <div className="dashboard-range"><label>Desde<input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} /></label>
        <label>Hasta<input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} /></label></div></header>
    {loading && <p>Cargando indicadores…</p>}
    {error && <div className="alert" role="alert">{error}</div>}
    {!loading && !error && <>
      <section className="dashboard-cards" aria-label="Indicadores">
        <button type="button" onClick={onOpenOrders}><span>Órdenes registradas</span><strong>{orderCount}</strong><small>Ver órdenes</small></button>
        <button type="button" onClick={onOpenOrders}><span>Entregas del período</span><strong>{sales?.deliveredOrders ?? 0}</strong><small>Consultar actividad</small></button>
        <div><span>Ventas del período</span><strong>{formatMoney(sales?.revenue ?? 0)}</strong><small>Solo órdenes entregadas</small></div>
        <button type="button" onClick={onOpenProducts}><span>Repuestos con stock bajo</span><strong>{lowStock.length}</strong><small>Ver catálogo</small></button>
      </section>
      <section className="panel"><header className="auditoria-encabezado"><div><h2>Auditoría reciente</h2><p>Las 5 solicitudes con actividad más reciente. Abre una para revisar su historial.</p></div><a className="btn ghost" href="/dashboard/audit">Ver historial completo</a></header>
        {audit.length === 0 ? <p className="muted">Aún no hay eventos registrados.</p> :
          <SolicitudesAuditoria solicitudes={audit} />}
      </section>
    </>}
  </main>;
}
