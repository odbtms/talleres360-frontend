import { useEffect, useState, type FormEvent } from 'react';
import { productsApi, categoriasApi } from '../../api/productsApi';
import { comprasApi } from '../../api/comprasApi';
import type { Product, Categoria, Order, Session } from '../../types';
import { formatDate, formatMoney } from '../../utils/format';
import { formatRutInput, isValidRut } from '../scheduling/utils/validation';
import { WORKSHOPS } from '../scheduling/constants/workshops';
import PublicHeader from '../home/components/PublicHeader';
import './compras.css';
import { estadoCompra } from '../../utils/estadoCompra';

type Carrito = Record<string, number>;
export default function ComprasPage({ session, solicitudes = false }: { session: Session; solicitudes?: boolean }) {
  const clave = `talleres360-carrito:${session.username.toLowerCase()}`;
  const [carrito, setCarrito] = useState<Carrito>(() => {
    try { const valor: unknown = JSON.parse(sessionStorage.getItem(clave) || '{}');
      if (!valor || typeof valor !== 'object' || Array.isArray(valor)) return {};
      return Object.fromEntries(Object.entries(valor).filter(([id, n]) => /^\d+$/.test(id) && typeof n === 'number' && Number.isInteger(n) && n > 0 && n <= 1000));
    } catch { return {}; }
  });
  const [productos, setProductos] = useState<Product[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [pedidos, setPedidos] = useState<Order[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(''); const [aviso, setAviso] = useState('');
  const [busqueda, setBusqueda] = useState(''); const [categoria, setCategoria] = useState('');
  const [nombre, setNombre] = useState(''); const [rut, setRut] = useState(''); const [telefono, setTelefono] = useState('');
  const [taller, setTaller] = useState(''); const [enviando, setEnviando] = useState(false);
  const [solicitudId, setSolicitudId] = useState(() => sessionStorage.getItem(`${clave}:solicitud`) || crypto.randomUUID());
  useEffect(() => { try { sessionStorage.setItem(clave, JSON.stringify(carrito)); sessionStorage.setItem(`${clave}:solicitud`, solicitudId); } catch { /* Sin almacenamiento sigue funcionando en memoria. */ } }, [clave, carrito, solicitudId]);
  useEffect(() => {
    let activo = true;
    const cargar = async () => { try {
      if (solicitudes) { const datos = await comprasApi.propias(); if (activo) setPedidos(datos); }
      else { const [p,c] = await Promise.all([productsApi.list(), categoriasApi.list()]); if (activo) { setProductos(p); setCategorias(c); } }
      if (activo) setError('');
    } catch { if (activo) setError('No pudimos cargar la información. Inténtalo nuevamente.'); }
      finally { if (activo) setCargando(false); } };
    void cargar(); const timer = window.setInterval(() => void cargar(), 10000);
    return () => { activo = false; window.clearInterval(timer); };
  }, [solicitudes]);
  const seleccion = Object.entries(carrito).map(([id,cantidad]) => ({ producto: productos.find(p => p.id === Number(id)), id, cantidad }));
  const total = seleccion.reduce((s,i) => s + (i.producto?.price || 0) * i.cantidad, 0);
  const inconsistencias = seleccion.some(i => !i.producto?.active || i.cantidad > (i.producto?.stock || 0));
  function cantidad(id: number, n: number) { setCarrito(actual => { const copia = { ...actual }; if (n <= 0) delete copia[id]; else copia[id] = Math.min(1000, Math.trunc(n)); return copia; }); }
  async function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (enviando) return;
    if (!isValidRut(rut) || !/^\d{8}$/.test(telefono) || !/^[\p{L} ]{3,120}$/u.test(nombre.trim()) || !taller || !seleccion.length || seleccion.length>50 || inconsistencias) { setError('Revisa nombre, RUT, teléfono, taller y disponibilidad. El máximo es de 50 productos diferentes por solicitud.'); return; }
    setEnviando(true); setError(''); setAviso('');
    try { const orden = await comprasApi.crear({ solicitudId, nombre: nombre.trim(), rut, telefono, tallerId: Number(taller), productos: seleccion.map(i => ({ productoId: Number(i.id), cantidad: i.cantidad })) });
      setCarrito({}); setSolicitudId(crypto.randomUUID()); setAviso(`Solicitud #${orden.id} recibida por ${formatMoney(orden.total)}. El operador revisará tu solicitud. No se realizó ningún cobro.`);
    } catch { setError('No se pudo confirmar la solicitud. Revisa Mis solicitudes antes de volver a intentar; tu carrito se conserva.'); }
    finally { setEnviando(false); }
  }
  return <div className="public-page tienda-page"><PublicHeader accountName={session.name} onLogout={session.logout} showClientNavigation />
    <main className="tienda"><header className="tienda-heading"><div><p className="section-eyebrow">Repuestos Talleres360</p><h1>{solicitudes ? 'Mis solicitudes' : 'Catálogo de repuestos'}</h1>
      <p>{solicitudes ? 'Sigue la aprobación, preparación y entrega de tus productos.' : 'Agrega productos al carrito y solicita su compra. El operador confirma disponibilidad; sin pago en línea.'}</p></div>
      <a className="btn primary" href={solicitudes ? '/catalogo' : '/mis-solicitudes'}>{solicitudes ? 'Ver catálogo' : 'Mis solicitudes'}</a></header>
      {error && <p className="public-alert" role="alert">{error}</p>}{aviso && <p className="tienda-aviso" role="status">{aviso}</p>}
      {cargando && <p role="status">Cargando…</p>}
      {solicitudes ? <div className="pedidos-lista">{!cargando && !pedidos.length && <section className="panel"><h2>Aún no tienes solicitudes</h2><a className="btn primary" href="/catalogo">Explorar repuestos</a></section>}
        {pedidos.map(o => <details className="panel pedido" key={o.id}><summary><strong>Solicitud #{o.id}</strong><span>{estadoCompra(o)}</span><span>{formatMoney(o.total)}</span><span>{formatDate(o.createdAt)}</span></summary>
          <p>Retiro: {WORKSHOPS.find(t => t.id === o.workshopId)?.name || `Taller ${o.workshopId}`}</p>
          <ul>{o.items.map(i => <li key={i.id}>{i.description} × {i.quantity} — {formatMoney(i.subtotal)}</li>)}</ul>
          {o.motivoRechazo && <p role="note"><strong>Motivo del rechazo:</strong> {o.motivoRechazo}</p>}
          {o.aceptacionPendiente && <p>El operador solicitó la aceptación. Estamos confirmando existencias; no está aceptada todavía.</p>}
          <p>Correo: {o.customerEmail} · Total: {formatMoney(o.total)}</p></details>)}</div>
        : <div className="tienda-layout"><section><div className="tienda-filtros"><label>Buscar producto<input value={busqueda} maxLength={160} onChange={e => setBusqueda(e.target.value)} placeholder="Aceite, filtro…" /></label>
          <label>Categoría<select value={categoria} onChange={e => setCategoria(e.target.value)}><option value="">Todas</option>{categorias.filter(c => c.activa).map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}</select></label></div>
          <div className="productos-grid">{productos.filter(p => p.active && p.name.toLocaleLowerCase().includes(busqueda.toLocaleLowerCase()) && (!categoria || p.categoriaId === Number(categoria))).map(p => <article className="panel producto" key={p.id}>
            <span className="producto-categoria">{p.categoriaNombre || 'General'}</span><h2>{p.name}</h2><p>SKU {p.sku}</p><strong className="producto-precio">{formatMoney(p.price)}</strong><p>{p.stock > 0 ? `${p.stock} unidades disponibles` : 'Agotado'}</p>
            <button type="button" className="btn primary" disabled={enviando || !p.available || (!carrito[p.id] && seleccion.length>=50) || (carrito[p.id] || 0) >= Math.min(p.stock, 1000)} onClick={() => cantidad(p.id, (carrito[p.id] || 0) + 1)}>Agregar al carrito</button></article>)}</div>
          {!cargando && !productos.some(p => p.active) && <p className="panel empty">No hay productos disponibles todavía.</p>}</section>
          <aside className="panel carrito"><h2>Tu carrito</h2><p>La solicitud no reserva stock hasta que sea aceptada.</p>
            {seleccion.length === 0 ? <p>Tu carrito está vacío.</p> : seleccion.map(i => <div className="carrito-item" key={i.id}><strong>{i.producto?.name || 'Producto no disponible'}</strong><span>{formatMoney((i.producto?.price || 0) * i.cantidad)}</span>
              <label>Cantidad<input type="number" min="1" max={Math.min(i.producto?.stock || 1000,1000)} value={i.cantidad} disabled={enviando} onChange={e => cantidad(Number(i.id), Math.max(1, Number(e.target.value) || 1))} /></label>
              <button type="button" className="btn ghost small" disabled={enviando} onClick={() => cantidad(Number(i.id),0)}>Quitar</button></div>)}
            <p className="carrito-total">Total estimado <strong>{formatMoney(total)}</strong></p>
            {inconsistencias && <p role="alert">Cambió el stock de un producto. Ajusta las cantidades o quítalo antes de continuar.</p>}
            <form onSubmit={e => void enviar(e)}><fieldset disabled={enviando}><legend>Datos para la solicitud</legend>
              <label>Nombre y apellido<input required minLength={3} maxLength={120} value={nombre} onChange={e => setNombre(e.target.value.replace(/[^\p{L} ]/gu,''))} autoComplete="name" /></label>
              <label>Correo institucional<input value={session.username} readOnly type="email" /></label>
              <label>RUT<input required value={rut} maxLength={12} onChange={e => setRut(formatRutInput(e.target.value))} placeholder="12.345.678-5" /></label>
              <label>Teléfono +56 9<input required inputMode="numeric" maxLength={8} pattern="[0-9]{8}" value={telefono} onChange={e => setTelefono(e.target.value.replace(/\D/g,'').slice(0,8))} autoComplete="tel-national" /></label>
              <label>Taller de retiro<select required value={taller} onChange={e => setTaller(e.target.value)}><option value="">Selecciona un taller</option>{WORKSHOPS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></label>
              <p>El servidor confirma precios y disponibilidad. No se cobrará en línea.</p><button className="btn primary" disabled={!seleccion.length || inconsistencias} type="submit">{enviando ? 'Enviando…' : 'Enviar solicitud'}</button>
            </fieldset></form></aside></div>}
    </main></div>;
}
