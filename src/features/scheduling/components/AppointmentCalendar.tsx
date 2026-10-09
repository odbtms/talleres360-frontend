import { useEffect, useState } from 'react';
import { appointmentsApi } from '../../../api/appointmentsApi';
import { localDate, maximumAppointmentDate, minimumAppointmentDate } from '../utils/validation';

interface Props { workshopId: number; value: string; onChange: (date: string) => void; }

export default function AppointmentCalendar({ workshopId, value, onChange }: Props) {
  const minimum = minimumAppointmentDate();
  const maximum = maximumAppointmentDate();
  const [month, setMonth] = useState(() => new Date(`${value || minimum}T12:00:00`));
  const [unavailable, setUnavailable] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const from = localDate(new Date(month.getFullYear(), month.getMonth(), 1));
  const to = localDate(new Date(month.getFullYear(), month.getMonth() + 1, 0));
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(''); setUnavailable([]);
    appointmentsApi.availability(workshopId, from, to, controller.signal)
      .then((result) => { if (!controller.signal.aborted) setUnavailable(result.occupiedDates); })
      .catch(() => { if (!controller.signal.aborted) setError('No se pudo consultar la disponibilidad. Inténtalo nuevamente.'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [workshopId, from, to, retry]);
  const start = new Date(month.getFullYear(), month.getMonth(), 1);
  const offset = (start.getDay() + 6) % 7;
  const cells = Math.ceil((offset + new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()) / 7) * 7;
  const move = (delta: number) => setMonth(new Date(month.getFullYear(), month.getMonth() + delta, 1));
  return <div className="appointment-calendar" aria-busy={loading}>
    <div className="appointment-calendar__toolbar">
      <button type="button" aria-label="Mes anterior" disabled={from <= minimum.slice(0, 7) + '-01'} onClick={() => move(-1)}>‹</button>
      <strong aria-live="polite">{month.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}</strong>
      <button type="button" aria-label="Mes siguiente" disabled={to >= maximum} onClick={() => move(1)}>›</button>
    </div>
    <div className="appointment-calendar__legend"><span><i className="is-available" />Disponible</span><span><i className="is-occupied" />No disponible</span><span><i className="is-selected" />Seleccionado</span></div>
    {loading && <p className="calendar-message" role="status">Consultando fechas…</p>}
    {error && <div className="calendar-message" role="alert">{error} <button className="btn ghost" type="button" onClick={() => setRetry((n) => n + 1)}>Reintentar</button></div>}
    <div className="appointment-calendar__weekdays">{['lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.', 'dom.'].map((day) => <span key={day}>{day}</span>)}</div>
    <div className="appointment-calendar__grid">{Array.from({ length: cells }, (_, index) => {
      const date = new Date(start.getFullYear(), start.getMonth(), index - offset + 1);
      const iso = localDate(date);
      const blocked = date.getMonth() !== month.getMonth() || iso < minimum || iso > maximum || unavailable.includes(iso);
      return <button key={iso} type="button" className={blocked ? 'is-occupied' : iso === value ? 'is-selected' : 'is-available'} disabled={blocked || loading || !!error} aria-pressed={iso === value} aria-label={`${date.toLocaleDateString('es-CL', { dateStyle: 'full' })}${blocked ? ', no disponible' : ''}`} onClick={() => onChange(iso)}>{date.getDate()}</button>;
    })}</div>
  </div>;
}
