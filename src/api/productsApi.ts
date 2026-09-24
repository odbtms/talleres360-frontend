import { request } from './http';
import type { Product } from '../types';

export const productsApi = { list: () => request<Product[]>('/api/products') };
