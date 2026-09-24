import { useMemo, useState } from 'react';
import { validateStep } from '../utils/validation';
import type { SchedulingErrors, SchedulingField, SchedulingFormData, ServiceType } from '../types/scheduling';

const initialData = (serviceType: ServiceType, email: string): SchedulingFormData => ({
  serviceType, plate: '', model: '', year: '', rut: '', firstName: '', lastName: '',
  phone: '', email, regionId: '', workshopId: '', reason: '', appointmentDate: '',
});

export function useSchedulingForm(serviceType: ServiceType, email: string) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState(() => initialData(serviceType, email));
  const [errors, setErrors] = useState<SchedulingErrors>({});

  function setField<K extends SchedulingField>(field: K, value: SchedulingFormData[K]) {
    setData((current) => ({
      ...current,
      [field]: value,
      ...(field === 'regionId' ? { workshopId: '', appointmentDate: '' } : {}),
      ...(field === 'workshopId' ? { appointmentDate: '' } : {}),
    }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function next() {
    const nextErrors = validateStep(step, data);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) setStep((current) => Math.min(5, current + 1));
  }

  function back() { setErrors({}); setStep((current) => Math.max(1, current - 1)); }
  const progress = useMemo(() => (step / 5) * 100, [step]);
  return { step, data, errors, progress, setField, next, back };
}
