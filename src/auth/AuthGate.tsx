import { useEffect, useState, type ReactNode } from 'react';
import { useMsal } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';
import { isEntraConfigured, tokenRequest } from './authConfig';
import { obtenerToken } from './token';
import { setTokenProvider } from '../api/http';
import { rolesFromToken } from './roles';
import PublicSite from '../features/home/PublicSite';
import ClientSite from '../features/client/ClientSite';
import type { Session } from '../types';
import RegistroPage from '../features/compras/SolicitarRegistroPage';
import { obtenerCorreoPermitido } from './correoPermitido';
import { obtenerCorreoRegistro } from './correoRegistro';

interface AuthGateProps {
  children: (session: Session) => ReactNode;
}

// Login real con Entra ID: sin cuenta muestra el login; con cuenta adjunta el token a cada request
function MsalAuthGate({ children }: AuthGateProps) {
  const { instance, accounts, inProgress } = useMsal();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [roles, setRoles] = useState<string[] | null>(null); // null = token aun no listo
  const account = accounts[0];

  useEffect(() => {
    if (!account) {
      setTokenProvider(async () => null);
      setRoles(null);
      return undefined;
    }
    let active = true;
    setTokenProvider(async () => (await obtenerToken(instance, account)).accessToken);
    obtenerToken(instance, account)
      .then((result) => active && setRoles(rolesFromToken(result.accessToken)))
      .catch(() => {
        if (!active) return;
        setError('No se pudo validar tu sesión. Cierra sesión e inténtalo nuevamente.');
        setRoles([]);
      });
    return () => {
      active = false;
      setTokenProvider(async () => null);
    };
  }, [instance, account]);

  async function login() {
    if (busy || inProgress !== InteractionStatus.None) return;

    setBusy(true);
    setError('');
    // El popup de MSAL puede tardar en notificar que fue cerrado. La interfaz
    // recupera su etiqueta normal sin permitir otro intento mientras MSAL siga ocupado.
    const visualTimeout = window.setTimeout(() => setBusy(false), 8000);
    try {
      await instance.loginPopup({ ...tokenRequest, prompt: 'select_account' });
      if (window.location.pathname.replace(/\/+$/, '') !== '/registro') window.history.replaceState(null, '', '/');
    } catch {
      setError('No se pudo iniciar sesión. Inténtalo nuevamente.');
    } finally {
      window.clearTimeout(visualTimeout);
      setBusy(false);
    }
  }

  const correo = obtenerCorreoPermitido(
    account?.idTokenClaims?.email,
    account?.idTokenClaims?.preferred_username,
    account?.idTokenClaims?.upn,
    account?.username,
  );
  const correoDuoc = obtenerCorreoRegistro(account?.idTokenClaims?.email, account?.idTokenClaims?.preferred_username, account?.idTokenClaims?.upn, account?.username);
  const registro = () => <RegistroPage onLogin={login} busy={busy} correoAutenticado={account && roles !== null ? correoDuoc || correo : undefined} onLogout={() => instance.logoutPopup({ account })} />;
  if (window.location.pathname.replace(/\/+$/,'') === '/registro') {
    if (account && roles === null) return <p role="status">Validando tu sesión…</p>;
    return registro();
  }
  if (!account) {
    return (
      <PublicSite
        onLogin={login}
        busy={busy}
        loginDisabled={inProgress !== InteractionStatus.None && !busy}
        error={error}
      />
    );
  }
  // Se espera a registrar el token antes de montar la app, para que la primera llamada ya lo lleve
  if (roles === null) return <p className="reviews-status" role="status">Validando tu sesión…</p>;
  if (!roles.some((role) => ['Admin', 'Operador', 'Cliente'].includes(role))) return registro();

  const session: Session = {
    name: account.name || account.username,
    username: account.username,
    roles,
    logout: () => instance.logoutPopup({ account }),
  };

  if (roles.includes('Cliente') && !roles.some((role) => role === 'Admin' || role === 'Operador')) {
    if (!correo) return <main className="reviews-page"><h1>Cuenta autorizada requerida</h1><p>Ingresa con una cuenta @duocuc.cl o de un dominio onmicrosoft.com habilitada como Cliente en Entra ID.</p><button className="btn primary" onClick={()=>void session.logout()}>Cerrar sesión</button></main>;
    session.username = correo;
  }
  const gestion = window.location.pathname === '/dashboard' || window.location.pathname.startsWith('/dashboard/');
  if (gestion && roles.some((role) => role === 'Admin' || role === 'Operador')) return children(session);
  return <ClientSite session={session} />;
}

export default function AuthGate({ children }: AuthGateProps) {
  return isEntraConfigured ? <MsalAuthGate>{children}</MsalAuthGate> : <PublicSite configurationMissing />;
}
