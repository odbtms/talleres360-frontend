import type { ChangeEvent } from 'react';
import { STATUS_LABELS } from '../constants/orderStatus';
import type { OrderFilters as OrderFiltersValue } from '../types';

interface OrderFiltersProps {
  value: OrderFiltersValue;
  onChange: (value: OrderFiltersValue) => void;
  onReset: () => void;
}

export default function OrderFilters({ value, onChange, onReset }: OrderFiltersProps) {
  const set = (field: keyof OrderFiltersValue) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    onChange({ ...value, [field]: e.target.value });

  return (
    <div className="filters">
      <label>
        Estado
        <select value={value.status} onChange={set('status')}>
          <option value="">Todos</option>
          {Object.entries(STATUS_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </label>
      <label>
        Desde
        <input type="date" value={value.from} onChange={set('from')} />
      </label>
      <label>
        Hasta
        <input type="date" value={value.to} onChange={set('to')} />
      </label>
      <button type="button" className="btn ghost" onClick={onReset}>Limpiar</button>
    </div>
  );
}
