const money = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' });
const dateTime = new Intl.DateTimeFormat('es-CL', { dateStyle: 'short', timeStyle: 'short' });

export const formatMoney = (value: number | string | null | undefined) => money.format(Number(value ?? 0));
export const formatDate = (value: string | number | Date | null | undefined) =>
  value ? dateTime.format(new Date(value)) : '—';
