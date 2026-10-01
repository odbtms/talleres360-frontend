import { useCallback, useEffect, useState } from 'react';
import { ordersApi } from './api/ordersApi';
import OrderFilters from './components/OrderFilters';
import OrderList from './components/OrderList';
import OrderDetail from './components/OrderDetail';
import OrderForm from './components/OrderForm';
import TechnicalOrderForm from './components/TechnicalOrderForm';
import ProductsPage from './components/ProductsPage';
import AdminDashboard from './components/AdminDashboard';
import { permissionsFor } from './auth/roles';
import type { Order, OrderFilters as OrderFiltersValue, OrderPayload, OrderStatus, Session, TechnicalUpdatePayload } from './types';

const EMPTY_FILTERS: OrderFiltersValue = { status: '', from: '', to: '' };

interface AppProps {
  session: Session;
}

const errorMessage = (error: unknown) => (error instanceof Error ? error.message : String(error));

export default function App({ session }: AppProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [selected, setSelected] = useState<Order | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'technical' | null>(null);
  const [view, setView] = useState<'dashboard' | 'orders' | 'products'>(session.roles.includes('Admin') ? 'dashboard' : 'orders');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { canWrite, canCreate, canDelete } = permissionsFor(session.roles);

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
    const saved = await run(() => ordersApi.create(payload));
    if (saved) {
      setSelected(saved);
      setFormMode(null);
    }
  }

  async function handleTechnicalSave(payload: TechnicalUpdatePayload) {
    const saved = await run(() => ordersApi.updateTechnical(selected!.id, payload));
    if (saved) { setSelected(saved); setFormMode(null); }
  }

  async function handleChangeStatus(status: OrderStatus) {
    let reason: string | undefined;
    if (session.roles.includes('Admin')) {
      const value = window.prompt('Motivo de la intervención administrativa (mínimo 10 caracteres):');
      if (value === null) return;
      reason = value.trim();
      if (reason.length < 10) { setError('Explica el motivo de la intervención con al menos 10 caracteres.'); return; }
    }
    const updated = await run(() => ordersApi.changeStatus(selected!.id, status, reason));
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
          {session.roles.includes('Admin') && <>
            <button className="btn ghost" onClick={() => { setView('dashboard'); setFormMode(null); }}>Dashboard</button>
            <button className="btn ghost" onClick={() => { setView('orders'); setFormMode(null); }}>Órdenes</button>
            <button className="btn ghost" onClick={() => { setView('products'); setFormMode(null); }}>Productos</button>
          </>}
          {canCreate && <button className="btn primary" onClick={() => { setView('orders'); setFormMode('create'); }}>Nueva orden</button>}
          <div className="user">
            <span className="user-name">
              {session.name}
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

      {view === 'dashboard' ? <AdminDashboard onOpenOrders={() => setView('orders')} onOpenProducts={() => setView('products')} />
        : view === 'products' ? <ProductsPage /> : <main className="layout">
        <section className="panel">
          <OrderFilters value={filters} onChange={setFilters} onReset={() => setFilters(EMPTY_FILTERS)} />
          <OrderList orders={orders} loading={loading} selectedId={selected?.id} onSelect={selectOrder} />
        </section>

        <aside className="panel side">
          {formMode === 'create' ? (
            <OrderForm
              key="create"
              initial={null}
              onSubmit={handleSave}
              onCancel={() => setFormMode(null)}
            />
          ) : formMode === 'technical' && selected ? (
            <TechnicalOrderForm order={selected} onSubmit={handleTechnicalSave} onCancel={() => setFormMode(null)} />
          ) : selected ? (
            <OrderDetail
              order={selected}
              canWrite={canWrite}
              canDelete={canDelete}
              onChangeStatus={handleChangeStatus}
              onEdit={() => setFormMode('technical')}
              onDelete={handleDelete}
            />
          ) : (
            <p className="empty">Selecciona una orden para ver el detalle o crea una nueva.</p>
          )}
        </aside>
      </main>}
    </div>
  );
}
