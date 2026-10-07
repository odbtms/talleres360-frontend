import { useEffect, useState, type FormEvent } from 'react';
import { productsApi } from '../api/productsApi';
import { formatMoney } from '../utils/format';
import type { Order, OrderPayload, Product } from '../types';

interface SelectedProduct { product: Product; quantity: number; }
interface Props { order: Order; onSubmit: (payload: OrderPayload) => Promise<void>; onCancel: () => void; }

// Asigna repuestos del catalogo (ms-catalog) a una orden RECIBIDA. Se guarda con PUT /api/orders/{id}
// enviando la orden completa; el precio unitario es el del catalogo al momento de asignar.
export default function OrderItemsForm({ order, onSubmit, onCancel }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<SelectedProduct[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [catalogError, setCatalogError] = useState('');
  const [validationError, setValidationError] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    setLoading(true); setCatalogError('');
    productsApi.list().then((catalog) => {
      if (!active) return;
      setProducts(catalog);
      const quantities = new Map<number, number>();
      order.items.forEach((item) => quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity));
      setSelected(catalog.filter((product) => quantities.has(product.id))
        .map((product) => ({ product, quantity: quantities.get(product.id)! })));
    }).catch(() => { if (active) setCatalogError('No se pudo cargar el catálogo de repuestos. Vuelve a abrir el formulario para intentarlo nuevamente.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [order.id, order.items]);
  const limit = (product: Product) => (product.active ? product.stock : 0);
  const total = selected.reduce((sum, item) => sum + item.quantity * item.product.price, 0);
  const addProduct = (product: Product) => {
    if (limit(product) < 1 || selected.some((item) => item.product.id === product.id)) return;
    setSelected((current) => [...current, { product, quantity: 1 }]); setDrawerOpen(false);
  };
  async function submit(event: FormEvent) {
    event.preventDefault();
    setValidationError('');
    if (loading || catalogError) return;
    if (selected.some((item) => !Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > limit(item.product))) {
      setValidationError('Revisa las cantidades: no pueden superar el stock disponible.');
      return;
    }
    setSaving(true);
    try {
      await onSubmit({
        workshopId: order.workshopId,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        vehiclePlate: order.vehiclePlate,
        vehicleModel: order.vehicleModel ?? '',
        description: order.description ?? '',
        items: selected.map((item) => ({ productId: item.product.id, quantity: item.quantity, unitPrice: item.product.price })),
      });
    } finally { setSaving(false); }
  }
  return <>
    {drawerOpen && <div className="catalog-backdrop" onClick={() => setDrawerOpen(false)}><aside className="catalog-drawer" onClick={(event) => event.stopPropagation()} aria-label="Catálogo de productos">
      <div className="detail-head"><h2>Seleccionar producto</h2><button className="btn icon" type="button" onClick={() => setDrawerOpen(false)}>×</button></div>
      {catalogError && <p className="field-error">{catalogError}</p>}
      {!catalogError && products.length === 0 && <div className="products-empty"><h3>No hay productos registrados</h3><p>El catálogo está vacío por el momento.</p></div>}
      <div className="catalog-list">{products.map((product) => <button type="button" className="catalog-product" disabled={limit(product) < 1} key={product.id} onClick={() => addProduct(product)}><strong>{product.name}</strong><span>Stock: {product.stock}</span><span>{formatMoney(product.price)}</span><em>{product.active ? (limit(product) > 0 ? 'Disponible' : 'Sin stock') : 'Inactivo'}</em></button>)}</div>
    </aside></div>}
    <form className="form technical-form" onSubmit={submit}>
      <h2>Repuestos · Orden #{order.id}</h2>
      {loading && <p role="status">Cargando catálogo…</p>}
      {catalogError && <p className="field-error" role="alert">{catalogError}</p>}
      {validationError && <p className="field-error" role="alert">{validationError}</p>}
      <div className="detail-head"><h3>Repuestos y servicios</h3><button className="btn ghost" disabled={loading || !!catalogError} type="button" onClick={() => setDrawerOpen(true)}>Seleccionar producto</button></div>
      {selected.length === 0 && <p className="muted">No se agregaron productos.</p>}
      {selected.map((item) => <div className="selected-product" key={item.product.id}><span><strong>{item.product.name}</strong><small>{formatMoney(item.product.price)} · Stock {item.product.stock}</small></span><label>Cantidad<input required type="number" min={1} max={limit(item.product)} step={1} value={item.quantity} onChange={(e) => setSelected((current) => current.map((currentItem) => currentItem.product.id === item.product.id ? { ...currentItem, quantity: Number(e.target.value) } : currentItem))} /></label><strong>{formatMoney(item.quantity * item.product.price)}</strong><button className="btn danger-ghost" type="button" onClick={() => setSelected((current) => current.filter((currentItem) => currentItem.product.id !== item.product.id))}>Quitar</button></div>)}
      <dl className="technical-total"><dt>Total</dt><dd>{formatMoney(total)}</dd></dl>
      <div className="actions footer"><button className="btn ghost" type="button" onClick={onCancel}>Cancelar</button><button className="btn primary" disabled={saving || loading || !!catalogError} type="submit">{saving ? 'Guardando…' : 'Guardar repuestos'}</button></div>
    </form>
  </>;
}
