import { useCallback, useEffect, useState } from 'react';
import { ordersApi } from './api/ordersApi';
import OrderFilters from './components/OrderFilters';
import OrderList from './components/OrderList';
import OrderDetail from './components/OrderDetail';
import OrderForm from './components/OrderForm';
import { permissionsFor } from './auth/roles';
import type { Order, OrderFilters as OrderFiltersValue, OrderPayload, OrderStatus, Session } from './types';

const EMPTY_FILTERS: OrderFiltersValue = { status: '', from: '', to: '' };

interface AppProps {
  session: Session;
}

const errorMessage = (error: unknown) => (error instanceof Error ? error.message : String(error));

export default function App({ session }: AppProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [selected, setSelected] = useState<Order | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { canWrite, canDelete } = permissionsFor(session.roles);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      setOrders(await ordersApi.list(filters));
    } catch (e: unknown) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Ejecuta una accion contra la API, refresca la lista y muestra el error del backend si falla
  async function run<T>(action: () => Promise<T>): Promise<T | undefined> {
    setError('');
    try {
      const result = await action();
      await loadOrders();
      return result;
    } catch (e: unknown) {
      setError(errorMessage(e));
      return undefined;
    }
  }

  async function handleSave(payload: OrderPayload) {
    const saved = await run(() =>
      formMode === 'edit' ? ordersApi.update(selected!.id, payload) : ordersApi.create(payload),
    );
    if (saved) {
      setSelected(saved);
      setFormMode(null);
    }
  }

  async function handleChangeStatus(status: OrderStatus) {
    const updated = await run(() => ordersApi.changeStatus(selected!.id, status));
    if (updated) setSelected(updated);
  }

  async function handleDelete() {
    if (!window.confirm(`¿Eliminar la orden #${selected!.id}?`)) return;
    const deleted = await run(() => ordersApi.remove(selected!.id).then(() => true));
    if (deleted) setSelected(null);
  }

  function selectOrder(order: Order) {
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
          {canWrite && <button className="btn primary" onClick={() => setFormMode('create')}>Nueva orden</button>}
          <div className="user">
            <span className="user-name">
              {session.name}
              {session.mode === 'local' && <span className="tag">dev</span>}
            </span>
            <span className="user-mail">
              {session.username} · {session.roles.length ? session.roles.join(', ') : 'sin rol'}
            </span>
          </div>
          <button className="btn ghost" onClick={() => session.logout().catch((e: unknown) => setError(errorMessage(e)))}>
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
              key={formMode === 'edit' ? `edit-${selected!.id}` : 'create'}
              initial={formMode === 'edit' ? selected : null}
              onSubmit={handleSave}
              onCancel={() => setFormMode(null)}
            />
          ) : selected ? (
            <OrderDetail
              order={selected}
              canWrite={canWrite}
              canDelete={canDelete}
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
