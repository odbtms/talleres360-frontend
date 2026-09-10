import { STATUS_LABELS } from '../constants/orderStatus';

export default function OrderFilters({ value, onChange, onReset }) {
  const set = (field) => (e) => onChange({ ...value, [field]: e.target.value });

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
