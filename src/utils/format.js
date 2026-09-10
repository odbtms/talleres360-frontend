const money = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' });
const dateTime = new Intl.DateTimeFormat('es-CL', { dateStyle: 'short', timeStyle: 'short' });

export const formatMoney = (value) => money.format(Number(value ?? 0));
export const formatDate = (value) => (value ? dateTime.format(new Date(value)) : '—');
