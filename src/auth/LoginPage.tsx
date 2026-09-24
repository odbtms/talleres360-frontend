function MicrosoftLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 21 21" aria-hidden="true">
      <rect x="1" y="1" width="9" height="9" fill="#f25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
      <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
      <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
    </svg>
  );
}

export default function LoginPage({
  onLogin,
  busy = false,
  error = '',
  localMode = false,
  onLocalLogin,
}: LoginPageProps) {
  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-brand">Talleres360</div>
        <p className="login-subtitle">Gestión de órdenes de trabajo</p>

        <button className="btn ms-btn" onClick={onLogin} disabled={busy || localMode}>
          <MicrosoftLogo />
          {busy ? 'Conectando…' : 'Iniciar sesión con Microsoft'}
        </button>

        {error && <p className="login-error" role="alert">{error}</p>}

        {localMode && (
          <div className="login-notice">
            <p>
              <strong>Entra ID aún no está configurado.</strong> Completa <code>VITE_ENTRA_TENANT_ID</code>,{' '}
              <code>VITE_SPA_CLIENT_ID</code> y <code>VITE_API_CLIENT_ID</code> en <code>.env.local</code> y reinicia Vite.
            </p>
            <button className="btn ghost" onClick={onLocalLogin}>Entrar en modo local (solo desarrollo)</button>
          </div>
        )}

        <p className="login-footer">Acceso para Admin, Operador y Cliente de la red de talleres.</p>
      </div>
    </div>
  );
}
interface LoginPageProps {
  onLogin?: () => void | Promise<void>;
  busy?: boolean;
  error?: string;
  localMode?: boolean;
  onLocalLogin?: () => void;
}

