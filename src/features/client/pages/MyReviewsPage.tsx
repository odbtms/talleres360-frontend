import { useEffect, useState } from 'react';
import { ordersApi } from '../../../api/ordersApi';
import PublicHeader from '../../home/components/PublicHeader';
import StatusBadge from '../../../components/StatusBadge';
import { formatDate, formatMoney } from '../../../utils/format';
import type { Order, Session } from '../../../types';
import { WORKSHOPS } from '../../scheduling/constants/workshops';

interface MyReviewsPageProps { session: Session; }

const workshopLabel = (workshopId: number) =>
  WORKSHOPS.find((workshop) => workshop.id === workshopId)?.name ?? `Taller #${workshopId}`;

const sameEmail = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

export default function MyReviewsPage({ session }: MyReviewsPageProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    // El BFF deja a Cliente leer ordenes; se muestran solo las registradas con su correo
    ordersApi.list()
      .then((result) => { if (active) setOrders(result.filter((order) => sameEmail(order.customerEmail, session.username))); })
      .catch(() => { if (active) setError('No pudimos cargar tus revisiones técnicas. Inténtalo nuevamente.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [session.username]);

  return (
    <div className="public-page">
      <PublicHeader accountName={session.name} onLogout={session.logout} showClientNavigation />
      <main className="reviews-page">
        <header className="reviews-heading">
          <p className="section-eyebrow">Tu historial</p>
          <h1>Mi revisión técnica</h1>
          <p>Consulta las órdenes de trabajo registradas con tu correo.</p>
        </header>

        {loading && <p className="reviews-status">Cargando tus revisiones…</p>}
        {error && <div className="public-alert" role="alert">{error}</div>}

        {!loading && !error && orders.length === 0 && (
          <section className="reviews-empty">
            <h2>Aún no tienes órdenes</h2>
            <p>Cuando el taller registre una orden con tu correo ({session.username}) aparecerá aquí.</p>
            <a className="btn booking-button booking-button--primary" href="/agendamiento">Cómo agendar</a>
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
                    <span><small>Vehículo</small><strong>{order.vehiclePlate}</strong></span>
                    <span><small>Fecha de ingreso</small><strong>{formatDate(order.createdAt)}</strong></span>
                    <span className="review-card__status"><StatusBadge status={order.status} /></span>
                    <span className="review-card__chevron" aria-hidden="true">⌄</span>
                  </button>
                  {expanded && (
                    <div className="review-card__detail">
                      <dl>
                        <dt>Vehículo</dt><dd>{order.vehiclePlate} · {order.vehicleModel || 'Modelo no informado'}</dd>
                        <dt>Motivo</dt><dd>{order.description || 'Sin descripción'}</dd>
                        <dt>Taller</dt><dd>{workshopLabel(order.workshopId)}</dd>
                        <dt>Solicitada</dt><dd>{formatDate(order.createdAt)}</dd>
                        <dt>Total</dt><dd>{formatMoney(order.total)}</dd>
                        <dt>Aceptada</dt><dd>{formatDate(order.acceptedAt)}</dd>
                        <dt>Entregada</dt><dd>{formatDate(order.deliveredAt)}</dd>
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
