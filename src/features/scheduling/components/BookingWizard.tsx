import { useRef, useState, type FormEvent } from 'react';
import { appointmentPayload, appointmentsApi } from '../../../api/appointmentsApi';
import type { Order, Session } from '../../../types';
import { REGIONS, WORKSHOPS } from '../constants/workshops';
import type { SchedulingErrors, SchedulingFormData, ServiceType } from '../types/scheduling';
import { formatPlateInput, formatRutInput, validateStep } from '../utils/validation';
import AppointmentCalendar from './AppointmentCalendar';
import { serviceLabel } from '../utils/serviceLabel';
import '../booking.css';

const STEPS = ['Vehículo', 'Propietario', 'Servicio', 'Fecha', 'Resumen'];
const TITLES = ['Datos del vehículo', 'Datos del propietario', 'Selecciona tu taller', 'Selecciona una fecha', 'Revisa tu solicitud'];

interface Props { serviceType: ServiceType; session: Session; onBack: () => void; }
export default function BookingWizard({ serviceType, session, onBack }: Props) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<SchedulingFormData>({ serviceType, plate: '', model: '', year: '', rut: '', firstName: '', lastName: '', phone: '', email: session.username, regionId: '', workshopId: '', reason: '', appointmentDate: '' });
  const [errors, setErrors] = useState<SchedulingErrors>({});
  const [error, setError] = useState('');
  const [saved, setSaved] = useState<Order | null>(null);
  const [saving, setSaving] = useState(false);
  const submitting = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  function update<K extends keyof SchedulingFormData>(field: K, value: SchedulingFormData[K]) {
    setData((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined })); setError('');
  }
  function changeStep(next: number) { setStep(next); setErrors({}); setError(''); window.setTimeout(() => heading.current?.focus(), 0); }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    const invalid = step === 5 ? Object.assign({}, ...[1, 2, 3, 4].map((n) => validateStep(n, data))) as SchedulingErrors : validateStep(step, data);
    if (Object.keys(invalid).length) {
      setErrors(invalid);
      if (step === 5) setStep([1, 2, 3, 4].find((n) => Object.keys(validateStep(n, data)).length)!);
      setError('Revisa los campos indicados antes de continuar.'); return;
    }
    if (step < 5) { changeStep(step + 1); return; }
    submitting.current = true; setSaving(true); setError('');
    try { setSaved(await appointmentsApi.create(appointmentPayload(data))); }
    catch { setError('No se pudo confirmar la solicitud. Revisa los datos e inténtalo nuevamente.'); }
    finally { submitting.current = false; setSaving(false); }
  }
  const fieldError = (field: keyof SchedulingFormData) => errors[field] ? <small className="field-error" role="alert">{errors[field]}</small> : null;
  if (saved) return <section className="booking-form booking-success" role="status"><h2>Solicitud #{saved.id} registrada</h2><p>{serviceLabel(saved.serviceType)} · {WORKSHOPS.find((w) => w.id === saved.workshopId)?.name} · {saved.appointmentDate}</p><p>El taller revisará tu solicitud. Puedes consultar su estado y el resumen en tu historial.</p><a className="btn booking-button booking-button--primary" href="/mis-revisiones">Ver mi revisión técnica</a></section>;
  return <form className="booking-form" onSubmit={submit}>
    <div className="booking-progress"><div className="booking-progress__bar" role="progressbar" aria-label="Progreso del agendamiento" aria-valuemin={1} aria-valuemax={5} aria-valuenow={step}><span style={{ width: `${step * 20}%` }} /></div><ol>{STEPS.map((name, index) => <li key={name} className={index < step ? 'is-active' : ''} aria-current={index + 1 === step ? 'step' : undefined}><span>{index + 1}</span>{name}</li>)}</ol></div>
    <div className="booking-step"><header className="booking-step__heading"><span>Paso {step} de 5</span><h2 ref={heading} tabIndex={-1}>{TITLES[step - 1]}</h2></header>
      {error && <p className="booking-notice" role="alert">{error}</p>}
      {step === 1 && <div className="booking-fields booking-fields--three">
        <label>Patente<input required maxLength={8} autoComplete="off" placeholder="HD-JK-17" value={data.plate} onChange={(e) => update('plate', formatPlateInput(e.target.value))} />{fieldError('plate')}</label>
        <label>Modelo<input required minLength={2} maxLength={60} placeholder="Ej. Toyota Corolla" value={data.model} onChange={(e) => update('model', e.target.value.replace(/[^\p{L}\p{N} ]/gu, ''))} />{fieldError('model')}</label>
        <label>Año<input required inputMode="numeric" maxLength={4} placeholder="2022" value={data.year} onChange={(e) => update('year', e.target.value.replace(/\D/g, '').slice(0, 4))} />{fieldError('year')}</label>
      </div>}
      {step === 2 && <div className="booking-fields booking-fields--two">
        <label>RUT<input required maxLength={12} placeholder="12.345.678-5" value={data.rut} onChange={(e) => update('rut', formatRutInput(e.target.value))} />{fieldError('rut')}</label>
        <label>Teléfono (+56 9)<input required inputMode="numeric" maxLength={8} placeholder="8 dígitos" value={data.phone} onChange={(e) => update('phone', e.target.value.replace(/\D/g, '').slice(0, 8))} />{fieldError('phone')}</label>
        <label>Nombre<input required minLength={2} maxLength={50} autoComplete="given-name" value={data.firstName} onChange={(e) => update('firstName', e.target.value.replace(/[^\p{L} ]/gu, ''))} />{fieldError('firstName')}</label>
        <label>Apellido<input required minLength={2} maxLength={50} autoComplete="family-name" value={data.lastName} onChange={(e) => update('lastName', e.target.value.replace(/[^\p{L} ]/gu, ''))} />{fieldError('lastName')}</label>
        <label className="booking-field--wide">Correo de tu cuenta<input type="email" value={data.email} readOnly />{fieldError('email')}</label>
        <p className="muted booking-field--wide">Módulo 11 valida el dígito verificador del RUT; no acredita la identidad de una persona.</p>
      </div>}
      {step === 3 && <div className="booking-fields booking-fields--two">
        <label>Región<select required value={data.regionId} onChange={(e) => { setData((current) => ({ ...current, regionId: e.target.value as SchedulingFormData['regionId'], workshopId: '', appointmentDate: '' })); setErrors({}); }}><option value="">Selecciona una región</option>{REGIONS.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select>{fieldError('regionId')}</label>
        <label>Taller<select required disabled={!data.regionId} value={data.workshopId} onChange={(e) => { update('workshopId', e.target.value ? Number(e.target.value) : ''); update('appointmentDate', ''); }}><option value="">Selecciona un taller</option>{WORKSHOPS.filter((w) => w.regionId === data.regionId).map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}</select>{fieldError('workshopId')}</label>
        <label className="booking-field--wide">{serviceType === 'maintenance' ? '¿Por qué necesita mantención o reparación?' : '¿Qué problema necesitas diagnosticar?'}<textarea required minLength={10} maxLength={500} rows={4} value={data.reason} onChange={(e) => update('reason', e.target.value)} />{fieldError('reason')}</label>
      </div>}
      {step === 4 && <div className="booking-fields booking-fields--date"><p>Selecciona un día dentro de los próximos 90 días.</p><AppointmentCalendar workshopId={Number(data.workshopId)} value={data.appointmentDate} onChange={(date) => update('appointmentDate', date)} />{fieldError('appointmentDate')}<p aria-live="polite">Fecha seleccionada: <strong>{data.appointmentDate || 'Sin seleccionar'}</strong></p></div>}
      {step === 5 && <div className="booking-summary">
        <section><h3>Servicio</h3><dl><dt>Tipo</dt><dd>{serviceLabel(serviceType)}</dd><dt>Motivo</dt><dd>{data.reason}</dd></dl></section>
        <section><h3>Vehículo</h3><dl><dt>Patente</dt><dd>{data.plate}</dd><dt>Modelo</dt><dd>{data.model}</dd><dt>Año</dt><dd>{data.year}</dd></dl></section>
        <section><h3>Propietario</h3><dl><dt>Nombre</dt><dd>{data.firstName} {data.lastName}</dd><dt>RUT</dt><dd>{data.rut}</dd><dt>Teléfono</dt><dd>+56 9 {data.phone}</dd><dt>Correo</dt><dd>{data.email}</dd></dl></section>
        <section><h3>Atención</h3><dl><dt>Región</dt><dd>{REGIONS.find((r) => r.id === data.regionId)?.name}</dd><dt>Taller</dt><dd>{WORKSHOPS.find((w) => w.id === data.workshopId)?.name}</dd><dt>Fecha</dt><dd>{data.appointmentDate}</dd></dl></section>
      </div>}
    </div>
    <div className="booking-actions"><button type="button" className="btn booking-button booking-button--secondary" disabled={saving} onClick={() => step === 1 ? onBack() : changeStep(step - 1)}>{step === 1 ? 'Volver' : 'Atrás'}</button><button type="submit" className="btn booking-button booking-button--primary" disabled={saving}>{saving ? 'Confirmando…' : step === 5 ? 'Confirmar solicitud' : 'Siguiente'}</button></div>
  </form>;
}
