import { useEffect, useState } from 'react';
import { ordersApi } from '../api/ordersApi';
import type { Order } from '../types';

export default function OperatorDashboard({ onOpenOrders, onOpenNotifications }: { onOpenOrders: () => void; onOpenNotifications: () => void }) {
  const [ordenes, setOrdenes] = useState<Order[] | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let activo = true;
    let ocupado = false;
    const cargar = async () => {
      if (ocupado) return;
      ocupado = true;
      try { const datos = await ordersApi.list(); if (activo) { setOrdenes(datos); setError(''); } }
      catch (e) { if (activo) setError(e instanceof Error ? e.message : 'No pudimos cargar las solicitudes.'); }
      finally { ocupado = false; }
    };
    void cargar();
    const timer = window.setInterval(() => void cargar(), 5000);
    return () => { activo = false; window.clearInterval(timer); };
  }, []);
  return <main className="dashboard"><header className="dashboard-heading"><div><h1>Dashboard del operador</h1><p>Revisa solicitudes y coordina el retiro. Actualización cada 5 segundos.</p></div></header>
    {error && <p className="alert" role="alert">{error}</p>}
    {!ordenes && !error && <p role="status">Cargando solicitudes…</p>}
    {ordenes && <section className="dashboard-cards" aria-label="Solicitudes por estado">
      {([['RECIBIDA', 'Por revisar'], ['ACEPTADA', 'En preparación'], ['LISTA_PARA_ENTREGA', 'Listas para retirar']] as const).map(([estado, titulo]) => <button type="button" key={estado} onClick={onOpenOrders}><span>{titulo}</span><strong>{ordenes.filter(o => o.status === estado).length}</strong><small>Ver solicitudes</small></button>)}
      <button type="button" onClick={onOpenNotifications}><span>Notificaciones</span><strong>Tickets</strong><small>Consultar actividad del taller</small></button>
    </section>}
  </main>;
}
