import { REGIONS, WORKSHOPS } from '../constants/workshops';
import { useSchedulingForm } from '../hooks/useSchedulingForm';
import type { RegionId, ServiceType } from '../types/scheduling';
import { formatPlateInput, formatRutInput, maximumAppointmentDate, minimumAppointmentDate } from '../utils/validation';
import AppointmentCalendar from './AppointmentCalendar';

interface SchedulingWizardProps { serviceType: ServiceType; email: string; }

const STEP_LABELS = ['Vehículo', 'Propietario', 'Servicio', 'Fecha', 'Resumen'];

export default function SchedulingWizard({ serviceType, email }: SchedulingWizardProps) {
  const { step, data, errors, progress, setField, next, back } = useSchedulingForm(serviceType, email);
  const [occupiedDates, setOccupiedDates] = useState<string[]>([]);
  const [availabilityError, setAvailabilityError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const availableWorkshops = WORKSHOPS.filter((workshop) => workshop.regionId === data.regionId);
  const selectedRegion = REGIONS.find((region) => region.id === data.regionId)?.name ?? '—';
  const selectedWorkshop = WORKSHOPS.find((workshop) => workshop.id === data.workshopId)?.name ?? '—';
  const serviceLabel = serviceType === 'maintenance' ? 'Mantenciones y arreglos' : 'Diagnósticos';

  useEffect(() => {
    if (!data.workshopId) {
      setOccupiedDates([]);
      return;
    }
    let active = true;
    setAvailabilityError('');
    appointmentsApi.availability(data.workshopId, minimumAppointmentDate(), maximumAppointmentDate())
      .then((result) => { if (active) setOccupiedDates(result.occupiedDates); })
      .catch(() => {
        if (active) {
          setOccupiedDates([]);
          setAvailabilityError('No pudimos cargar la disponibilidad. Inténtalo nuevamente.');
        }
      });
    return () => { active = false; };
  }, [data.workshopId]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (step !== 5) {
      next();
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      await appointmentsApi.create(toAppointmentPayload(data));
      window.location.assign('/mis-revisiones');
    } catch {
      setSubmitError('No se pudo confirmar la solicitud. Revisa la disponibilidad e inténtalo nuevamente.');
      setSubmitting(false);
    }
  }

  return (
    <form className="booking-form" onSubmit={submit} noValidate>
      <div className="booking-progress" aria-label={`Paso ${step} de 5`}>
        <div className="booking-progress__bar"><span style={{ width: `${progress}%` }} /></div>
        <ol>{STEP_LABELS.map((label, index) => <li className={index + 1 <= step ? 'is-active' : ''} key={label}><span>{index + 1}</span>{label}</li>)}</ol>
      </div>

      <section className="booking-step">
        {step === 1 && <>
          <div className="booking-step__heading"><span>Paso 1 de 5</span><h2>Datos del vehículo</h2><p>Ingresa la identificación básica del vehículo.</p></div>
          <div className="booking-fields booking-fields--three">
            <label>Patente<input value={data.plate} onChange={(e) => setField('plate', formatPlateInput(e.target.value))} placeholder="HD-JK-17" maxLength={8} autoComplete="off" />{errors.plate && <small className="field-error">{errors.plate}</small>}</label>
            <label>Modelo<input value={data.model} onChange={(e) => setField('model', e.target.value.replace(/[^\p{L}\p{N} ]/gu, '').slice(0, 60))} placeholder="Ej. Toyota Corolla" maxLength={60} />{errors.model && <small className="field-error">{errors.model}</small>}</label>
            <label>Año<input value={data.year} onChange={(e) => setField('year', e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="2022" inputMode="numeric" maxLength={4} />{errors.year && <small className="field-error">{errors.year}</small>}</label>
          </div>
        </>}

        {step === 2 && <>
          <div className="booking-step__heading"><span>Paso 2 de 5</span><h2>Datos del propietario</h2><p>El correo corresponde a la cuenta con la que iniciaste sesión.</p></div>
          <div className="booking-fields booking-fields--two">
            <label>RUT<input value={data.rut} onChange={(e) => setField('rut', formatRutInput(e.target.value))} placeholder="12.345.678-5" maxLength={12} />{errors.rut && <small className="field-error">{errors.rut}</small>}</label>
            <label>Nombre<input value={data.firstName} onChange={(e) => setField('firstName', e.target.value.slice(0, 50))} maxLength={50} autoComplete="given-name" />{errors.firstName && <small className="field-error">{errors.firstName}</small>}</label>
            <label>Apellido<input value={data.lastName} onChange={(e) => setField('lastName', e.target.value.slice(0, 50))} maxLength={50} autoComplete="family-name" />{errors.lastName && <small className="field-error">{errors.lastName}</small>}</label>
            <label>Teléfono<span className="phone-input"><span>+56 9</span><input value={data.phone} onChange={(e) => setField('phone', e.target.value.replace(/\D/g, '').slice(0, 8))} inputMode="numeric" maxLength={8} placeholder="12345678" autoComplete="tel-national" /></span>{errors.phone && <small className="field-error">{errors.phone}</small>}</label>
            <label className="booking-field--wide">Correo<input value={data.email} type="email" readOnly aria-readonly="true" />{errors.email && <small className="field-error">{errors.email}</small>}</label>
          </div>
        </>}

        {step === 3 && <>
          <div className="booking-step__heading"><span>Paso 3 de 5</span><h2>Selecciona dónde atenderte</h2><p>Tenemos 20 talleres distribuidos en tres regiones.</p></div>
          <div className="booking-fields booking-fields--two">
            <label>Región<select value={data.regionId} onChange={(e) => setField('regionId', e.target.value as RegionId | '')}><option value="">Selecciona una región</option>{REGIONS.map((region) => <option value={region.id} key={region.id}>{region.name}</option>)}</select>{errors.regionId && <small className="field-error">{errors.regionId}</small>}</label>
            <label>Taller<select value={data.workshopId} onChange={(e) => setField('workshopId', e.target.value ? Number(e.target.value) : '')} disabled={!data.regionId}><option value="">Selecciona un taller</option>{availableWorkshops.map((workshop) => <option value={workshop.id} key={workshop.id}>{workshop.name}</option>)}</select>{errors.workshopId && <small className="field-error">{errors.workshopId}</small>}</label>
            <label className="booking-field--wide">{serviceType === 'maintenance' ? '¿Qué mantención o arreglo necesita?' : '¿Qué problema necesitas diagnosticar?'}<textarea value={data.reason} onChange={(e) => setField('reason', e.target.value.slice(0, 500))} rows={5} maxLength={500} placeholder="Describe los síntomas, ruidos o trabajo que necesita el vehículo." /><span className="field-counter">{data.reason.length}/500</span>{errors.reason && <small className="field-error">{errors.reason}</small>}</label>
          </div>
        </>}

        {step === 4 && <>
          <div className="booking-step__heading"><span>Paso 4 de 5</span><h2>Selecciona una fecha</h2><p>Los días grises ya están ocupados para el taller seleccionado.</p></div>
          <div className="booking-fields booking-fields--date">
            <label>Fecha de atención
              <AppointmentCalendar
                value={data.appointmentDate}
                min={minimumAppointmentDate()}
                max={maximumAppointmentDate()}
                occupiedDates={occupiedDates}
                onChange={(date) => setField('appointmentDate', date)}
              />
              {availabilityError && <small className="field-error" role="alert">{availabilityError}</small>}
              {errors.appointmentDate && <small className="field-error">{errors.appointmentDate}</small>}
            </label>
          </div>
        </>}

        {step === 5 && <>
          <div className="booking-step__heading"><span>Paso 5 de 5</span><h2>Revisa tu solicitud</h2><p>Confirma que toda la información esté correcta antes de enviarla.</p></div>
          <div className="booking-summary">
            <section><h3>Servicio</h3><dl><dt>Tipo</dt><dd>{serviceLabel}</dd><dt>Motivo</dt><dd>{data.reason}</dd></dl></section>
            <section><h3>Vehículo</h3><dl><dt>Patente</dt><dd>{data.plate}</dd><dt>Modelo</dt><dd>{data.model}</dd><dt>Año</dt><dd>{data.year}</dd></dl></section>
            <section><h3>Propietario</h3><dl><dt>Nombre</dt><dd>{data.firstName} {data.lastName}</dd><dt>RUT</dt><dd>{data.rut}</dd><dt>Teléfono</dt><dd>+56 9 {data.phone}</dd><dt>Correo</dt><dd>{data.email}</dd></dl></section>
            <section><h3>Atención</h3><dl><dt>Región</dt><dd>{selectedRegion}</dd><dt>Taller</dt><dd>{selectedWorkshop}</dd><dt>Fecha</dt><dd>{data.appointmentDate}</dd></dl></section>
          </div>
          {submitError && <div className="booking-notice" role="alert">{submitError}</div>}
        </>}
      </section>

      <footer className="booking-actions">
        {step > 1 ? <button className="btn booking-button booking-button--secondary" type="button" onClick={back}>Atrás</button> : <a className="btn booking-button booking-button--secondary" href="/agendamiento">Volver</a>}
        <button className="btn booking-button booking-button--primary" type="submit" disabled={submitting || (step === 4 && Boolean(availabilityError))}>{submitting ? 'Confirmando…' : step === 5 ? 'Confirmar solicitud' : 'Siguiente'}</button>
      </footer>
    </form>
  );
}
import { useEffect, useState } from 'react';
import { appointmentsApi, toAppointmentPayload } from '../../../api/appointmentsApi';
