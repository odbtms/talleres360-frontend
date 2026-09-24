import HeroSection from '../components/HeroSection';
import PublicHeader from '../components/PublicHeader';
import ServiceHighlights from '../components/ServiceHighlights';

interface HomePageProps {
  onLogin?: () => void | Promise<void>;
  busy?: boolean;
  loginDisabled?: boolean;
  error?: string;
  configurationMissing?: boolean;
}

export default function HomePage({
  onLogin,
  busy = false,
  loginDisabled = false,
  error = '',
  configurationMissing = false,
}: HomePageProps) {
  return (
    <div className="public-page">
      <PublicHeader onLogin={onLogin} busy={busy} loginDisabled={configurationMissing || loginDisabled} />
      {error && <div className="public-alert" role="alert">{error}</div>}
      {configurationMissing && (
        <div className="public-alert" role="alert">
          El acceso está deshabilitado porque falta configurar Microsoft Entra ID en el entorno local.
        </div>
      )}
      <main>
        <HeroSection />
        <ServiceHighlights />
        <section className="about-section" id="nosotros">
          <div>
            <p className="section-eyebrow">Sobre Talleres360</p>
            <h2>Conectamos el taller con quien más importa: el cliente</h2>
          </div>
          <p>
            Organizamos la información de cada atención para que clientes, operadores y administradores
            trabajen sobre un mismo proceso, con responsabilidades claramente diferenciadas.
          </p>
        </section>
      </main>
      <footer className="public-footer">
        <span className="public-brand public-brand--footer"><span className="public-brand-mark">T</span>Talleres360</span>
        <span>Gestión simple y transparente para tu vehículo.</span>
      </footer>
    </div>
  );
}
