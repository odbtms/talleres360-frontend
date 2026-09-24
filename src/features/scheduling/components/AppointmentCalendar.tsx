import { useMemo, useState } from 'react';

interface AppointmentCalendarProps {
  value: string;
  min: string;
  max: string;
  occupiedDates?: readonly string[];
  onChange: (date: string) => void;
}

const WEEK_DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const monthFormatter = new Intl.DateTimeFormat('es-CL', { month: 'long', year: 'numeric' });

const toLocalDate = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day, 12);
};

const toDateValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function AppointmentCalendar({
  value,
  min,
  max,
  occupiedDates = [],
  onChange,
}: AppointmentCalendarProps) {
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const initial = value ? toLocalDate(value) : toLocalDate(min);
    return new Date(initial.getFullYear(), initial.getMonth(), 1, 12);
  });
  const occupied = useMemo(() => new Set(occupiedDates), [occupiedDates]);
  const minDate = toLocalDate(min);
  const maxDate = toLocalDate(max);
  const monthStartOffset = (visibleMonth.getDay() + 6) % 7;
  const gridStart = new Date(visibleMonth);
  gridStart.setDate(1 - monthStartOffset);
  const days = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return date;
  });
  const previousMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1, 12);
  const nextMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1, 12);
  const canGoPrevious = previousMonth.getFullYear() > minDate.getFullYear()
    || (previousMonth.getFullYear() === minDate.getFullYear() && previousMonth.getMonth() >= minDate.getMonth());
  const canGoNext = nextMonth.getFullYear() < maxDate.getFullYear()
    || (nextMonth.getFullYear() === maxDate.getFullYear() && nextMonth.getMonth() <= maxDate.getMonth());

  return (
    <div className="appointment-calendar">
      <div className="appointment-calendar__toolbar">
        <button type="button" onClick={() => setVisibleMonth(previousMonth)} disabled={!canGoPrevious} aria-label="Mes anterior">‹</button>
        <strong>{monthFormatter.format(visibleMonth)}</strong>
        <button type="button" onClick={() => setVisibleMonth(nextMonth)} disabled={!canGoNext} aria-label="Mes siguiente">›</button>
      </div>

      <div className="appointment-calendar__legend" aria-label="Leyenda del calendario">
        <span><i className="is-available" />Disponible</span>
        <span><i className="is-occupied" />Ocupado</span>
        <span><i className="is-selected" />Seleccionado</span>
      </div>

      <div className="appointment-calendar__weekdays">{WEEK_DAYS.map((day) => <span key={day}>{day}</span>)}</div>
      <div className="appointment-calendar__grid">
        {days.map((date) => {
          const dateValue = toDateValue(date);
          const outsideMonth = date.getMonth() !== visibleMonth.getMonth();
          const unavailable = outsideMonth || date < minDate || date > maxDate || occupied.has(dateValue);
          const selected = dateValue === value;
          return (
            <button
              className={`${unavailable ? 'is-occupied' : 'is-available'} ${selected ? 'is-selected' : ''}`}
              type="button"
              key={dateValue}
              disabled={unavailable}
              onClick={() => onChange(dateValue)}
              aria-label={`${date.getDate()} de ${monthFormatter.format(date)}`}
              aria-pressed={selected}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
