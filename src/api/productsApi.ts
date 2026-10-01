import { request } from './http';
import type { Product, ProductInput } from '../types';

export const productsApi = {
  list: () => request<Product[]>('/api/products'),
  create: (input: ProductInput) => request<Product>('/api/products', { method: 'POST', body: input }),
  update: (id: number, input: ProductInput) => request<Product>(`/api/products/${id}`, { method: 'PUT', body: input }),
};
