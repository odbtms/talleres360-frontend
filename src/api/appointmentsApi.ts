import { request } from './http';
import type { Order } from '../types';
import type { SchedulingFormData } from '../features/scheduling/types/scheduling';

export interface AppointmentPayload {
  firstName: string;
  lastName: string;
  rut: string;
  phone: string;
  vehiclePlate: string;
  vehicleModel: string;
  vehicleYear: number;
  serviceType: 'MAINTENANCE' | 'DIAGNOSTICS';
  reason: string;
  appointmentDate: string;
}

export function appointmentPayload(form: SchedulingFormData): AppointmentPayload {
  return {
    firstName: form.firstName.trim(), lastName: form.lastName.trim(), rut: form.rut,
    phone: form.phone, vehiclePlate: form.plate, vehicleModel: form.model.trim(),
    vehicleYear: Number(form.year), serviceType: form.serviceType === 'maintenance' ? 'MAINTENANCE' : 'DIAGNOSTICS',
    reason: form.reason.trim(), appointmentDate: form.appointmentDate,
  };
}

// La identidad y el correo los obtiene el BFF del JWT, no del formulario.
export const appointmentsApi = {
  list: () => request<Order[]>('/api/appointments'),
  create: (body: AppointmentPayload) => request<Order>('/api/appointments', { method: 'POST', body }),
  availability: (from: string, to: string, signal?: AbortSignal) =>
    request<{ occupiedDates: string[] }>(`/api/appointments/availability?${new URLSearchParams({ from, to })}`, { signal }),
};
