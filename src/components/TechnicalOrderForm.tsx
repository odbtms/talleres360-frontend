import { useEffect, useState, type FormEvent } from 'react';
import { productsApi } from '../api/productsApi';
import { ordersApi, type EstadoStockOrden } from '../api/ordersApi';
import { formatMoney } from '../utils/format';
import type { Order, Product, TechnicalUpdatePayload } from '../types';

interface SelectedProduct { product: Product; quantity: number; }
interface Props { order: Order; onSubmit: (payload: TechnicalUpdatePayload) => Promise<void>; onCancel: () => void; }
const today = () => new Date().toISOString().slice(0, 10);

export default function TechnicalOrderForm({ order, onSubmit, onCancel }: Props) {
  const [diagnosis, setDiagnosis] = useState(order.diagnosis ?? '');
  const [workPerformed, setWorkPerformed] = useState(order.workPerformed ?? '');
  const [laborCost, setLaborCost] = useState<number | ''>(order.laborCost ?? '');
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState(order.estimatedDeliveryDate ?? today());
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<SelectedProduct[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [catalogError, setCatalogError] = useState('');
  const [validationError, setValidationError] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stock, setStock] = useState<EstadoStockOrden | null>(null);
  useEffect(() => {
    let active = true;
    setLoading(true); setCatalogError('');
    Promise.all([productsApi.list(), ordersApi.stock(order.id)]).then(([catalog, allocation]) => {
      if (!active) return;
      if (order.items.some((item) => !catalog.some((product) => product.id === item.productId))) {
        throw new Error('No se pudieron recuperar todos los repuestos de la orden.');
      }
      setProducts(catalog);
      setStock(allocation);
      const quantities = new Map<number, number>();
      order.items.forEach((item) => quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity));
      setSelected(catalog.filter((product) => quantities.has(product.id))
        .map((product) => ({ product, quantity: quantities.get(product.id)! })));
    }).catch(() => { if (active) setCatalogError('No se pudieron cargar los repuestos y su disponibilidad. Vuelve a abrir el informe para intentarlo nuevamente.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [order.id, order.items]);
  const assigned = (product: Product) => stock?.quantities[String(product.id)] ?? 0;
  const limit = (product: Product) => assigned(product) + (product.active ? product.stock : 0);
  const productsTotal = selected.reduce((sum, item) => sum + item.quantity * item.product.price, 0);
  const total = productsTotal + Number(laborCost || 0);
  const addProduct = (product: Product) => {
    if (limit(product) < 1 || selected.some((item) => item.product.id === product.id)) return;
    setSelected((current) => [...current, { product, quantity: 1 }]); setDrawerOpen(false);
  };
  async function submit(event: FormEvent) {
    event.preventDefault();
    setValidationError('');
    if (loading || catalogError || !stock) return;
    if (selected.some((item) => !Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > limit(item.product))) {
      setValidationError('Revisa las cantidades: no pueden superar los repuestos disponibles para esta orden.');
      return;
    }
    setSaving(true);
    try { await onSubmit({ diagnosis: diagnosis.trim(), workPerformed: workPerformed.trim(), laborCost: Number(laborCost), estimatedDeliveryDate, items: selected.map((item) => ({ productId: item.product.id, quantity: item.quantity })) }); }
    finally { setSaving(false); }
  }
  return <>
    {drawerOpen && <div className="catalog-backdrop" onClick={() => setDrawerOpen(false)}><aside className="catalog-drawer" onClick={(event) => event.stopPropagation()} aria-label="Catálogo de productos">
      <div className="detail-head"><h2>Seleccionar producto</h2><button className="btn icon" type="button" onClick={() => setDrawerOpen(false)}>×</button></div>
      {catalogError && <p className="field-error">{catalogError}</p>}
      {!catalogError && products.length === 0 && <div className="products-empty"><h3>No hay productos registrados</h3><p>El catálogo está vacío por el momento.</p></div>}
      <div className="catalog-list">{products.map((product) => <button type="button" className="catalog-product" disabled={limit(product) < 1} key={product.id} onClick={() => addProduct(product)}><strong>{product.name}</strong><span>Stock libre: {product.stock} · Asignado a esta orden: {assigned(product)}</span><span>{formatMoney(product.price)}</span><em>{product.active ? (limit(product) > 0 ? 'Disponible' : 'Sin stock') : 'Inactivo'}</em></button>)}</div>
    </aside></div>}
    <form className="form technical-form" onSubmit={submit}>
      <h2>Informe técnico · Orden #{order.id}</h2><p className="muted">Fecha del informe: {new Intl.DateTimeFormat('es-CL').format(new Date())}</p>
      {loading && <p role="status">Cargando disponibilidad de repuestos…</p>}
      {catalogError && <p className="field-error" role="alert">{catalogError}</p>}
      {validationError && <p className="field-error" role="alert">{validationError}</p>}
      {stock?.pending && <p role="status">Los cambios de repuestos todavía están pendientes de confirmación. Si faltan existencias, reduce la cantidad o retira el producto. La entrega se habilita cuando se confirman los repuestos.</p>}
      <label>Diagnóstico<textarea required minLength={10} maxLength={2000} rows={4} value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} /></label>
      <label>Trabajo realizado<textarea required minLength={10} maxLength={2000} rows={4} value={workPerformed} onChange={(e) => setWorkPerformed(e.target.value)} /></label>
      <div className="grid"><label>Costo de mano de obra<input required type="number" min={0} value={laborCost} onChange={(e) => setLaborCost(e.target.value === '' ? '' : Number(e.target.value))} /></label><label>Entrega estimada<input required type="date" min={today()} value={estimatedDeliveryDate} onChange={(e) => setEstimatedDeliveryDate(e.target.value)} /></label></div>
      <div className="detail-head"><h3>Repuestos y servicios</h3><button className="btn ghost" disabled={loading || !!catalogError} type="button" onClick={() => setDrawerOpen(true)}>Seleccionar producto</button></div>
      {selected.length === 0 && <p className="muted">No se agregaron productos.</p>}
      {selected.map((item) => <div className="selected-product" key={item.product.id}><span><strong>{item.product.name}</strong><small>{formatMoney(item.product.price)} · Stock libre {item.product.stock} · Asignado {assigned(item.product)}</small></span><label>Cantidad<input required type="number" min={1} max={limit(item.product)} step={1} value={item.quantity} onChange={(e) => setSelected((current) => current.map((currentItem) => currentItem.product.id === item.product.id ? { ...currentItem, quantity: Number(e.target.value) } : currentItem))} /></label><strong>{formatMoney(item.quantity * item.product.price)}</strong><button className="btn danger-ghost" type="button" onClick={() => setSelected((current) => current.filter((currentItem) => currentItem.product.id !== item.product.id))}>Quitar</button></div>)}
      <dl className="technical-total"><dt>Productos</dt><dd>{formatMoney(productsTotal)}</dd><dt>Mano de obra</dt><dd>{formatMoney(Number(laborCost || 0))}</dd><dt>Total</dt><dd>{formatMoney(total)}</dd></dl>
      <div className="actions footer"><button className="btn ghost" type="button" onClick={onCancel}>Cancelar</button><button className="btn primary" disabled={saving || loading || !!catalogError} type="submit">{saving ? 'Guardando…' : 'Guardar informe técnico'}</button></div>
    </form>
  </>;
}
