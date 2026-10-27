import { request } from './http';
import type { Product, ProductoCatalogo, ProductInput, Categoria, CategoriaInput } from '../types';

export const productsApi = {
  list: () => request<Product[]>('/api/products'),
  catalogo: () => request<ProductoCatalogo[]>('/api/catalogo'),
  cargaInicial: () => request<{ agregados: number }>('/api/products/carga-inicial', { method: 'POST' }),
  create: (input: ProductInput) => request<Product>('/api/products', { method: 'POST', body: input }),
  update: (id: number, input: ProductInput) => request<Product>(`/api/products/${id}`, { method: 'PUT', body: input }),
  remove: (id: number) => request<void>(`/api/products/${id}`, { method: 'DELETE' }),
};

export const categoriasApi = {
  list: () => request<Categoria[]>('/api/categorias'),
  create: (input: CategoriaInput) => request<Categoria>('/api/categorias', { method: 'POST', body: input }),
  update: (id: number, input: CategoriaInput) => request<Categoria>(`/api/categorias/${id}`, { method: 'PUT', body: input }),
  remove: (id: number) => request<void>(`/api/categorias/${id}`, { method: 'DELETE' }),
};
