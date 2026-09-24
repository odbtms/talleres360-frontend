import { useEffect, useState, type FormEvent } from 'react';
import { productsApi } from '../api/productsApi';
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
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    productsApi.list().then((catalog) => {
      setProducts(catalog);
      setSelected(order.items.flatMap((item) => {
        const product = catalog.find((candidate) => candidate.id === item.productId);
        return product ? [{ product, quantity: item.quantity }] : [];
      }));
    }).catch(() => setCatalogError('No se pudo cargar el catálogo de productos.'));
  }, [order.items]);
  const productsTotal = selected.reduce((sum, item) => sum + item.quantity * item.product.price, 0);
  const total = productsTotal + Number(laborCost || 0);
  const addProduct = (product: Product) => {
    if (!product.available || selected.some((item) => item.product.id === product.id)) return;
    setSelected((current) => [...current, { product, quantity: 1 }]); setDrawerOpen(false);
  };
  async function submit(event: FormEvent) {
    event.preventDefault(); setSaving(true);
    try { await onSubmit({ diagnosis: diagnosis.trim(), workPerformed: workPerformed.trim(), laborCost: Number(laborCost), estimatedDeliveryDate, items: selected.map((item) => ({ productId: item.product.id, quantity: item.quantity })) }); }
    finally { setSaving(false); }
  }
  return <>
    {drawerOpen && <div className="catalog-backdrop" onClick={() => setDrawerOpen(false)}><aside className="catalog-drawer" onClick={(event) => event.stopPropagation()} aria-label="Catálogo de productos">
      <div className="detail-head"><h2>Seleccionar producto</h2><button className="btn icon" type="button" onClick={() => setDrawerOpen(false)}>×</button></div>
      {catalogError && <p className="field-error">{catalogError}</p>}
      {!catalogError && products.length === 0 && <div className="products-empty"><h3>No hay productos registrados</h3><p>El catálogo está vacío por el momento.</p></div>}
      <div className="catalog-list">{products.map((product) => <button type="button" className="catalog-product" disabled={!product.available} key={product.id} onClick={() => addProduct(product)}><strong>{product.name}</strong><span>Stock: {product.stock}</span><span>{formatMoney(product.price)}</span><em>{product.available ? 'Disponible' : 'Sin stock'}</em></button>)}</div>
    </aside></div>}
    <form className="form technical-form" onSubmit={submit}>
      <h2>Informe técnico · Orden #{order.id}</h2><p className="muted">Fecha del informe: {new Intl.DateTimeFormat('es-CL').format(new Date())}</p>
      <label>Diagnóstico<textarea required minLength={10} maxLength={2000} rows={4} value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} /></label>
      <label>Trabajo realizado<textarea required minLength={10} maxLength={2000} rows={4} value={workPerformed} onChange={(e) => setWorkPerformed(e.target.value)} /></label>
      <div className="grid"><label>Costo de mano de obra<input required type="number" min={0} value={laborCost} onChange={(e) => setLaborCost(e.target.value === '' ? '' : Number(e.target.value))} /></label><label>Entrega estimada<input required type="date" min={today()} value={estimatedDeliveryDate} onChange={(e) => setEstimatedDeliveryDate(e.target.value)} /></label></div>
      <div className="detail-head"><h3>Repuestos y servicios</h3><button className="btn ghost" type="button" onClick={() => setDrawerOpen(true)}>Seleccionar producto</button></div>
      {selected.length === 0 && <p className="muted">No se agregaron productos.</p>}
      {selected.map((item) => <div className="selected-product" key={item.product.id}><span><strong>{item.product.name}</strong><small>{formatMoney(item.product.price)} · Stock {item.product.stock}</small></span><label>Cantidad<input type="number" min={1} max={item.product.stock} value={item.quantity} onChange={(e) => setSelected((current) => current.map((currentItem) => currentItem.product.id === item.product.id ? { ...currentItem, quantity: Number(e.target.value) } : currentItem))} /></label><strong>{formatMoney(item.quantity * item.product.price)}</strong><button className="btn danger-ghost" type="button" onClick={() => setSelected((current) => current.filter((currentItem) => currentItem.product.id !== item.product.id))}>Quitar</button></div>)}
      <dl className="technical-total"><dt>Productos</dt><dd>{formatMoney(productsTotal)}</dd><dt>Mano de obra</dt><dd>{formatMoney(Number(laborCost || 0))}</dd><dt>Total</dt><dd>{formatMoney(total)}</dd></dl>
      <div className="actions footer"><button className="btn ghost" type="button" onClick={onCancel}>Cancelar</button><button className="btn primary" disabled={saving} type="submit">{saving ? 'Guardando…' : 'Guardar informe técnico'}</button></div>
    </form>
  </>;
}
