import { useEffect, useRef, useState, type FormEvent } from 'react';
import { productsApi } from '../api/productsApi';
import { ErrorApi } from '../api/http';
import type { Categoria, Product, ProductInput } from '../types';
import './EditarProductoDialog.css';

interface Props {
  productoId: number;
  categorias: Categoria[];
  onCerrar: () => void;
  onGuardado: (producto: Product) => void;
}

/** Formulario independiente: nunca modifica el borrador de creación del listado. */
export default function EditarProductoDialog({ productoId, categorias, onCerrar, onGuardado }: Props) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const [form, setForm] = useState<ProductInput | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const elemento = dialogo.current;
    elemento?.showModal();
    return () => { if (elemento?.open) elemento.close(); };
  }, []);

  useEffect(() => {
    const controlador = new AbortController();
    setError(''); setForm(null);
    productsApi.get(productoId, controlador.signal).then(producto => {
      if (!controlador.signal.aborted) setForm({ sku: producto.sku, name: producto.name,
        price: producto.price, stock: producto.stock, active: producto.active, categoriaId: producto.categoriaId });
    }).catch(error => {
      if (!controlador.signal.aborted) setError(error instanceof ErrorApi ? error.message : 'No se pudo cargar el producto para editarlo.');
    });
    return () => controlador.abort();
  }, [productoId, revision]);

  async function guardar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!form || guardando) return;
    setGuardando(true); setError('');
    try {
      // La actividad se cambia con sus botones, no con un valor antiguo del formulario.
      const actual = await productsApi.get(productoId);
      const producto = await productsApi.update(productoId, { ...form, active: actual.active, sku: actual.sku });
      onGuardado(producto);
    } catch (error) {
      setError(error instanceof ErrorApi ? error.message : 'No se pudieron guardar los cambios. El formulario se conserva.');
    } finally { setGuardando(false); }
  }

  return <dialog className="product-edit-dialog" ref={dialogo} aria-labelledby="titulo-editar-producto"
    onCancel={evento => { evento.preventDefault(); if (!guardando) onCerrar(); }}>
    <header className="product-edit-heading"><div><h2 id="titulo-editar-producto">Editar producto #{productoId}</h2>
      <p>Actualiza sus datos. Habilitar o deshabilitar se realiza desde el listado.</p></div>
      <button className="btn ghost" type="button" disabled={guardando} onClick={onCerrar} aria-label="Cerrar edición">Cerrar</button></header>
    {error && <div className="alert" role="alert">{error}{!form && <button className="btn ghost" type="button" onClick={() => setRevision(valor => valor + 1)}>Reintentar</button>}</div>}
    {!form && !error && <p role="status">Cargando datos actuales del producto…</p>}
    {form && <form onSubmit={evento => void guardar(evento)}>
      <fieldset disabled={guardando} className="product-edit-fields"><legend>Datos del producto</legend>
        <label>Nombre<input autoFocus required maxLength={160} value={form.name} onChange={evento => setForm({ ...form, name: evento.target.value })} /></label>
        <label>Categoría<select value={form.categoriaId || ''} onChange={evento => setForm({ ...form, categoriaId: evento.target.value ? Number(evento.target.value) : null })}><option value="">General</option>{categorias.filter(categoria => categoria.activa || categoria.id === form.categoriaId).map(categoria => <option key={categoria.id} value={categoria.id}>{categoria.nombre}{categoria.activa ? '' : ' (deshabilitada)'}</option>)}</select></label>
        <label>Precio<input required type="number" min="0" step="0.01" value={form.price} onChange={evento => setForm({ ...form, price: Number(evento.target.value) })} /></label>
        <label>Stock<input required type="number" min="0" step="1" value={form.stock} onChange={evento => setForm({ ...form, stock: Number(evento.target.value) })} /></label>
      </fieldset>
      <footer className="product-edit-actions"><button className="btn ghost" type="button" disabled={guardando} onClick={onCerrar}>Cancelar</button>
        <button className="btn primary" type="submit" disabled={guardando}>{guardando ? 'Guardando…' : 'Guardar cambios'}</button></footer>
    </form>}
  </dialog>;
}
