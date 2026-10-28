import { useEffect, useRef, useState, type FormEvent } from 'react';
import { productsApi, categoriasApi } from '../api/productsApi';
import { ErrorApi } from '../api/http';
import CategoriasManager from './CategoriasManager';
import EditarProductoDialog from './EditarProductoDialog';
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
  const [errorCarga, setErrorCarga] = useState('');
  const [notice, setNotice] = useState('');
  const [cambiandoEstado, setCambiandoEstado] = useState<number | null>(null);
  const consulta = useRef<AbortController | null>(null);

  async function cambiarEstado(producto: Product) {
    if (cambiandoEstado !== null || saving) return;
    setCambiandoEstado(producto.id); setError(''); setNotice('');
    try {
      await productsApi.estado(producto.id, !producto.active);
      setNotice(`Producto #${producto.id} ${producto.active ? 'deshabilitado. Ya no admite nuevas solicitudes.' : 'habilitado. Aparecerá en el catálogo; requiere stock para poder solicitarlo.'}`);
      if (editingId === producto.id) setEditingId(null);
      await reload(true);
    } catch {
      setError(`No se pudo ${producto.active ? 'deshabilitar' : 'habilitar'} el producto. Actualiza el listado y comprueba que su categoría esté habilitada.`);
    } finally { setCambiandoEstado(null); }
  }

  async function reload(forzar = false) {
    if (consulta.current && !forzar) return;
    consulta.current?.abort();
    const controlador = new AbortController();
    consulta.current = controlador;
    try {
      const [p, c] = await Promise.allSettled([productsApi.list(controlador.signal), categoriasApi.list(controlador.signal)]);
      if (controlador.signal.aborted) return;
      const fallos: string[] = [];
      if (p.status === 'fulfilled') setProducts(p.value);
      else fallos.push(p.reason instanceof ErrorApi ? p.reason.message : 'No se pudo actualizar el listado de productos.');
      if (c.status === 'fulfilled') setCategorias(c.value);
      else fallos.push(c.reason instanceof ErrorApi ? c.reason.message : 'No se pudieron actualizar las categorías.');
      setErrorCarga(fallos.join(' '));
    }
    catch { if (!controlador.signal.aborted) setErrorCarga('No se pudo actualizar el inventario. Inténtalo nuevamente.'); }
    finally {
      if (!controlador.signal.aborted) setLoading(false);
      if (consulta.current === controlador) consulta.current = null;
    }
  }
  useEffect(() => { void reload(); const timer = window.setInterval(() => void reload(), 5000); return () => { window.clearInterval(timer); consulta.current?.abort(); }; }, []);

  function edit(product: Product) {
    setEditingId(product.id);
    setNotice('');
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setSaving(true); setError(''); setNotice('');
    try {
      await productsApi.create(form);
      setForm(emptyProduct);
      setNotice('Producto guardado correctamente.');
      await reload(true);
    } catch { setError('No se pudo guardar el producto. Revisa los datos ingresados.'); }
    finally { setSaving(false); }
  }

  return <main className="products-page panel">
    <header><h1>Productos y stock</h1><p>Solo el administrador ve las cantidades de inventario y modifica precios y stock. Un producto activo tiene stock bajo al quedar con 5 unidades o menos. Actualización cada 5 segundos.</p>
      </header>
    {error && <div className="alert" role="alert">{error}</div>}
    {errorCarga && <div className="alert" role="alert"><span>{errorCarga} {products.length > 0 ? 'Se conserva la última información cargada.' : ''}</span><button className="btn ghost" type="button" onClick={() => void reload(true)}>Reintentar</button></div>}
    {notice && <p className="catalog-notice" role="status">{notice}</p>}
    <form className="catalog-form" onSubmit={(event) => void save(event)}>
      <h2>Nuevo producto</h2>
      <div className="catalog-form-grid">
        <label>Nombre<input required maxLength={160} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
        <label>Categoría<select value={form.categoriaId||''} onChange={e=>setForm({...form,categoriaId:e.target.value?Number(e.target.value):null})}><option value="">General</option>{categorias.filter(c=>c.activa||c.id===form.categoriaId).map(c=><option key={c.id} value={c.id}>{c.nombre}{c.activa?'':' (inactiva)'}</option>)}</select></label>
        <label>Precio<input required type="number" min="0" step="0.01" value={form.price} onChange={(event) => setForm({ ...form, price: Number(event.target.value) })} /></label>
        <label>Stock<input required type="number" min="0" step="1" value={form.stock} onChange={(event) => setForm({ ...form, stock: Number(event.target.value) })} /></label>
      </div>
      <div className="actions"><button className="btn primary" type="submit" disabled={saving || loading || !!errorCarga}>{saving ? 'Guardando…' : 'Agregar producto'}</button></div>
    </form>
    {loading && <p className="empty">Cargando productos…</p>}
    {!loading && !errorCarga && products.length === 0 && <div className="products-empty"><h2>No hay productos registrados</h2><p>Agrega el primer repuesto con el formulario superior.</p></div>}
    {products.length > 0 && <div className="table-wrap" role="region" aria-label="Listado de productos" tabIndex={0}><table><thead><tr><th>ID</th><th>Producto</th><th>Stock</th><th>Precio</th><th>Estado</th><th>Acción</th></tr></thead>
      <tbody>{products.map((product) => <tr key={product.id}>
        <td>#{product.id}</td><td>{product.name}<small> · {product.categoriaNombre||'General'}</small></td>
        <td>{product.stock}{product.active && product.stock <= 5 && <small className="stock-bajo">Stock bajo</small>}</td>
        <td>{formatMoney(product.price)}</td><td>{!product.active ? 'Deshabilitado' : product.categoriaActiva === false ? 'Categoría deshabilitada' : product.available ? 'Disponible' : 'Sin stock'}</td>
        <td><div className="actions"><button className="btn ghost small" type="button" onClick={() => edit(product)}>Editar</button>
          <button className={`btn ${product.active ? 'danger-ghost' : 'primary'} small`} type="button" disabled={saving || cambiandoEstado !== null} onClick={() => void cambiarEstado(product)}>{cambiandoEstado === product.id ? 'Actualizando…' : product.active ? 'Deshabilitar' : 'Habilitar'}</button>
        </div></td>
      </tr>)}</tbody></table></div>}
    <CategoriasManager onChange={()=>void reload(true)} />
    {editingId !== null && <EditarProductoDialog key={editingId} productoId={editingId} categorias={categorias}
      onCerrar={() => setEditingId(null)} onGuardado={producto => { setEditingId(null); setNotice(`Producto #${producto.id} actualizado correctamente.`); void reload(true); }} />}
  </main>;
}
