import { request } from './http';
import type { Order } from '../types';
import type { SchedulingFormData } from '../features/scheduling/types/scheduling';

interface AvailabilityResponse { occupiedDates: string[]; }

export interface AppointmentPayload {
  workshopId: number;
  regionId: string;
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

export const toAppointmentPayload = (data: SchedulingFormData): AppointmentPayload => ({
  workshopId: Number(data.workshopId),
  regionId: data.regionId,
  firstName: data.firstName.trim(),
  lastName: data.lastName.trim(),
  rut: data.rut,
  phone: data.phone,
  vehiclePlate: data.plate,
  vehicleModel: data.model.trim(),
  vehicleYear: Number(data.year),
  serviceType: data.serviceType === 'maintenance' ? 'MAINTENANCE' : 'DIAGNOSTICS',
  reason: data.reason.trim(),
  appointmentDate: data.appointmentDate,
});

export const appointmentsApi = {
  create: (appointment: AppointmentPayload) =>
    request<Order>('/api/appointments', { method: 'POST', body: appointment }),
  listMine: () => request<Order[]>('/api/appointments'),
  availability: (workshopId: number, from: string, to: string) => {
    const query = new URLSearchParams({ workshopId: String(workshopId), from, to });
    return request<AvailabilityResponse>(`/api/appointments/availability?${query}`);
  },
};
