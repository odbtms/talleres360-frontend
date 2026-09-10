import { useCallback, useEffect, useState } from 'react';
import { ordersApi } from './api/ordersApi';
import OrderFilters from './components/OrderFilters';
import OrderList from './components/OrderList';
import OrderDetail from './components/OrderDetail';
import OrderForm from './components/OrderForm';

const EMPTY_FILTERS = { status: '', from: '', to: '' };

export default function App({ session }) {
  const [orders, setOrders] = useState([]);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [selected, setSelected] = useState(null);
  const [formMode, setFormMode] = useState(null); // null | 'create' | 'edit'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      setOrders(await ordersApi.list(filters));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Ejecuta una accion contra la API, refresca la lista y muestra el error del backend si falla
  async function run(action) {
    setError('');
    try {
      const result = await action();
      await loadOrders();
      return result;
    } catch (e) {
      setError(e.message);
      return undefined;
    }
  }

  async function handleSave(payload) {
    const saved = await run(() =>
      formMode === 'edit' ? ordersApi.update(selected.id, payload) : ordersApi.create(payload),
    );
    if (saved) {
      setSelected(saved);
      setFormMode(null);
    }
  }

  async function handleChangeStatus(status) {
    const updated = await run(() => ordersApi.changeStatus(selected.id, status));
    if (updated) setSelected(updated);
  }

  async function handleDelete() {
    if (!window.confirm(`¿Eliminar la orden #${selected.id}?`)) return;
    const deleted = await run(() => ordersApi.remove(selected.id).then(() => true));
    if (deleted) setSelected(null);
  }

  function selectOrder(order) {
    setSelected(order);
    setFormMode(null);
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          Talleres360 <span>Órdenes de trabajo</span>
        </div>
        <div className="topbar-actions">
          <button className="btn primary" onClick={() => setFormMode('create')}>Nueva orden</button>
          <div className="user">
            <span className="user-name">
              {session.name}
              {session.mode === 'local' && <span className="tag">dev</span>}
            </span>
            <span className="user-mail">{session.username}</span>
          </div>
          <button className="btn ghost" onClick={() => session.logout().catch((e) => setError(e.message))}>
            Cerrar sesión
          </button>
        </div>
      </header>

      {error && (
        <div className="alert" role="alert">
          <span>{error}</span>
          <button className="btn icon" aria-label="Cerrar" onClick={() => setError('')}>×</button>
        </div>
      )}

      <main className="layout">
        <section className="panel">
          <OrderFilters value={filters} onChange={setFilters} onReset={() => setFilters(EMPTY_FILTERS)} />
          <OrderList orders={orders} loading={loading} selectedId={selected?.id} onSelect={selectOrder} />
        </section>

        <aside className="panel side">
          {formMode ? (
            <OrderForm
              key={formMode === 'edit' ? `edit-${selected.id}` : 'create'}
              initial={formMode === 'edit' ? selected : null}
              onSubmit={handleSave}
              onCancel={() => setFormMode(null)}
            />
          ) : selected ? (
            <OrderDetail
              order={selected}
              onChangeStatus={handleChangeStatus}
              onEdit={() => setFormMode('edit')}
              onDelete={handleDelete}
            />
          ) : (
            <p className="empty">Selecciona una orden para ver el detalle o crea una nueva.</p>
          )}
        </aside>
      </main>
    </div>
  );
}
