import { useEffect, useState } from 'react';
import { productsApi } from '../api/productsApi';
import { formatMoney } from '../utils/format';
import type { Product } from '../types';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => { productsApi.list().then(setProducts).catch(() => setError('No se pudieron cargar los productos.')).finally(() => setLoading(false)); }, []);
  return <main className="products-page panel"><header><h1>Productos</h1><p>Consulta el inventario disponible para las órdenes de trabajo.</p></header>
    {loading && <p className="empty">Cargando productos…</p>}
    {error && <div className="alert" role="alert">{error}</div>}
    {!loading && !error && products.length === 0 && <div className="products-empty"><h2>No hay productos registrados</h2><p>Cuando se incorporen productos al inventario aparecerán aquí con su stock, precio y disponibilidad.</p></div>}
    {products.length > 0 && <table><thead><tr><th>Producto</th><th>Stock</th><th>Precio</th><th>Disponibilidad</th></tr></thead><tbody>{products.map((product) => <tr key={product.id}><td>{product.name}</td><td>{product.stock}</td><td>{formatMoney(product.price)}</td><td>{product.available ? 'Disponible' : 'Sin stock'}</td></tr>)}</tbody></table>}
  </main>;
}
