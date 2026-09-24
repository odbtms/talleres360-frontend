import LoginButton from '../../../auth/LoginButton';

interface PublicHeaderProps {
  onLogin?: () => void | Promise<void>;
  busy?: boolean;
  loginDisabled?: boolean;
}

export default function PublicHeader({ onLogin, busy, loginDisabled }: PublicHeaderProps) {
  return (
    <header className="public-header">
      <a className="public-brand" href="#inicio" aria-label="Ir al inicio de Talleres360">
        <span className="public-brand-mark" aria-hidden="true">T</span>
        <span>Talleres360</span>
      </a>

      <nav className="public-navigation" aria-label="Navegación principal">
        <a href="#inicio">Inicio</a>
        <span className="public-navigation__pending" aria-disabled="true">Agendamiento</span>
        <a href="#servicios">Servicios</a>
        <a href="#nosotros">Nosotros</a>
      </nav>

      <LoginButton
        className="public-login-button--header"
        onLogin={onLogin}
        busy={busy}
        disabled={loginDisabled}
      />
    </header>
  );
}
