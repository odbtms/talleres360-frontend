import { useEffect, useState, type FormEvent } from 'react';
import { productsApi, categoriasApi } from '../api/productsApi';
import CategoriasManager from './CategoriasManager';
import { formatMoney } from '../utils/format';
import type { Product, ProductInput, Categoria } from '../types';

const emptyProduct: ProductInput = { sku: '', name: '', stock: 0, price: 0, active: true };

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categorias,setCategorias]=useState<Categoria[]>([]);
  const [form, setForm] = useState<ProductInput>(emptyProduct);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function reload() {
    try { const [p,c]=await Promise.all([productsApi.list(),categoriasApi.list()]);setProducts(p);setCategorias(c);setError(''); }
    catch { setError('No pudimos cargar los productos. Inténtalo nuevamente.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { void reload(); const timer = window.setInterval(() => void reload(), 5000); return () => window.clearInterval(timer); }, []);

  function edit(product: Product) {
    setEditingId(product.id);
    setForm({ sku: product.sku, name: product.name, stock: product.stock, price: product.price, active: product.active, categoriaId: product.categoriaId });
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
    <header><h1>Productos y stock</h1><p>Solo el administrador ve las cantidades de inventario y modifica precios y stock. Actualización cada 5 segundos.</p>
      <button className="btn ghost" type="button" disabled={saving} onClick={() => {
        if (!window.confirm('¿Agregar repuestos de ejemplo con precios y existencias editables? No se modificarán productos existentes.')) return;
        setSaving(true); setError('');
        void productsApi.cargaInicial().then(async resultado => { setNotice(`${resultado.agregados} repuestos de ejemplo agregados. Revisa sus precios y stock antes de usarlos.`); await reload(); })
          .catch(() => setError('No se pudieron agregar los repuestos de ejemplo.'))
          .finally(() => setSaving(false));
      }}>Agregar repuestos de ejemplo</button></header>
    {error && <div className="alert" role="alert">{error}</div>}
    {notice && <p className="catalog-notice" role="status">{notice}</p>}
    <form className="catalog-form" onSubmit={(event) => void save(event)}>
      <h2>{editingId === null ? 'Nuevo producto' : `Editar producto #${editingId}`}</h2>
      <div className="catalog-form-grid">
        <label>SKU<input required maxLength={60} value={form.sku} onChange={(event) => setForm({ ...form, sku: event.target.value.toUpperCase() })} /></label>
        <label>Nombre<input required maxLength={160} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
        <label>Categoría<select value={form.categoriaId||''} onChange={e=>setForm({...form,categoriaId:e.target.value?Number(e.target.value):null})}><option value="">General</option>{categorias.filter(c=>c.activa||c.id===form.categoriaId).map(c=><option key={c.id} value={c.id}>{c.nombre}{c.activa?'':' (inactiva)'}</option>)}</select></label>
        <label>Precio<input required type="number" min="0" step="0.01" value={form.price} onChange={(event) => setForm({ ...form, price: Number(event.target.value) })} /></label>
        <label>Stock<input required type="number" min="0" step="1" value={form.stock} onChange={(event) => setForm({ ...form, stock: Number(event.target.value) })} /></label>
        <label className="catalog-check"><input type="checkbox" checked={form.active} onChange={(event) => setForm({ ...form, active: event.target.checked })} /> Activo</label>
      </div>
      <div className="actions"><button className="btn primary" type="submit" disabled={saving}>{saving ? 'Guardando…' : 'Guardar producto'}</button>
        {editingId !== null && <button className="btn ghost" type="button" onClick={() => { setEditingId(null); setForm(emptyProduct); }}>Cancelar edición</button>}</div>
    </form>
    {loading && <p className="empty">Cargando productos…</p>}
    {!loading && !error && products.length === 0 && <div className="products-empty"><h2>No hay productos registrados</h2><p>Agrega el primer repuesto con el formulario superior.</p></div>}
    {products.length > 0 && <div className="table-wrap" role="region" aria-label="Listado de productos" tabIndex={0}><table><thead><tr><th>SKU</th><th>Producto</th><th>Stock</th><th>Precio</th><th>Estado</th><th>Acción</th></tr></thead>
      <tbody>{products.map((product) => <tr key={product.id}><td>{product.sku}</td><td>{product.name}<small> · {product.categoriaNombre||'General'}</small></td><td>{product.stock}</td><td>{formatMoney(product.price)}</td><td>{product.available ? 'Disponible' : product.active ? 'Sin stock' : 'Inactivo'}</td><td><div className="actions"><button className="btn ghost small" type="button" onClick={() => edit(product)}>Editar</button><button className="btn danger-ghost small" type="button" disabled={!product.active} onClick={()=>{if(window.confirm(`¿Dar de baja ${product.name}?`))void productsApi.remove(product.id).then(reload).catch(()=>setError('No se pudo dar de baja el producto.'));}}>Dar de baja</button></div></td></tr>)}</tbody></table></div>}
    <CategoriasManager onChange={()=>void reload()} />
  </main>;
}
