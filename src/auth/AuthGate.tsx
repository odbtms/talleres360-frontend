import { useEffect, useState, type ReactNode } from 'react';
import { useMsal } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';
import { isEntraConfigured, tokenRequest } from './authConfig';
import { obtenerToken } from './token';
import { setTokenProvider } from '../api/http';
import { rolesFromToken } from './roles';
import LoginPage from './LoginPage';
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
    setBusy(true);
    setError('');
    try {
      await instance.loginPopup({ ...tokenRequest, prompt: 'select_account' });
    } catch (e: unknown) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  if (!account) {
    return <LoginPage onLogin={login} busy={busy || inProgress !== InteractionStatus.None} error={error} />;
  }
  // Se espera a registrar el token antes de montar la app, para que la primera llamada ya lo lleve
  if (roles === null) return null;

  return children({
    name: account.name || account.username,
    username: account.username,
    roles,
    mode: 'entra',
    logout: () => instance.logoutPopup({ account }),
  });
}

const LOCAL_SESSION_KEY = 'talleres360.localSession';

function readLocalSession() {
  try {
    return sessionStorage.getItem(LOCAL_SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

// Sin IDs de Entra ID: login simulado para poder seguir desarrollando
function LocalAuthGate({ children }: AuthGateProps) {
  const [active, setActive] = useState(readLocalSession);

  function setSession(value: boolean) {
    try {
      if (value) sessionStorage.setItem(LOCAL_SESSION_KEY, '1');
      else sessionStorage.removeItem(LOCAL_SESSION_KEY);
    } catch {
      // sessionStorage bloqueado: la sesion dura solo mientras la pagina este abierta
    }
    setActive(value);
  }

  if (!active) return <LoginPage localMode onLocalLogin={() => setSession(true)} />;

  return children({
    name: 'Modo local',
    username: 'sin autenticación',
    roles: ['Admin'],
    mode: 'local',
    logout: async () => setSession(false),
  });
}

export default function AuthGate({ children }: AuthGateProps) {
  return isEntraConfigured ? <MsalAuthGate>{children}</MsalAuthGate> : <LocalAuthGate>{children}</LocalAuthGate>;
}
