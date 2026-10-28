import LoginButton from '../../../auth/LoginButton';
import BrandLogo from './BrandLogo';
import { useState } from 'react';

interface PublicHeaderProps {
  onLogin?: () => void | Promise<void>;
  busy?: boolean;
  loginDisabled?: boolean;
  accountName?: string;
  onLogout?: () => void | Promise<void>;
  showClientNavigation?: boolean;
  roles?: readonly string[];
}

export default function PublicHeader({
  onLogin,
  busy,
  loginDisabled,
  accountName,
  onLogout,
  showClientNavigation = false,
  roles = [],
}: PublicHeaderProps) {
  const [abierto, setAbierto] = useState(false);
  const personal = roles.some(rol => rol === 'Admin' || rol === 'Operador');
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  return (
    <header className="public-header">
      <a className="public-brand" href="/" aria-label="Ir al inicio de Talleres360">
        <BrandLogo />
      </a>

      <button className="public-menu-toggle" type="button" aria-controls="public-navigation" aria-expanded={abierto} onClick={() => setAbierto(valor => !valor)}>{abierto ? 'Cerrar menú' : 'Menú'}</button>
      <nav id="public-navigation" className={`public-navigation${abierto ? ' is-open' : ''}`} aria-label="Navegación principal">
        <a href="/" aria-current={path === '/' ? 'page' : undefined}>Inicio</a>
        <a href="/catalogo" aria-current={path === '/catalogo' ? 'page' : undefined}>Catálogo</a>
        {showClientNavigation && <a href="/mis-solicitudes">Mis solicitudes</a>}
        {showClientNavigation && !personal && <a href="/notificaciones">Notificaciones</a>}
        <a href="/#servicios">Servicios</a>
        <a href="/#nosotros">Nosotros</a>
      </nav>

      {accountName ? (
        <div className="public-session">
          {personal && <a className="public-dashboard-link" href="/dashboard">Dashboard</a>}
          <span className="public-account" title={accountName}>{accountName}</span>
          {onLogout && <button type="button" onClick={onLogout}>Cerrar sesión</button>}
        </div>
      ) : (
        <div className="public-session public-session--anonymous">
          <LoginButton className="public-login-button--header" onLogin={onLogin} busy={busy} disabled={loginDisabled} />
          <a className="public-register-button" href="/registro" aria-current={path === '/registro' ? 'page' : undefined}>Registrarse</a>
        </div>
      )}
    </header>
  );
}
