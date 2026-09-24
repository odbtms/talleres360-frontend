import { SERVICE_HIGHLIGHTS } from '../constants/homeContent';
import type { ServiceIcon as ServiceIconName } from '../types/home';

function ServiceIcon({ name }: { name: ServiceIconName }) {
  if (name === 'calendar') {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3v3M17 3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" /></svg>;
  }
  if (name === 'tracking') {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19V9M12 19V5M19 19v-7M3 19h18" /></svg>;
  }
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 5 6v5c0 4.6 2.9 8 7 10 4.1-2 7-5.4 7-10V6l-7-3Z" /><path d="m9 12 2 2 4-5" /></svg>;
}

export default function ServiceHighlights() {
  return (
    <section className="services-section" id="servicios">
      <div className="section-heading">
        <p className="section-eyebrow">Todo en un mismo lugar</p>
        <h2>Una experiencia clara de principio a fin</h2>
        <p>Menos incertidumbre y más control sobre el servicio de tu vehículo.</p>
      </div>
      <div className="service-grid">
        {SERVICE_HIGHLIGHTS.map((service) => (
          <article className="service-card" key={service.title}>
            <span className="service-card__icon"><ServiceIcon name={service.icon} /></span>
            <h3>{service.title}</h3>
            <p>{service.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
