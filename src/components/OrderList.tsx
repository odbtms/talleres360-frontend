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
    <div className="table-wrap table-wrap--orders table-wrap--responsive" role="region" aria-label="Listado de órdenes" tabIndex={0}>
      <table role="table">
        <thead role="rowgroup">
          <tr role="row">
            <th role="columnheader" scope="col">#</th>
            <th role="columnheader" scope="col">Tipo / vehículo</th>
            <th role="columnheader" scope="col">Cliente</th>
            <th role="columnheader" scope="col">Estado</th>
            <th role="columnheader" scope="col" className="num">Total</th>
            <th role="columnheader" scope="col">Creada</th>
          </tr>
        </thead>
        <tbody role="rowgroup">
          {orders.map((order) => (
            <tr role="row"
              key={order.id}
              className={order.id === selectedId ? 'selected' : ''}
              onClick={() => onSelect(order)}
            >
              <td role="cell" data-label="Orden"><button className="btn ghost small" type="button" aria-label={`Ver orden #${order.id}`} onClick={(event) => { event.stopPropagation(); onSelect(order); }}>#{order.id}</button></td>
              <td role="cell" data-label="Tipo / vehículo" className="plate">{order.compraRepuestos ? 'Compra de repuestos' : order.vehiclePlate}</td>
              <td role="cell" data-label="Cliente">{order.customerName}</td>
              <td role="cell" data-label="Estado">{order.compraRepuestos ? estadoCompra(order) : <StatusBadge status={order.status} />}</td>
              <td role="cell" data-label="Total" className="num">{formatMoney(order.total)}</td>
              <td role="cell" data-label="Creada">{formatDate(order.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
