import { useEffect, useState, type FormEvent } from 'react';
import { productsApi, categoriasApi } from '../../api/productsApi';
import { comprasApi } from '../../api/comprasApi';
import { ErrorApi } from '../../api/http';
import type { ProductoCatalogo, Categoria, Session } from '../../types';
import { formatMoney } from '../../utils/format';
import PublicHeader from '../home/components/PublicHeader';
import './compras.css';

type Carrito = Record<string, number>;
export default function CatalogoPage({ session }: { session: Session }) {
  const cliente = session.roles.includes('Cliente') && !session.roles.some(r => r === 'Admin' || r === 'Operador');
  const clave = `talleres360-carrito:${session.username.toLowerCase()}`;
  const [carrito, setCarrito] = useState<Carrito>(() => {
    try {
      const valor: unknown = JSON.parse(sessionStorage.getItem(clave) || '{}');
      if (!valor || typeof valor !== 'object' || Array.isArray(valor)) return {};
      return Object.fromEntries(Object.entries(valor).filter(([id, n]) => /^\d+$/.test(id) && typeof n === 'number' && Number.isSafeInteger(n) && n > 0 && n <= 1000));
    } catch { return {}; }
  });
  const [solicitudId, setSolicitudId] = useState(() => {
    try { return sessionStorage.getItem(`${clave}:solicitud`) || crypto.randomUUID(); }
    catch { return crypto.randomUUID(); }
  });
  const [productos, setProductos] = useState<ProductoCatalogo[] | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [error, setError] = useState('');
  const [errorEnvio, setErrorEnvio] = useState('');
  const [revision, setRevision] = useState(0);
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState('');
  const [enviando, setEnviando] = useState(false);
  useEffect(() => {
    try { sessionStorage.setItem(clave, JSON.stringify(carrito)); sessionStorage.setItem(`${clave}:solicitud`, solicitudId); }
    catch { /* El carrito sigue funcionando en memoria. */ }
  }, [clave, carrito, solicitudId]);
  useEffect(() => {
    let activo = true;
    let ocupado = false;
    const cargar = async () => {
      if (ocupado) return;
      ocupado = true;
      try {
        const [p, c] = await Promise.all([productsApi.catalogo(), categoriasApi.list()]);
        if (activo) { setProductos(p); setCategorias(c); setError(''); }
      } catch (e) { if (activo) setError(e instanceof ErrorApi ? e.message : 'No pudimos cargar el catálogo. Inténtalo nuevamente.'); }
      finally { ocupado = false; }
    };
    void cargar();
    const timer = window.setInterval(() => void cargar(), 5000);
    return () => { activo = false; window.clearInterval(timer); };
  }, [revision]);
  const seleccion = Object.entries(carrito).map(([id, cantidad]) => ({ id, cantidad, producto: productos?.find(p => p.id === Number(id)) }));
  const total = seleccion.reduce((s, i) => s + (i.producto?.price || 0) * i.cantidad, 0);
  const inconsistencias = seleccion.some(i => !i.producto?.active || !i.producto.available);
  const filtrados = productos?.filter(p => p.active && p.name.toLocaleLowerCase().includes(busqueda.toLocaleLowerCase()) && (!categoria || p.categoriaId === Number(categoria))) ?? [];
  function cambiarCantidad(id: number, n: number) {
    setErrorEnvio('');
    setCarrito(actual => { const copia = { ...actual }; if (n <= 0) delete copia[id]; else copia[id] = Math.min(1000, Math.trunc(n)); return copia; });
  }
  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!cliente || enviando || error || !productos) return;
    if (!seleccion.length || seleccion.length > 50 || inconsistencias) { setErrorEnvio('Revisa tu carrito y la disponibilidad de los productos.'); return; }
    setEnviando(true); setErrorEnvio('');
    try {
      const orden = await comprasApi.crear({ solicitudId, productos: seleccion.map(i => ({ productoId: Number(i.id), cantidad: i.cantidad })) });
      const siguiente = crypto.randomUUID();
      try { sessionStorage.setItem(clave, '{}'); sessionStorage.setItem(`${clave}:solicitud`, siguiente); }
      catch { /* No convertir una compra confirmada en error si el almacenamiento está bloqueado. */ }
      setCarrito({}); setSolicitudId(siguiente);
      window.location.assign(`/mis-solicitudes?recibida=${orden.id}`);
    } catch (e) { setErrorEnvio(`${e instanceof ErrorApi ? e.message : 'No se pudo confirmar la solicitud.'} Revisa Mis solicitudes antes de repetirla; tu carrito se conserva.`); }
    finally { setEnviando(false); }
  }
  return <div className="public-page tienda-page">
    <PublicHeader accountName={session.name} onLogout={session.logout} roles={session.roles} showClientNavigation={cliente} />
    <main className="tienda">
      <header className="tienda-heading"><div><p className="section-eyebrow">Repuestos Talleres360</p><h1>Catálogo de repuestos</h1><p>{cliente ? 'Elige tus productos y envía una solicitud. El operador la revisará; no se cobra en línea.' : 'Consulta los productos y su precio de venta. La administración del inventario está en el dashboard del administrador.'}</p></div>{cliente && <a className="btn primary" href="/mis-solicitudes">Mis solicitudes</a>}</header>
      {error && <div className="public-alert" role="alert"><span>{error}</span><button className="btn ghost" onClick={() => setRevision(v => v + 1)}>Reintentar</button></div>}
      {!productos && !error && <p role="status">Cargando catálogo…</p>}
      <div className={cliente ? 'tienda-layout' : 'tienda-catalogo-completo'}>
        <section aria-label="Catálogo"><div className="tienda-filtros"><label>Buscar producto<input value={busqueda} maxLength={160} onChange={e => setBusqueda(e.target.value)} placeholder="Aceite, filtro…" /></label><label>Categoría<select value={categoria} onChange={e => setCategoria(e.target.value)}><option value="">Todas</option>{categorias.filter(c => c.activa).map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}</select></label></div>
          <div className="productos-grid">{filtrados.map(p => <article className="panel producto" key={p.id}><span className="producto-categoria">{p.categoriaNombre || 'General'}</span><h2>{p.name}</h2><p>SKU {p.sku}</p><strong className="producto-precio">{formatMoney(p.price)}</strong><p>{p.available ? 'Disponible para solicitar' : 'No disponible'}</p>
            {cliente && <button className="btn primary" disabled={enviando || !!error || !p.available || (!carrito[p.id] && seleccion.length >= 50) || (carrito[p.id] || 0) >= 1000} onClick={() => cambiarCantidad(p.id, (carrito[p.id] || 0) + 1)}>Agregar al carrito</button>}
          </article>)}</div>
          {productos && !error && filtrados.length === 0 && <section className="panel estado-vacio"><h2>{productos.length ? 'Sin coincidencias' : 'Aún no hay repuestos publicados'}</h2><p>{productos.length ? 'Prueba otro nombre o categoría.' : 'El administrador debe agregar productos al catálogo.'}</p></section>}
        </section>
        {cliente && <aside className="panel carrito"><h2>Tu carrito</h2><p>El stock se descuenta solo cuando el operador acepta tu solicitud.</p>
          {!seleccion.length ? <p>Tu carrito está vacío.</p> : seleccion.map(i => <div className="carrito-item" key={i.id}><strong>{i.producto?.name || 'Producto no disponible'}</strong><span>{formatMoney((i.producto?.price || 0) * i.cantidad)}</span><label>Cantidad<input type="number" min={1} max={1000} step={1} value={i.cantidad} disabled={enviando} onChange={e => cambiarCantidad(Number(i.id), Math.max(1, Number(e.target.value) || 1))} /></label><button className="btn ghost small" disabled={enviando} onClick={() => cambiarCantidad(Number(i.id), 0)}>Quitar</button></div>)}
          <p className="carrito-total">Total estimado <strong>{formatMoney(total)}</strong></p>
          {inconsistencias && productos && <p role="alert">Un producto ya no está disponible. Retíralo del carrito para continuar.</p>}
          {errorEnvio && <p className="field-error" role="alert">{errorEnvio}</p>}
          <form onSubmit={e => void enviar(e)}><fieldset disabled={enviando}><legend>Confirmar solicitud</legend><p>Cuenta: {session.name}</p><p className="carrito-cuenta">{session.username}</p><p>El servidor verifica los precios y las cantidades. No se cobrará en línea.</p><button className="btn primary" disabled={!seleccion.length || inconsistencias || !!error || !productos} type="submit">{enviando ? 'Enviando…' : 'Enviar solicitud'}</button></fieldset></form>
        </aside>}
      </div>
    </main>
  </div>;
}
