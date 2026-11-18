export interface RangoReporte {
  desde: string;
  hasta: string;
}

export type PeriodoReporte = 'dia' | 'semana' | 'mes';

const fechaVista = new Intl.DateTimeFormat('es-CL', { dateStyle: 'short', timeZone: 'UTC' });

export function fechaParaVista(fecha: string): string {
  return fechaVista.format(new Date(`${fecha}T00:00:00Z`));
}

export function fechaParaInput(fecha: Date): string {
  return [fecha.getFullYear(), String(fecha.getMonth() + 1).padStart(2, '0'), String(fecha.getDate()).padStart(2, '0')].join('-');
}

export function fechasParaPeriodo(periodo: PeriodoReporte, hoy = new Date()): RangoReporte {
  const inicio = new Date(hoy);
  if (periodo === 'semana') inicio.setDate(hoy.getDate() - (hoy.getDay() + 6) % 7);
  if (periodo === 'mes') inicio.setDate(1);
  return { desde: fechaParaInput(inicio), hasta: fechaParaInput(hoy) };
}

function fechaLocal(valor: string): Date {
  const fecha = new Date(`${valor}T00:00:00`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor) || Number.isNaN(fecha.getTime()) || fechaParaInput(fecha) !== valor) {
    throw new Error('Selecciona fechas válidas para generar el reporte.');
  }
  return fecha;
}

export function rangoParaApi(desde: string, hasta: string): RangoReporte {
  const inicio = fechaLocal(desde);
  const fin = fechaLocal(hasta);
  if (inicio > fin) throw new Error('La fecha de inicio no puede ser posterior a la fecha final.');
  // La API usa un límite final exclusivo: se incluye el día completo elegido.
  fin.setDate(fin.getDate() + 1);
  return { desde: inicio.toISOString(), hasta: fin.toISOString() };
}
