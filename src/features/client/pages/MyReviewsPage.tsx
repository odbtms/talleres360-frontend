import { useEffect, useState } from 'react';
import { appointmentsApi } from '../../../api/appointmentsApi';
import PublicHeader from '../../home/components/PublicHeader';
import StatusBadge from '../../../components/StatusBadge';
import { formatDate, formatMoney } from '../../../utils/format';
import type { Order, Session } from '../../../types';
import { WORKSHOPS } from '../../scheduling/constants/workshops';

interface MyReviewsPageProps { session: Session; }

const serviceLabel = (order: Order) => {
  if (order.serviceType === 'MAINTENANCE') return 'Mantenciones y arreglos';
  if (order.serviceType === 'DIAGNOSTICS') return 'Diagnóstico';
  return 'Orden de servicio';
};

const workshopLabel = (workshopId: number) =>
  WORKSHOPS.find((workshop) => workshop.id === workshopId)?.name ?? `Taller #${workshopId}`;
const regionLabel = (region?: Order['regionId']) => region === 'biobio' ? 'Biobío' : region === 'maule' ? 'Maule' : region === 'araucania' ? 'La Araucanía' : 'No informada';

export default function MyReviewsPage({ session }: MyReviewsPageProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    appointmentsApi.listMine()
      .then((result) => { if (active) setOrders(result); })
      .catch(() => { if (active) setError('No pudimos cargar tus revisiones técnicas. Inténtalo nuevamente.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <div className="public-page">
      <PublicHeader accountName={session.name} onLogout={session.logout} showClientNavigation />
      <main className="reviews-page">
        <header className="reviews-heading">
          <p className="section-eyebrow">Tu historial</p>
          <h1>Mi revisión técnica</h1>
          <p>Consulta tus solicitudes y despliega su información completa.</p>
        </header>

        {loading && <p className="reviews-status">Cargando tus revisiones…</p>}
        {error && <div className="public-alert" role="alert">{error}</div>}

        {!loading && !error && orders.length === 0 && (
          <section className="reviews-empty">
            <h2>Agenda tu revisión técnica ahora</h2>
            <p>Aún no tienes solicitudes asociadas a tu cuenta.</p>
            <a className="btn booking-button booking-button--primary" href="/agendamiento">Ir a agendamiento</a>
          </section>
        )}

        {!loading && orders.length > 0 && (
          <section className="reviews-list" aria-label="Revisiones solicitadas">
            {orders.map((order) => {
              const expanded = selectedId === order.id;
              return (
                <article className={`review-card ${expanded ? 'is-expanded' : ''}`} key={order.id}>
                  <button className="review-card__trigger" type="button" onClick={() => setSelectedId(expanded ? null : order.id)} aria-expanded={expanded}>
                    <span><small>ID</small><strong>#{order.id}</strong></span>
                    <span><small>Tipo de revisión</small><strong>{serviceLabel(order)}</strong></span>
                    <span><small>Fecha de atención</small><strong>{formatDate(order.appointmentDate ?? order.createdAt)}</strong></span>
                    <span className="review-card__status"><StatusBadge status={order.status} /></span>
                    <span className="review-card__chevron" aria-hidden="true">⌄</span>
                  </button>
                  {expanded && (
                    <div className="review-card__detail">
                      <dl>
                        <dt>Vehículo</dt><dd>{order.vehiclePlate} · {order.vehicleModel || 'Modelo no informado'}</dd>
                        <dt>Tipo de revisión</dt><dd>{serviceLabel(order)}</dd>
                        <dt>Región</dt><dd>{regionLabel(order.regionId)}</dd>
                        <dt>Motivo</dt><dd>{order.description || 'Sin descripción'}</dd>
                        <dt>Taller</dt><dd>{workshopLabel(order.workshopId)}</dd>
                        <dt>Solicitada</dt><dd>{formatDate(order.createdAt)}</dd>
                        <dt>Total</dt><dd>{formatMoney(order.total)}</dd>
                        <dt>Entrega estimada</dt><dd>{formatDate(order.estimatedDeliveryDate)}</dd>
                      </dl>
                    </div>
                  )}
                </article>
              );
            })}
          </section>
        )}
      </main>
    </div>
  );
}
