import { useState } from 'react';
import { formatMoney } from '../utils/format';

const EMPTY_ITEM = { productId: '', quantity: 1, unitPrice: '' };

function toForm(order) {
  if (!order) {
    return {
      workshopId: 1, customerName: '', customerEmail: '', vehiclePlate: '',
      vehicleModel: '', description: '', items: [{ ...EMPTY_ITEM }],
    };
  }
  return {
    workshopId: order.workshopId,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    vehiclePlate: order.vehiclePlate,
    vehicleModel: order.vehicleModel ?? '',
    description: order.description ?? '',
    items: order.items.map(({ productId, quantity, unitPrice }) => ({ productId, quantity, unitPrice })),
  };
}

export default function OrderForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(() => toForm(initial));
  const [saving, setSaving] = useState(false);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });
  const setItem = (index, field, value) =>
    setForm({ ...form, items: form.items.map((item, i) => (i === index ? { ...item, [field]: value } : item)) });
  const addItem = () => setForm({ ...form, items: [...form.items, { ...EMPTY_ITEM }] });
  const removeItem = (index) => setForm({ ...form, items: form.items.filter((_, i) => i !== index) });

  const total = form.items.reduce((sum, i) => sum + Number(i.quantity || 0) * Number(i.unitPrice || 0), 0);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    await onSubmit({
      ...form,
      workshopId: Number(form.workshopId),
      items: form.items
        .filter((i) => i.productId !== '')
        .map((i) => ({ productId: Number(i.productId), quantity: Number(i.quantity), unitPrice: Number(i.unitPrice) })),
    });
    setSaving(false);
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h2>{initial ? `Editar orden #${initial.id}` : 'Nueva orden'}</h2>

      <div className="grid">
        <label>Cliente<input required maxLength={120} value={form.customerName} onChange={set('customerName')} /></label>
        <label>Email<input required type="email" maxLength={150} value={form.customerEmail} onChange={set('customerEmail')} /></label>
        <label>Patente<input required maxLength={10} value={form.vehiclePlate} onChange={set('vehiclePlate')} /></label>
        <label>Modelo<input maxLength={120} value={form.vehicleModel} onChange={set('vehicleModel')} /></label>
        <label>Taller (ID)<input required type="number" min={1} value={form.workshopId} onChange={set('workshopId')} /></label>
      </div>
      <label>Trabajo a realizar<textarea rows={3} maxLength={1000} value={form.description} onChange={set('description')} /></label>

      <h3>Repuestos / servicios</h3>
      {form.items.map((item, index) => (
        <div className="item-row" key={index}>
          <label>Producto (ID)
            <input type="number" min={1} value={item.productId} onChange={(e) => setItem(index, 'productId', e.target.value)} />
          </label>
          <label>Cant.
            <input type="number" min={1} required={item.productId !== ''} value={item.quantity} onChange={(e) => setItem(index, 'quantity', e.target.value)} />
          </label>
          <label>Precio
            <input type="number" min={0} required={item.productId !== ''} value={item.unitPrice} onChange={(e) => setItem(index, 'unitPrice', e.target.value)} />
          </label>
          <button type="button" className="btn icon" aria-label="Quitar ítem" onClick={() => removeItem(index)}>×</button>
        </div>
      ))}
      <button type="button" className="btn ghost small" onClick={addItem}>+ Agregar ítem</button>

      <p className="form-total">Total estimado: <strong>{formatMoney(total)}</strong></p>

      <div className="actions footer">
        <button type="button" className="btn ghost" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn primary" disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</button>
      </div>
    </form>
  );
}
