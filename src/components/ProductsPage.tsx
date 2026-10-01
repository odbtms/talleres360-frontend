import { useEffect, useState, type FormEvent } from 'react';
import { productsApi } from '../api/productsApi';
import { formatMoney } from '../utils/format';
import type { Product, ProductInput } from '../types';

const emptyProduct: ProductInput = { sku: '', name: '', stock: 0, price: 0, active: true };

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<ProductInput>(emptyProduct);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function reload() {
    try { setProducts(await productsApi.list()); setError(''); }
    catch { setError('No pudimos cargar los productos. Inténtalo nuevamente.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { void reload(); }, []);

  function edit(product: Product) {
    setEditingId(product.id);
    setForm({ sku: product.sku, name: product.name, stock: product.stock, price: product.price, active: product.active });
    setNotice('');
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setSaving(true); setError(''); setNotice('');
    try {
      if (editingId === null) await productsApi.create(form);
      else await productsApi.update(editingId, form);
      setForm(emptyProduct); setEditingId(null);
      setNotice('Producto guardado correctamente.');
      await reload();
    } catch { setError('No se pudo guardar el producto. Revisa el SKU y los datos ingresados.'); }
    finally { setSaving(false); }
  }

  return <main className="products-page panel">
    <header><h1>Productos y stock</h1><p>El administrador define precio, disponibilidad y existencias. El operador solo consulta y selecciona repuestos.</p></header>
    {error && <div className="alert" role="alert">{error}</div>}
    {notice && <p className="catalog-notice" role="status">{notice}</p>}
    <form className="catalog-form" onSubmit={(event) => void save(event)}>
      <h2>{editingId === null ? 'Nuevo producto' : `Editar producto #${editingId}`}</h2>
      <div className="catalog-form-grid">
        <label>SKU<input required maxLength={60} value={form.sku} onChange={(event) => setForm({ ...form, sku: event.target.value.toUpperCase() })} /></label>
        <label>Nombre<input required maxLength={160} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
        <label>Precio<input required type="number" min="0" step="0.01" value={form.price} onChange={(event) => setForm({ ...form, price: Number(event.target.value) })} /></label>
        <label>Stock<input required type="number" min="0" step="1" value={form.stock} onChange={(event) => setForm({ ...form, stock: Number(event.target.value) })} /></label>
        <label className="catalog-check"><input type="checkbox" checked={form.active} onChange={(event) => setForm({ ...form, active: event.target.checked })} /> Activo</label>
      </div>
      <div className="actions"><button className="btn primary" type="submit" disabled={saving}>{saving ? 'Guardando…' : 'Guardar producto'}</button>
        {editingId !== null && <button className="btn ghost" type="button" onClick={() => { setEditingId(null); setForm(emptyProduct); }}>Cancelar edición</button>}</div>
    </form>
    {loading && <p className="empty">Cargando productos…</p>}
    {!loading && !error && products.length === 0 && <div className="products-empty"><h2>No hay productos registrados</h2><p>Agrega el primer repuesto con el formulario superior.</p></div>}
    {products.length > 0 && <div className="table-wrap"><table><thead><tr><th>SKU</th><th>Producto</th><th>Stock</th><th>Precio</th><th>Estado</th><th>Acción</th></tr></thead>
      <tbody>{products.map((product) => <tr key={product.id}><td>{product.sku}</td><td>{product.name}</td><td>{product.stock}</td><td>{formatMoney(product.price)}</td><td>{product.available ? 'Disponible' : product.active ? 'Sin stock' : 'Inactivo'}</td><td><button className="btn ghost small" type="button" onClick={() => edit(product)}>Editar</button></td></tr>)}</tbody></table></div>}
  </main>;
}
