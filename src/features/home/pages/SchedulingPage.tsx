import PublicHeader from '../components/PublicHeader';
import BrandLogo from '../components/BrandLogo';
import { SCHEDULING_OPTIONS } from '../constants/homeContent';
import type { PublicPageProps } from '../types/home';
import type { Session } from '../../../types';
import { useState } from 'react';
import BookingWizard from '../../scheduling/components/BookingWizard';
import type { ServiceType } from '../../scheduling/types/scheduling';

interface SchedulingPageProps extends PublicPageProps { session?: Session; }

export default function SchedulingPage({
  onLogin,
  busy = false,
  loginDisabled = false,
  error = '',
  configurationMissing = false,
  session,
}: SchedulingPageProps) {
  const [selected, setSelected] = useState<ServiceType | null>(null);
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

      <main className={selected && session ? 'booking-page' : 'scheduling-page'}>
        {selected && session ? <><header className="booking-page__heading"><p className="section-eyebrow">Solicitud de atención</p><h1>{selected === 'maintenance' ? 'Mantenciones y arreglos' : 'Diagnóstico'}</h1></header><BookingWizard serviceType={selected} session={session} onBack={() => setSelected(null)} /></> : <>
        <header className="scheduling-heading">
          <p className="section-eyebrow">Agenda tu atención</p>
          <h1>¿Qué necesita tu vehículo?</h1>
          <p>
            Selecciona el servicio y completa cinco pasos para solicitar atención en uno de nuestros talleres.
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
                <button type="button" className="scheduling-card__button" disabled={busy || loginDisabled || configurationMissing} onClick={() => session ? setSelected(option.id) : onLogin?.()}>{session ? 'Seleccionar' : 'Iniciar sesión para agendar'}</button>
              </div>
            </article>
          ))}
        </section>
        </>}
      </main>

      <footer className="public-footer">
        <BrandLogo variant="footer" />
        <span>Gestión simple y transparente para tu vehículo.</span>
      </footer>
    </div>
  );
}
