import StatusBadge from './StatusBadge';
import { formatDate, formatMoney } from '../utils/format';

export default function OrderList({ orders, loading, selectedId, onSelect }) {
  if (loading && orders.length === 0) return <p className="empty">Cargando órdenes…</p>;
  if (orders.length === 0) return <p className="empty">No hay órdenes con esos filtros.</p>;

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Patente</th>
            <th>Cliente</th>
            <th>Taller</th>
            <th>Estado</th>
            <th className="num">Total</th>
            <th>Creada</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr
              key={order.id}
              className={order.id === selectedId ? 'selected' : ''}
              onClick={() => onSelect(order)}
            >
              <td>{order.id}</td>
              <td className="plate">{order.vehiclePlate}</td>
              <td>{order.customerName}</td>
              <td>{order.workshopId}</td>
              <td><StatusBadge status={order.status} /></td>
              <td className="num">{formatMoney(order.total)}</td>
              <td>{formatDate(order.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
