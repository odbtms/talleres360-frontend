import { request } from './http';
import type { Order } from '../types';
import type { RegionId, SchedulingFormData } from '../features/scheduling/types/scheduling';

export interface AppointmentPayload {
  workshopId: number;
  regionId: RegionId;
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
  if (!form.regionId || !form.workshopId) throw new Error('Selecciona una región y un taller.');
  return {
    workshopId: form.workshopId, regionId: form.regionId,
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
  availability: (workshopId: number, from: string, to: string, signal?: AbortSignal) =>
    request<{ occupiedDates: string[] }>(`/api/appointments/availability?${new URLSearchParams({ workshopId: String(workshopId), from, to })}`, { signal }),
};
