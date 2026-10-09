import StatusBadge from './StatusBadge';
import { NEXT_STATUS, STATUS_LABELS } from '../constants/orderStatus';
import { formatDate, formatMoney } from '../utils/format';
import type { Order, OrderStatus } from '../types';
import { WORKSHOPS } from '../features/scheduling/constants/workshops';
import { REGIONS } from '../features/scheduling/constants/workshops';
import { serviceLabel } from '../features/scheduling/utils/serviceLabel';
import { useEffect, useState } from 'react';
import { ordersApi } from '../api/ordersApi';

interface OrderDetailProps {
  order: Order;
  canWrite: boolean;
  canDelete: boolean;
  isAdmin: boolean;
  onChangeStatus: (status: OrderStatus, reason?: string) => void | Promise<void>;
  onEdit: () => void;
  onDelete: () => void | Promise<void>;
}

export default function OrderDetail({
  order,
  canWrite,
  canDelete,
  isAdmin,
  onChangeStatus,
  onEdit,
  onDelete,
}: OrderDetailProps) {
  const nextStatuses = canWrite ? NEXT_STATUS[order.status] ?? [] : [];
  // ms-orders solo permite editar (PUT /api/orders/{id}) en RECIBIDA
  const canEdit = canWrite && ['RECIBIDA', 'ACEPTADA', 'EN_REPARACION', 'LISTA_PARA_ENTREGA'].includes(order.status);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState(true);
  const [stockError, setStockError] = useState('');
  useEffect(() => {
    if (!['ACEPTADA', 'EN_REPARACION', 'LISTA_PARA_ENTREGA'].includes(order.status)) return;
    let active = true;
    const load = () => ordersApi.stock(order.id).then((stock) => { if (active) { setPending(stock.pending); setStockError(''); } }).catch(() => { if (active) { setPending(true); setStockError('No se pudo comprobar la asignación de repuestos. Se reintentará automáticamente.'); } });
    void load(); const timer = window.setInterval(() => { void load(); }, 5000);
    return () => { active = false; window.clearInterval(timer); };
  }, [order.id, order.status, order.updatedAt]);
  async function change(status: OrderStatus) {
    if (busy) return;
    setBusy(true); try { await onChangeStatus(status, isAdmin ? reason.trim() : undefined); } finally { setBusy(false); }
  }
  const isRequest = order.status === 'RECIBIDA';
  const workshop = WORKSHOPS.find((item) => item.id === order.workshopId)?.name ?? `Taller #${order.workshopId}`;

  return (
    <div className="detail">
      <div className="detail-head">
        <h2>Orden #{order.id}</h2>
        <StatusBadge status={order.status} />
      </div>

      <dl className="fields">
        <dt>Cliente</dt><dd>{order.customerName}</dd>
        <dt>Email</dt><dd>{order.customerEmail}</dd>
        <dt>RUT</dt><dd>{order.customerRut || 'No informado'}</dd>
        <dt>Teléfono</dt><dd>{order.customerPhone ? `+56 9 ${order.customerPhone}` : 'No informado'}</dd>
        <dt>Servicio</dt><dd>{serviceLabel(order.serviceType)}</dd>
        <dt>Región</dt><dd>{REGIONS.find((r) => r.id === (order.regionId || WORKSHOPS.find((w) => w.id === order.workshopId)?.regionId))?.name || 'No informada'}</dd>
        <dt>Atención</dt><dd>{order.appointmentDate || 'Por coordinar'}</dd>
        <dt>Vehículo</dt><dd><span className="plate">{order.vehiclePlate}</span> {order.vehicleModel}</dd>
        <dt>Taller</dt><dd>{workshop}</dd>
        <dt>Motivo</dt><dd>{order.description || 'Sin motivo informado'}</dd>
        <dt>Total</dt><dd><strong>{formatMoney(order.total)}</strong></dd>
      </dl>


      <h3>Repuestos / servicios</h3>
      {order.items.length === 0 ? (
        <p className="muted">Sin ítems.</p>
      ) : (
        <div className="table-wrap table-wrap--items" role="region" aria-label="Repuestos de la orden" tabIndex={0}>
        <table className="items">
          <thead>
            <tr><th>Producto</th><th className="num">Cant.</th><th className="num">Precio</th><th className="num">Subtotal</th></tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id}>
                <td>{item.description || `Producto #${item.productId}`}</td>
                <td className="num">{item.quantity}</td>
                <td className="num">{formatMoney(item.unitPrice)}</td>
                <td className="num">{formatMoney(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr><td colSpan={3}>Total</td><td className="num">{formatMoney(order.total)}</td></tr>
          </tfoot>
        </table>
        </div>
      )}

      <dl className="fields timeline">
        <dt>Diagnóstico</dt><dd>{order.diagnosis || 'Aún no registrado'}</dd>
        <dt>Trabajo</dt><dd>{order.workPerformed || 'Aún no registrado'}</dd>
        <dt>Mano de obra</dt><dd>{formatMoney(order.laborCost || 0)}</dd>
        <dt>Entrega estimada</dt><dd>{order.estimatedDeliveryDate || 'Por definir'}</dd>
        <dt>Informe actualizado</dt><dd>{formatDate(order.technicalUpdatedAt)}</dd>
        <dt>Creada</dt><dd>{formatDate(order.createdAt)}</dd>
        <dt>Aceptada</dt><dd>{formatDate(order.acceptedAt)}</dd>
        <dt>Entregada</dt><dd>{formatDate(order.deliveredAt)}</dd>
      </dl>

      {nextStatuses.length > 0 && (
        <>
          <h3>{isRequest ? 'Solicitud' : 'Estado del trabajo'}</h3>
          {isAdmin && <label>Justificación de la intervención<textarea minLength={10} maxLength={500} rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Explica el motivo (mínimo 10 caracteres)" /></label>}
          {!isRequest && <p role="status" className="muted">{stockError || (pending ? 'Confirmando asignación de repuestos…' : 'Asignación de repuestos confirmada.')}</p>}
          {order.status === 'EN_REPARACION' && (!order.diagnosis || !order.workPerformed) && <p className="muted">Guarda el informe técnico antes de marcar la orden como lista.</p>}
          <div className="actions">
            {nextStatuses.map((status) => (
              <button
                key={status}
                className={`btn ${status === 'CANCELADA' ? 'danger-ghost' : 'primary'}`}
                disabled={busy || isAdmin && reason.trim().length < 10 || status === 'ENTREGADA' && pending || status === 'LISTA_PARA_ENTREGA' && (!order.diagnosis || !order.workPerformed)}
                onClick={() => { void change(status); }}
              >
                {isRequest ? (status === 'ACEPTADA' ? 'Aceptar' : 'Rechazar') : STATUS_LABELS[status]}
              </button>
            ))}
          </div>
        </>
      )}

      {(canEdit || canDelete) && (
        <div className="actions footer">
          {canEdit && <button className="btn primary" disabled={busy} onClick={onEdit}>{isRequest ? 'Asignar repuestos' : 'Editar informe técnico'}</button>}
          {canDelete && <button className="btn danger-ghost" onClick={onDelete}>Eliminar</button>}
        </div>
      )}
    </div>
  );
}
