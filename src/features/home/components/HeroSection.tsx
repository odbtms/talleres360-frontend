export default function HeroSection() {
  return (
    <section className="hero" id="inicio">
      <div className="hero-content">
        <p className="hero-eyebrow">Tu vehículo, siempre acompañado</p>
        <h1>El cuidado de tu vehículo, más simple y transparente</h1>
        <p className="hero-description">
          En Talleres360 conectamos a clientes y talleres para gestionar cada servicio de forma clara,
          segura y sin perder de vista ningún avance.
        </p>
        <div className="hero-actions">
          <button className="btn public-secondary-button" type="button" aria-disabled="true">
            Agenda con nosotros
          </button>
        </div>
        <div className="hero-trust" aria-label="Beneficios del servicio">
          <span>Atención confiable</span>
          <span>Seguimiento centralizado</span>
        </div>
      </div>

      <div
        className="hero-visual"
        role="img"
        aria-label="Profesionales revisando un vehículo en un taller mecánico"
      />
    </section>
  );
}
