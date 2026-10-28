import { useEffect, useState } from 'react';
import { appointmentsApi } from '../../api/appointmentsApi';
import { comprasApi } from '../../api/comprasApi';
import { ErrorApi } from '../../api/http';
import type { Order, Session } from '../../types';
import { formatDate, formatMoney } from '../../utils/format';
import { estadoCompra } from '../../utils/estadoCompra';
import { serviceLabel } from '../scheduling/utils/serviceLabel';
import PublicHeader from '../home/components/PublicHeader';
import './compras.css';

export default function MisSolicitudesPage({ session }: { session: Session }) {
  const [pedidos, setPedidos] = useState<Order[] | null>(null);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const recibida = new URLSearchParams(window.location.search).get('recibida');
  const personal = session.roles.some(r => r === 'Admin' || r === 'Operador');
  useEffect(() => {
    let activo = true;
    let ocupado = false;
    const cargar = async () => {
      if (ocupado) return;
      ocupado = true;
      try {
        // Incluye compras y atenciones; el BFF fija la identidad desde el JWT.
        const datos = (await (personal ? comprasApi.propias() : appointmentsApi.list())).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        if (activo) { setPedidos(datos); setError(''); }
      } catch (e) { if (activo) setError(e instanceof ErrorApi ? e.message : 'No pudimos cargar tus solicitudes. Inténtalo nuevamente.'); }
      finally { ocupado = false; }
    };
    void cargar(); const timer = window.setInterval(() => void cargar(), 5000);
    return () => { activo = false; window.clearInterval(timer); };
  }, [revision, session.username, personal]);
  return <div className="public-page tienda-page"><PublicHeader accountName={session.name} onLogout={session.logout} roles={session.roles} showClientNavigation />
    <main className="tienda"><header className="tienda-heading"><div><p className="section-eyebrow">Tu historial</p><h1>Mis solicitudes</h1><p>Todas tus solicitudes, actuales y anteriores, en un mismo lugar.</p></div><a className="btn primary" href="/catalogo">Ver catálogo</a></header>
      {recibida && /^\d+$/.test(recibida) && <p className="tienda-aviso" role="status">Solicitud #{recibida} enviada. Espera la revisión del operador; todavía no se ha descontado stock ni realizado un cobro.</p>}
      {error && <div className="public-alert" role="alert"><span>{error}</span><button className="btn ghost" onClick={() => setRevision(v => v + 1)}>Reintentar</button></div>}
      {!pedidos && !error && <p role="status">Cargando solicitudes…</p>}
      {pedidos && !error && !pedidos.length && <section className="panel estado-vacio"><h2>Aún no tienes solicitudes</h2><p>Explora el catálogo y agrega tus repuestos al carrito.</p><a className="btn primary" href="/catalogo">Explorar repuestos</a></section>}
      <div className="pedidos-lista">{pedidos?.map(o => <details className="panel pedido" key={o.id}><summary><strong>Solicitud #{o.id}</strong><span>{o.compraRepuestos ? 'Compra de repuestos' : serviceLabel(o.serviceType)}</span><span>{estadoCompra(o)}</span><span>{formatMoney(o.total)}</span><span>{formatDate(o.createdAt)}</span></summary>
        <div className="pedido-detalle"><p>Retiro y atención: Talleres360</p><ul>{o.items.map(i => <li key={i.id}>{i.description} × {i.quantity} — {formatMoney(i.subtotal)}</li>)}</ul>
          {!o.compraRepuestos && <><p>Vehículo: {o.vehiclePlate} · {o.vehicleModel}</p><p>Motivo: {o.description}</p><p>Fecha de atención: {o.appointmentDate || 'Por coordinar'}</p></>}
          {o.motivoRechazo && <p><strong>Motivo del rechazo:</strong> {o.motivoRechazo}</p>}
          {o.aceptacionPendiente && <p>El operador solicitó la aceptación. Estamos verificando las cantidades; aún no está aceptada.</p>}
          <p>Correo: {o.customerEmail}</p><p><strong>Total: {formatMoney(o.total)}</strong></p><p>Aceptada: {formatDate(o.acceptedAt)} · Entregada: {formatDate(o.deliveredAt)}</p>
        </div></details>)}</div>
    </main>
  </div>;
}
