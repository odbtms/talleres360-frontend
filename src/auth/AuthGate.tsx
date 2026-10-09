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
      window.history.replaceState(null, '', '/');
    } catch {
      setError('No se pudo iniciar sesión. Inténtalo nuevamente.');
    } finally {
      window.clearTimeout(visualTimeout);
      setBusy(false);
    }
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
  if (!roles.some((role) => ['Admin', 'Operador', 'Cliente'].includes(role))) return <main className="reviews-page"><h1>No se pudo acceder a tu cuenta</h1><p role="alert">{error || 'Tu cuenta no tiene un rol habilitado para esta aplicación.'}</p><button className="btn primary" onClick={() => instance.logoutPopup({ account }).catch(() => setError('No se pudo cerrar la sesión. Inténtalo nuevamente.'))}>Cerrar sesión</button></main>;

  const session: Session = {
    name: account.name || account.username,
    username: account.username,
    roles,
    logout: () => instance.logoutPopup({ account }),
  };

  if (roles.includes('Cliente') && !roles.some((role) => role === 'Admin' || role === 'Operador')) {
    return <ClientSite session={session} />;
  }

  return children(session);
}

export default function AuthGate({ children }: AuthGateProps) {
  return isEntraConfigured ? <MsalAuthGate>{children}</MsalAuthGate> : <PublicSite configurationMissing />;
}
