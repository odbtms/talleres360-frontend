const money = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' });
const dateTime = new Intl.DateTimeFormat('es-CL', { dateStyle: 'short', timeStyle: 'short' });
const number = new Intl.NumberFormat('es-CL');

export const formatMoney = (value: number | string | null | undefined) => money.format(Number(value ?? 0));
export const formatDate = (value: string | number | Date | null | undefined) =>
  value ? dateTime.format(new Date(value)) : '—';

export function formatMinutes(minutes: number | null) {
  if (minutes === null) return 'Sin datos';
  if (minutes > 0 && minutes < 1) return '< 1 min';
  const total = Math.round(minutes);
  const hours = Math.floor(total / 60);
  const remainder = total % 60;
  return hours ? `${number.format(hours)} h ${remainder} min` : `${remainder} min`;
}
