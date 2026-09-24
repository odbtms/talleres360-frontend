import { useState, type ChangeEvent, type FormEvent } from 'react';
import type { Order, OrderPayload } from '../types';
import { formatPlateInput, formatRutInput, isValidRut } from '../features/scheduling/utils/validation';

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
      workshopId: 1, customerName: '', customerEmail: '', customerRut: '', customerPhone: '', vehiclePlate: '',
      vehicleModel: '', description: '',
    };
  }
  return {
    workshopId: order.workshopId,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerRut: order.customerRut ?? '',
    customerPhone: order.customerPhone ?? '',
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
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [field]: e.target.value });

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setValidationError('');
    if (!isValidRut(form.customerRut)) {
      setValidationError('El RUT no es válido según Módulo 11.');
      return;
    }
    setSaving(true);
    await onSubmit({
      ...form,
      workshopId: Number(form.workshopId),
      items: [],
    });
    setSaving(false);
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h2>{initial ? `Editar orden #${initial.id}` : 'Nueva orden'}</h2>
      {validationError && <p className="field-error" role="alert">{validationError}</p>}

      <div className="grid">
        <label>Cliente<input required minLength={2} maxLength={120} value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value.replace(/[^\p{L} '-]/gu, '').slice(0, 120) })} /></label>
        <label>Email<input required type="email" maxLength={150} value={form.customerEmail} onChange={set('customerEmail')} /></label>
        <label>RUT<input required maxLength={12} value={form.customerRut} onChange={(e) => setForm({ ...form, customerRut: formatRutInput(e.target.value) })} placeholder="12.345.678-5" /></label>
        <label>Teléfono (+56 9)<input required inputMode="numeric" pattern="[0-9]{8}" maxLength={8} value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value.replace(/\D/g, '').slice(0, 8) })} placeholder="12345678" /></label>
        <label>Patente<input required maxLength={8} value={form.vehiclePlate} onChange={(e) => setForm({ ...form, vehiclePlate: formatPlateInput(e.target.value) })} placeholder="HD-JK-17" /></label>
        <label>Modelo<input maxLength={120} value={form.vehicleModel} onChange={(e) => setForm({ ...form, vehicleModel: e.target.value.replace(/[^\p{L}\p{N} ]/gu, '').slice(0, 120) })} /></label>
        <label>Taller (ID)<input required type="number" min={1} max={20} value={form.workshopId} onChange={set('workshopId')} /></label>
      </div>
      <label>Trabajo a realizar<textarea required minLength={10} rows={3} maxLength={1000} value={form.description} onChange={set('description')} /></label>

      <p className="muted">Los repuestos y servicios se asignan desde el catálogo después de aceptar la solicitud.</p>

      <div className="actions footer">
        <button type="button" className="btn ghost" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn primary" disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</button>
      </div>
    </form>
  );
}
