export type OrderStatus =
  | 'RECIBIDA'
  | 'ACEPTADA'
  | 'EN_REPARACION'
  | 'LISTA_PARA_ENTREGA'
  | 'ENTREGADA'
  | 'CANCELADA';

export type AppRole = 'Admin' | 'Operador' | 'Cliente';

export interface OrderItem {
  id: number;
  productId: number;
  description?: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface OrderItemInput {
  productId: number;
  quantity: number;
  unitPrice: number;
}

export interface OrderPayload {
  workshopId: number;
  customerName: string;
  customerEmail: string;
  customerRut?: string;
  customerPhone?: string;
  vehiclePlate: string;
  vehicleModel: string;
  description: string;
  items: OrderItemInput[];
}

export interface Order {
  id: number;
  workshopId: number;
  customerName: string;
  customerEmail: string;
  customerRut?: string | null;
  customerPhone?: string | null;
  vehiclePlate: string;
  vehicleModel: string | null;
  vehicleYear?: number | null;
  description: string | null;
  diagnosis?: string | null;
  workPerformed?: string | null;
  laborCost?: number | null;
  estimatedDeliveryDate?: string | null;
  technicalUpdatedAt?: string | null;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  createdAt: string;
  updatedAt: string;
  acceptedAt: string | null;
  deliveredAt: string | null;
  serviceType?: 'MAINTENANCE' | 'DIAGNOSTICS' | null;
  regionId?: 'biobio' | 'maule' | 'araucania' | null;
  appointmentDate?: string | null;
}

export interface TechnicalUpdatePayload {
  diagnosis: string;
  workPerformed: string;
  laborCost: number;
  estimatedDeliveryDate: string;
  items: Array<{ productId: number; quantity: number }>;
}

export interface Product { id: number; name: string; stock: number; price: number; available: boolean; }

export interface OrderFilters {
  status: string;
  from: string;
  to: string;
}

export interface Session {
  name: string;
  username: string;
  roles: string[];
  logout: () => Promise<void>;
}
