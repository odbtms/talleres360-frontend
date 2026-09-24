export type ServiceType = 'maintenance' | 'diagnostics';
export type RegionId = 'biobio' | 'maule' | 'araucania';

export interface Workshop { id: number; name: string; regionId: RegionId; }
export interface Region { id: RegionId; name: string; }

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
  regionId: RegionId | '';
  workshopId: number | '';
  reason: string;
  appointmentDate: string;
}

export type SchedulingField = keyof SchedulingFormData;
export type SchedulingErrors = Partial<Record<SchedulingField, string>>;
