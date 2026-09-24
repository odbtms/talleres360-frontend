import PublicHeader from '../../home/components/PublicHeader';
import type { PublicPageProps } from '../../home/types/home';

export default function LoginRequiredPage({ onLogin, busy, loginDisabled, error }: PublicPageProps) {
  return (
    <div className="public-page">
      <PublicHeader onLogin={onLogin} busy={busy} loginDisabled={loginDisabled} />
      {error && <div className="public-alert" role="alert">{error}</div>}
      <main className="login-required">
        <div className="login-required__card">
          <p className="section-eyebrow">Agendamiento protegido</p>
          <h1>Inicia sesión para continuar</h1>
          <p>Usaremos tu cuenta para identificar la solicitud y completar automáticamente tu correo electrónico.</p>
          <button className="btn public-login-button" type="button" onClick={onLogin} disabled={busy || loginDisabled}>
            {busy ? 'Conectando…' : 'Iniciar sesión'}
          </button>
          <a href="/agendamiento">Volver a las opciones</a>
        </div>
      </main>
    </div>
  );
}
