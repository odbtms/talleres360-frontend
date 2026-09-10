import StatusBadge from './StatusBadge';
import { NEXT_STATUS, STATUS_LABELS } from '../constants/orderStatus';
import { formatDate, formatMoney } from '../utils/format';

export default function OrderDetail({ order, onChangeStatus, onEdit, onDelete }) {
  const nextStatuses = NEXT_STATUS[order.status] ?? [];

  return (
    <div className="detail">
      <div className="detail-head">
        <h2>Orden #{order.id}</h2>
        <StatusBadge status={order.status} />
      </div>

      <dl className="fields">
        <dt>Cliente</dt><dd>{order.customerName}</dd>
        <dt>Email</dt><dd>{order.customerEmail}</dd>
        <dt>Vehículo</dt><dd><span className="plate">{order.vehiclePlate}</span> {order.vehicleModel}</dd>
        <dt>Taller</dt><dd>{order.workshopId}</dd>
        <dt>Trabajo</dt><dd>{order.description || '—'}</dd>
      </dl>

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
                <td>{item.productId}</td>
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
      )}

      <dl className="fields timeline">
        <dt>Creada</dt><dd>{formatDate(order.createdAt)}</dd>
        <dt>Aceptada</dt><dd>{formatDate(order.acceptedAt)}</dd>
        <dt>Entregada</dt><dd>{formatDate(order.deliveredAt)}</dd>
      </dl>

      {nextStatuses.length > 0 && (
        <>
          <h3>Cambiar estado</h3>
          <div className="actions">
            {nextStatuses.map((status) => (
              <button
                key={status}
                className={`btn ${status === 'CANCELADA' ? 'danger-ghost' : 'primary'}`}
                onClick={() => onChangeStatus(status)}
              >
                {STATUS_LABELS[status]}
              </button>
            ))}
          </div>
        </>
      )}

      <div className="actions footer">
        {order.status === 'RECIBIDA' && <button className="btn ghost" onClick={onEdit}>Editar</button>}
        <button className="btn danger-ghost" onClick={onDelete}>Eliminar</button>
      </div>
    </div>
  );
}
