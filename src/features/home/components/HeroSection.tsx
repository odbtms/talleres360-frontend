export default function HeroSection() {
  return (
    <section className="hero" id="inicio">
      <div className="hero-content">
        <p className="hero-eyebrow">Repuestos para tu vehículo</p>
        <h1>Elige tus repuestos y solicita su retiro en el taller</h1>
        <p className="hero-description">
          Consulta el catálogo, arma tu carrito y envía una solicitud sin pagos en línea.
          El operador confirma tu pedido y te avisamos cuando esté listo para retirar.
        </p>
        <div className="hero-actions">
          <a className="btn primary" href="/catalogo">
            Explorar catálogo
          </a>
        </div>
        <div className="hero-trust" aria-label="Beneficios del servicio">
          <span>Cuentas autorizadas @duocuc.cl y onmicrosoft.com</span>
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
