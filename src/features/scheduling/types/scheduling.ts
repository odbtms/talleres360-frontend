export type ServiceType = 'maintenance' | 'diagnostics';

export interface SchedulingFormData {
  serviceType: ServiceType;
  plate: string;
  model: string;
  year: string;
  rut: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  reason: string;
  appointmentDate: string;
}

export type SchedulingField = keyof SchedulingFormData;
export type SchedulingErrors = Partial<Record<SchedulingField, string>>;
