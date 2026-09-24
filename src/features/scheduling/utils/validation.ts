import type { SchedulingErrors, SchedulingFormData } from '../types/scheduling';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_PATTERN = /^[\p{L}][\p{L}\s'-]*$/u;
const MODEL_PATTERN = /^[\p{L}\p{N} ]+$/u;

export function formatPlateInput(value: string): string {
  const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
  return clean.match(/.{1,2}/g)?.join('-') ?? '';
}

export function formatRutInput(value: string): string {
  const raw = value.toUpperCase().replace(/[^0-9K]/g, '');
  const hasK = raw.endsWith('K');
  const digits = raw.replace(/K/g, '').slice(0, 8);
  const clean = `${digits}${hasK ? 'K' : ''}`;
  if (clean.length < 2) return clean;
  const body = clean.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${body}-${clean.slice(-1)}`;
}

export function isValidRut(value: string): boolean {
  const clean = value.toUpperCase().replace(/[^0-9K]/g, '');
  if (!/^\d{7,8}[0-9K]$/.test(clean)) return false;
  const body = clean.slice(0, -1);
  const suppliedDigit = clean.slice(-1);
  let sum = 0;
  let multiplier = 2;
  for (let index = body.length - 1; index >= 0; index -= 1) {
    sum += Number(body[index]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  const result = 11 - (sum % 11);
  const expectedDigit = result === 11 ? '0' : result === 10 ? 'K' : String(result);
  return suppliedDigit === expectedDigit;
}

function dateAfter(days: number): string {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export const minimumAppointmentDate = () => dateAfter(1);
export const maximumAppointmentDate = () => dateAfter(90);

export function validateStep(step: number, data: SchedulingFormData): SchedulingErrors {
  const errors: SchedulingErrors = {};
  if (step === 1) {
    if (!/^[A-Z0-9]{6}$/.test(data.plate.replace(/-/g, ''))) errors.plate = 'Ingresa exactamente 6 letras o números.';
    if (data.model.trim().length < 2 || !MODEL_PATTERN.test(data.model.trim())) errors.model = 'Usa solamente letras, números y espacios.';
    const year = Number(data.year);
    if (!/^\d{4}$/.test(data.year) || year < 1900 || year > new Date().getFullYear() + 1) errors.year = `Ingresa un año entre 1900 y ${new Date().getFullYear() + 1}.`;
  }
  if (step === 2) {
    if (!isValidRut(data.rut)) errors.rut = 'El RUT no es válido según Módulo 11.';
    if (!NAME_PATTERN.test(data.firstName.trim()) || data.firstName.trim().length < 2) errors.firstName = 'Ingresa un nombre válido.';
    if (!NAME_PATTERN.test(data.lastName.trim()) || data.lastName.trim().length < 2) errors.lastName = 'Ingresa un apellido válido.';
    if (!/^\d{8}$/.test(data.phone)) errors.phone = 'Ingresa los 8 dígitos posteriores a +56 9.';
    if (!EMAIL_PATTERN.test(data.email.trim())) errors.email = 'Ingresa un correo electrónico válido.';
  }
  if (step === 3) {
    if (!data.regionId) errors.regionId = 'Selecciona una región.';
    if (!data.workshopId) errors.workshopId = 'Selecciona un taller.';
    const reasonLength = data.reason.trim().length;
    if (reasonLength < 10 || reasonLength > 500) errors.reason = 'Describe el motivo usando entre 10 y 500 caracteres.';
  }
  if (step === 4 && (!data.appointmentDate || data.appointmentDate < minimumAppointmentDate() || data.appointmentDate > maximumAppointmentDate())) {
    errors.appointmentDate = 'Selecciona una fecha válida dentro de los próximos 90 días.';
  }
  return errors;
}
