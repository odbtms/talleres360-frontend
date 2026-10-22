import StatusBadge from './StatusBadge';
import { formatDate, formatMoney } from '../utils/format';
import type { Order } from '../types';
import { estadoCompra } from '../utils/estadoCompra';

interface OrderListProps {
  orders: Order[];
  loading: boolean;
  selectedId?: number;
  onSelect: (order: Order) => void;
}

export default function OrderList({ orders, loading, selectedId, onSelect }: OrderListProps) {
  if (loading && orders.length === 0) return <p className="empty">Cargando órdenes…</p>;
  if (orders.length === 0) return <p className="empty">No hay órdenes con esos filtros.</p>;

  return (
    <div className="table-wrap table-wrap--orders" role="region" aria-label="Listado de órdenes" tabIndex={0}>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Tipo / vehículo</th>
            <th>Cliente</th>
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
              <td className="plate">{order.compraRepuestos ? 'Compra de repuestos' : order.vehiclePlate}</td>
              <td>{order.customerName}</td>
              <td>{order.compraRepuestos ? estadoCompra(order) : <StatusBadge status={order.status} />}</td>
              <td className="num">{formatMoney(order.total)}</td>
              <td>{formatDate(order.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
