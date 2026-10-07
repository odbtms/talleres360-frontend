import { useCallback, useEffect, useRef, useState } from 'react';
import './styles/gestion.css';
import { ordersApi } from './api/ordersApi';
import OrderFilters from './components/OrderFilters';
import OrderList from './components/OrderList';
import OrderDetail from './components/OrderDetail';
import OrderForm from './components/OrderForm';
import OrderItemsForm from './components/OrderItemsForm';
import ProductsPage from './components/ProductsPage';
import AdminDashboard from './components/AdminDashboard';
import MenuLateral from './layouts/MenuLateral';
import ReportesPage from './features/reports/pages/ReportesPage';
import { OPCIONES_GESTION, TITULOS_GESTION } from './constants/navegacionGestion';
import type { DestinoGestion, VistaGestion } from './types/gestion';
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
  const [formMode, setFormMode] = useState<'create' | 'items' | null>(null);
  const [view, setView] = useState<VistaGestion>(session.roles.includes('Admin') ? 'dashboard' : 'orders');
  const [menuAbierto, setMenuAbierto] = useState(false);
  const botonMenu = useRef<HTMLButtonElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { canWrite, canCreate, canDelete } = permissionsFor(session.roles);

  function navegar(destino: DestinoGestion): void {
    const opcion = OPCIONES_GESTION.find((item) => item.id === destino);
    if (!opcion?.roles.some((rol) => session.roles.includes(rol))) return;
    if (menuAbierto) botonMenu.current?.focus();
    setMenuAbierto(false);
    setError('');
    setView(destino === 'new-order' ? 'orders' : destino);
    setFormMode(destino === 'new-order' ? 'create' : null);
  }

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
    if (view === 'orders') void loadOrders();
  }, [loadOrders, view]);

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

  async function handleItemsSave(payload: OrderPayload) {
    const saved = await run(() => ordersApi.update(selected!.id, payload));
    if (saved) { setSelected(saved); setFormMode(null); }
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
    <div className="app management-shell" onKeyDown={(evento) => {
      if (evento.key === 'Escape' && menuAbierto) {
        setMenuAbierto(false);
        botonMenu.current?.focus();
      }
    }}>
      <MenuLateral roles={session.roles} destinoActivo={view} abierto={menuAbierto} onNavegar={navegar} />
      <div className="management-workspace">
      <header className="topbar management-topbar">
        <div className="management-topbar__heading">
          <button ref={botonMenu} className="btn ghost management-menu-toggle" type="button" aria-controls="menu-gestion" aria-expanded={menuAbierto} onClick={() => setMenuAbierto((abierto) => !abierto)}>{menuAbierto ? 'Cerrar menú' : 'Menú'}</button>
          <div className="brand">{formMode === 'create' ? 'Nueva orden' : TITULOS_GESTION[view]}</div>
        </div>
        <div className="topbar-actions">
          {canCreate && <button className="btn primary" type="button" onClick={() => navegar('new-order')}>Nueva orden</button>}
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

      {view === 'dashboard' ? <AdminDashboard onOpenOrders={() => navegar('orders')} onOpenProducts={() => navegar('products')} />
        : view === 'products' ? <ProductsPage />
        : view === 'reports' ? <ReportesPage /> : <main className="layout">
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
          ) : formMode === 'items' && selected ? (
            <OrderItemsForm order={selected} onSubmit={handleItemsSave} onCancel={() => setFormMode(null)} />
          ) : selected ? (
            <OrderDetail
              order={selected}
              canWrite={canWrite}
              canDelete={canDelete}
              onChangeStatus={handleChangeStatus}
              onEdit={() => setFormMode('items')}
              onDelete={handleDelete}
            />
          ) : (
            <p className="empty">Selecciona una orden para ver el detalle o crea una nueva.</p>
          )}
        </aside>
      </main>}
      </div>
    </div>
  );
}
