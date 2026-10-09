import { useState, type ChangeEvent, type FormEvent } from 'react';
import type { Order, OrderPayload } from '../types';
import { formatPlateInput, formatRutInput, isValidRut } from '../features/scheduling/utils/validation';
import { WORKSHOPS } from '../features/scheduling/constants/workshops';

interface OrderFormState {
  workshopId: number | string;
  customerName: string;
  customerEmail: string;
  customerRut: string;
  customerPhone: string;
  vehiclePlate: string;
  vehicleModel: string;
  description: string;
}

interface OrderFormProps {
  initial: Order | null;
  onSubmit: (payload: OrderPayload) => Promise<void>;
  onCancel: () => void;
}

function toForm(order: Order | null): OrderFormState {
  if (!order) {
    return {
      workshopId: 1, customerName: '', customerEmail: '', vehiclePlate: '',
      vehicleModel: '', description: '', customerRut: '', customerPhone: '',
    };
  }
  return {
    workshopId: order.workshopId,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerRut: order.customerRut,
    customerPhone: order.customerPhone,
    vehiclePlate: order.vehiclePlate,
    vehicleModel: order.vehicleModel ?? '',
    description: order.description ?? '',
  };
}

export default function OrderForm({ initial, onSubmit, onCancel }: OrderFormProps) {
  const [form, setForm] = useState(() => toForm(initial));
  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState('');

  const set = (field: keyof OrderFormState) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm({ ...form, [field]: e.target.value });

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setValidationError('');
    if (!isValidRut(form.customerRut) || !/^\d{8}$/.test(form.customerPhone) || !/^[A-Z0-9]{2}-[A-Z0-9]{2}-[A-Z0-9]{2}$/.test(form.vehiclePlate) || !/^[\p{L} ]{2,120}$/u.test(form.customerName.trim()) || !/^[\p{L}\p{N} ]{2,120}$/u.test(form.vehicleModel.trim()) || form.description.trim().length < 10) {
      setValidationError('Revisa el RUT, teléfono, nombre, patente, modelo y descripción. El RUT debe tener un dígito verificador válido y el teléfono exactamente 8 números.'); return;
    }
    setSaving(true);
    try { await onSubmit({
      ...form,
      workshopId: Number(form.workshopId),
      customerName: form.customerName.trim(),
      customerEmail: form.customerEmail.trim(),
      vehicleModel: form.vehicleModel.trim(),
      description: form.description.trim(),
      items: [],
    }); } finally { setSaving(false); }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h2>{initial ? `Editar orden #${initial.id}` : 'Nueva orden'}</h2>
      {validationError && <p className="field-error" role="alert">{validationError}</p>}

      <div className="grid">
        <label>Cliente<input required minLength={2} maxLength={120} value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value.replace(/[^\p{L} ]/gu, '').slice(0, 120) })} /></label>
        <label>Email<input required type="email" maxLength={150} value={form.customerEmail} onChange={set('customerEmail')} /></label>
        <label>RUT<input required maxLength={12} placeholder="12.345.678-5" value={form.customerRut} onChange={(e) => setForm({ ...form, customerRut: formatRutInput(e.target.value) })} /></label>
        <label>Teléfono (+56 9)<input required inputMode="numeric" maxLength={8} value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value.replace(/\D/g, '').slice(0, 8) })} /></label>
        <label>Patente<input required maxLength={8} value={form.vehiclePlate} onChange={(e) => setForm({ ...form, vehiclePlate: formatPlateInput(e.target.value) })} placeholder="HD-JK-17" /></label>
        <label>Modelo<input required minLength={2} maxLength={120} value={form.vehicleModel} onChange={(e) => setForm({ ...form, vehicleModel: e.target.value.replace(/[^\p{L}\p{N} ]/gu, '').slice(0, 120) })} /></label>
        <label>Taller<select required value={form.workshopId} onChange={set('workshopId')}>{WORKSHOPS.map((workshop) => <option key={workshop.id} value={workshop.id}>{workshop.name}</option>)}</select></label>
      </div>
      <label>Trabajo a realizar<textarea required minLength={10} rows={3} maxLength={1000} value={form.description} onChange={set('description')} /></label>

      <p className="muted">Los repuestos se asignan desde el catálogo mientras la orden está en estado Recibida.</p>

      <div className="actions footer">
        <button type="button" className="btn ghost" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn primary" disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</button>
      </div>
    </form>
  );
}
