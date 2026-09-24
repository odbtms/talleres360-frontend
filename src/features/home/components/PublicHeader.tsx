import LoginButton from '../../../auth/LoginButton';
import BrandLogo from './BrandLogo';

interface PublicHeaderProps {
  onLogin?: () => void | Promise<void>;
  busy?: boolean;
  loginDisabled?: boolean;
  accountName?: string;
  onLogout?: () => void | Promise<void>;
  showClientNavigation?: boolean;
}

export default function PublicHeader({
  onLogin,
  busy,
  loginDisabled,
  accountName,
  onLogout,
  showClientNavigation = false,
}: PublicHeaderProps) {
  return (
    <header className="public-header">
      <a className="public-brand" href="/" aria-label="Ir al inicio de Talleres360">
        <BrandLogo />
      </a>

      <nav className="public-navigation" aria-label="Navegación principal">
        <a href="/">Inicio</a>
        {showClientNavigation && <a href="/mis-revisiones">Mi revisión técnica</a>}
        <a href="/agendamiento">Agendamiento</a>
        <a href="/#servicios">Servicios</a>
        <a href="/#nosotros">Nosotros</a>
      </nav>

      {accountName ? (
        <div className="public-session">
          <span className="public-account">{accountName}</span>
          {onLogout && <button type="button" onClick={onLogout}>Cerrar sesión</button>}
        </div>
      ) : (
        <LoginButton className="public-login-button--header" onLogin={onLogin} busy={busy} disabled={loginDisabled} />
      )}
    </header>
  );
}
