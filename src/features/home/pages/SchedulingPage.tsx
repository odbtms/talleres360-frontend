import PublicHeader from '../components/PublicHeader';
import BrandLogo from '../components/BrandLogo';
import { SCHEDULING_OPTIONS } from '../constants/homeContent';
import type { PublicPageProps } from '../types/home';
import type { Session } from '../../../types';

interface SchedulingPageProps extends PublicPageProps { session?: Session; }

export default function SchedulingPage({
  onLogin,
  busy = false,
  loginDisabled = false,
  error = '',
  configurationMissing = false,
  session,
}: SchedulingPageProps) {
  return (
    <div className="public-page">
      <PublicHeader
        onLogin={onLogin}
        busy={busy}
        loginDisabled={configurationMissing || loginDisabled}
        accountName={session?.name}
        onLogout={session?.logout}
        showClientNavigation={Boolean(session)}
      />
      {error && <div className="public-alert" role="alert">{error}</div>}
      {configurationMissing && (
        <div className="public-alert" role="alert">
          El acceso está deshabilitado porque falta configurar Microsoft Entra ID en el entorno local.
        </div>
      )}

      <main className="scheduling-page">
        <header className="scheduling-heading">
          <p className="section-eyebrow">Agenda tu atención</p>
          <h1>¿Qué necesita tu vehículo?</h1>
          <p>
            Selecciona el tipo de atención que buscas. Esta información nos permitirá dirigir tu solicitud
            al proceso adecuado desde el comienzo.
          </p>
        </header>

        <section className="scheduling-options" aria-label="Tipos de atención disponibles">
          {SCHEDULING_OPTIONS.map((option) => (
            <article
              className="scheduling-card"
              key={option.id}
              style={{
                backgroundImage: `linear-gradient(rgba(15, 23, 42, .3), rgba(15, 23, 42, .82)), url(${option.imageUrl})`,
              }}
            >
              <div className="scheduling-card__content">
                <h2>{option.title}</h2>
                <p>{option.description}</p>
                <a className="scheduling-card__button" href={`/agendamiento/solicitud?tipo=${option.id}`}>
                  Seleccionar
                </a>
              </div>
            </article>
          ))}
        </section>
      </main>

      <footer className="public-footer">
        <BrandLogo variant="footer" />
        <span>Gestión simple y transparente para tu vehículo.</span>
      </footer>
    </div>
  );
}
