import { useEffect, useState, type ReactNode } from 'react';
import { useMsal } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';
import { isEntraConfigured, tokenRequest } from './authConfig';
import { obtenerToken } from './token';
import { setTokenProvider } from '../api/http';
import { rolesFromToken } from './roles';
import HomePage from '../features/home/pages/HomePage';
import type { Session } from '../types';

interface AuthGateProps {
  children: (session: Session) => ReactNode;
}

const errorMessage = (error: unknown) => (error instanceof Error ? error.message : String(error));

// Login real con Entra ID: sin cuenta muestra el login; con cuenta adjunta el token a cada request
function MsalAuthGate({ children }: AuthGateProps) {
  const { instance, accounts, inProgress } = useMsal();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [roles, setRoles] = useState<string[] | null>(null); // null = token aun no listo
  const account = accounts[0];

  useEffect(() => {
    if (!account) {
      setRoles(null);
      return undefined;
    }
    let active = true;
    setTokenProvider(async () => (await obtenerToken(instance, account)).accessToken);
    obtenerToken(instance, account)
      .then((result) => active && setRoles(rolesFromToken(result.accessToken)))
      .catch((e: unknown) => {
        if (!active) return;
        setError(errorMessage(e));
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
    } catch {
      setError('No se pudo iniciar sesión. Inténtalo nuevamente.');
    } finally {
      window.clearTimeout(visualTimeout);
      setBusy(false);
    }
  }

  if (!account) {
    return (
      <HomePage
        onLogin={login}
        busy={busy}
        loginDisabled={inProgress !== InteractionStatus.None && !busy}
        error={error}
      />
    );
  }
  // Se espera a registrar el token antes de montar la app, para que la primera llamada ya lo lleve
  if (roles === null) return null;

  return children({
    name: account.name || account.username,
    username: account.username,
    roles,
    logout: () => instance.logoutPopup({ account }),
  });
}

export default function AuthGate({ children }: AuthGateProps) {
  return isEntraConfigured ? <MsalAuthGate>{children}</MsalAuthGate> : <HomePage configurationMissing />;
}
