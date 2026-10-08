import { useEffect, useState } from 'react';
import { reportsApi, type AuditEvent, type SalesReport } from '../api/reportsApi';
import { productsApi } from '../api/productsApi';
import { ordersApi } from '../api/ordersApi';
import { formatDate, formatMoney } from '../utils/format';
import type { Product } from '../types';

interface Props { onOpenOrders: () => void; onOpenProducts: () => void; }
const dateValue = (date: Date) => [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
export default function AdminDashboard({ onOpenOrders, onOpenProducts }: Props) {
  const [fromDate, setFromDate] = useState(() => dateValue(new Date(new Date().getFullYear(), new Date().getMonth(), 1)));
  const [toDate, setToDate] = useState(() => dateValue(new Date()));
  const [sales, setSales] = useState<SalesReport | null>(null);
  const [audit, setAudit] = useState<AuditEvent[]>([]);
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
        reportsApi.sales(from, to), reportsApi.audit(), productsApi.list(), ordersApi.list(),
      ]);
      if (active) { setSales(report); setAudit(events); setProducts(catalog); setOrderCount(allOrders.length); setError(''); }
    } catch { if (active) setError('No pudimos cargar el dashboard. Revisa la conexión e inténtalo nuevamente.'); }
    finally { if (active) setLoading(false); }
    }
    void refresh();
    const timer = window.setInterval(() => void refresh(), 10000);
    return () => { active = false; window.clearInterval(timer); };
  }, [fromDate, toDate]);
  const lowStock = products.filter((product) => product.active && product.stock <= 5);
  return <main className="dashboard">
    <header className="dashboard-heading"><div><h1>Dashboard</h1><p>Resumen operativo, ventas y actividad registrada. Se actualiza cada 10 segundos.</p></div>
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
      <section className="panel"><h2>Auditoría reciente</h2>
        {audit.length === 0 ? <p className="muted">Aún no hay eventos registrados.</p> :
          <div className="table-wrap table-wrap--audit" role="region" aria-label="Auditoría reciente" tabIndex={0}><table><thead><tr><th>Fecha</th><th>Orden</th><th>Acción</th><th>Usuario</th><th>Estado</th></tr></thead>
            <tbody>{audit.slice(0, 20).map((event) => <tr key={event.eventId}>
              <td>{formatDate(event.occurredAt)}</td><td>#{event.orderId}</td><td>{event.type.replaceAll('_', ' ')}</td>
              <td title={event.reason || undefined}>{event.actor}{event.reason ? ` · ${event.reason}` : ''}</td><td>{event.status}</td></tr>)}</tbody></table></div>}
      </section>
    </>}
  </main>;
}
