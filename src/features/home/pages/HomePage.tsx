import HeroSection from '../components/HeroSection';
import PublicHeader from '../components/PublicHeader';
import ServiceHighlights from '../components/ServiceHighlights';
import BrandLogo from '../components/BrandLogo';
import type { PublicPageProps } from '../types/home';
import type { Session } from '../../../types';

interface HomePageProps extends PublicPageProps { session?: Session; }

export default function HomePage({
  onLogin,
  busy = false,
  loginDisabled = false,
  error = '',
  configurationMissing = false,
  session,
}: HomePageProps) {
  return (
    <div className="public-page">
      <PublicHeader
        onLogin={onLogin}
        busy={busy}
        loginDisabled={configurationMissing || loginDisabled}
        accountName={session?.name}
        onLogout={session?.logout}
        roles={session?.roles}
        showClientNavigation={Boolean(session?.roles.includes('Cliente') && !session.roles.some(r => r === 'Admin' || r === 'Operador'))}
      />
      {error && <div className="public-alert" role="alert">{error}</div>}
      {configurationMissing && (
        <div className="public-alert" role="alert">
          El acceso está deshabilitado porque falta configurar Microsoft Entra ID en el entorno local.
        </div>
      )}
      <main>
        <HeroSection session={session} />
        <ServiceHighlights />
        <section className="about-section" id="nosotros">
          <div>
            <p className="section-eyebrow">Sobre Talleres360</p>
            <h2>Conectamos el taller con quien más importa: el cliente</h2>
          </div>
          <p>
            Somos un único taller. Te ayudamos a elegir repuestos y coordinar su retiro:
            envías tu solicitud, nuestro operador la revisa y puedes seguir su estado desde tu cuenta.
          </p>
        </section>
      </main>
      <footer className="public-footer">
        <BrandLogo variant="footer" />
        <span>Repuestos y solicitudes de retiro, sin pagos en línea.</span>
      </footer>
    </div>
  );
}
