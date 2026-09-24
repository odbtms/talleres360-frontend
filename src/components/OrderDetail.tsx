import StatusBadge from './StatusBadge';
import { NEXT_STATUS, STATUS_LABELS } from '../constants/orderStatus';
import { formatDate, formatMoney } from '../utils/format';
import type { Order, OrderStatus } from '../types';
import { WORKSHOPS } from '../features/scheduling/constants/workshops';

interface OrderDetailProps {
  order: Order;
  canWrite: boolean;
  canDelete: boolean;
  onChangeStatus: (status: OrderStatus) => void | Promise<void>;
  onEdit: () => void;
  onDelete: () => void | Promise<void>;
}

export default function OrderDetail({
  order,
  canWrite,
  canDelete,
  onChangeStatus,
  onEdit,
  onDelete,
}: OrderDetailProps) {
  const nextStatuses = canWrite ? NEXT_STATUS[order.status] ?? [] : [];
  const canEdit = canWrite && ['ACEPTADA', 'EN_REPARACION', 'LISTA_PARA_ENTREGA'].includes(order.status);
  const isRequest = order.status === 'RECIBIDA';
  const serviceType = order.serviceType === 'MAINTENANCE' ? 'Mantenciones y arreglos'
    : order.serviceType === 'DIAGNOSTICS' ? 'Diagnóstico' : 'Orden creada internamente';
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
        <dt>Teléfono</dt><dd>{order.customerPhone ? `+56 9 ${order.customerPhone}` : 'No informado'}</dd>
        <dt>Vehículo</dt><dd><span className="plate">{order.vehiclePlate}</span> {order.vehicleModel} {order.vehicleYear ? `· ${order.vehicleYear}` : ''}</dd>
        <dt>Taller</dt><dd>{workshop}</dd>
        <dt>Servicio</dt><dd>{serviceType}</dd>
        <dt>Motivo</dt><dd>{order.description || 'Sin motivo informado'}</dd>
      </dl>

      <section className="technical-summary">
        <h3>Informe técnico</h3>
        <dl className="fields"><dt>Diagnóstico</dt><dd>{order.diagnosis || 'Pendiente'}</dd><dt>Trabajo realizado</dt><dd>{order.workPerformed || 'Pendiente'}</dd><dt>Mano de obra</dt><dd>{formatMoney(order.laborCost ?? 0)}</dd><dt>Total</dt><dd><strong>{formatMoney(order.total)}</strong></dd></dl>
      </section>

      <h3>Repuestos / servicios</h3>
      {order.items.length === 0 ? (
        <p className="muted">Sin ítems.</p>
      ) : (
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
            <tr><td colSpan={3}>Mano de obra</td><td className="num">{formatMoney(order.laborCost ?? 0)}</td></tr>
            <tr><td colSpan={3}>Total</td><td className="num">{formatMoney(order.total)}</td></tr>
          </tfoot>
        </table>
      )}

      <dl className="fields timeline">
        <dt>Creada</dt><dd>{formatDate(order.createdAt)}</dd>
        <dt>Aceptada</dt><dd>{formatDate(order.acceptedAt)}</dd>
        <dt>Entregada</dt><dd>{formatDate(order.deliveredAt)}</dd>
        <dt>Informe técnico</dt><dd>{formatDate(order.technicalUpdatedAt)}</dd>
        <dt>Entrega estimada</dt><dd>{formatDate(order.estimatedDeliveryDate)}</dd>
      </dl>

      {nextStatuses.length > 0 && (
        <>
          <h3>{isRequest ? 'Solicitud' : 'Estado del trabajo'}</h3>
          <div className="actions">
            {nextStatuses.map((status) => (
              <button
                key={status}
                className={`btn ${status === 'CANCELADA' ? 'danger-ghost' : 'primary'}`}
                onClick={() => onChangeStatus(status)}
              >
                {isRequest ? (status === 'ACEPTADA' ? 'Aceptar' : 'Rechazar') : STATUS_LABELS[status]}
              </button>
            ))}
          </div>
        </>
      )}

      {(canEdit || canDelete) && (
        <div className="actions footer">
          {canEdit && <button className="btn primary" onClick={onEdit}>Registrar diagnóstico y costos</button>}
          {canDelete && <button className="btn danger-ghost" onClick={onDelete}>Eliminar</button>}
        </div>
      )}
    </div>
  );
}
