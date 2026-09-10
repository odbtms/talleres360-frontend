import { useEffect, useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';
import { isEntraConfigured, tokenRequest } from './authConfig';
import { obtenerToken } from './token';
import { setTokenProvider } from '../api/http';
import LoginPage from './LoginPage';

const errorMessage = (error) => (error instanceof Error ? error.message : String(error));

// Login real con Entra ID: sin cuenta muestra el login; con cuenta adjunta el token a cada request
function MsalAuthGate({ children }) {
  const { instance, accounts, inProgress } = useMsal();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [tokenReady, setTokenReady] = useState(false);
  const account = accounts[0];

  useEffect(() => {
    if (!account) {
      setTokenReady(false);
      return undefined;
    }
    setTokenProvider(async () => (await obtenerToken(instance, account)).accessToken);
    setTokenReady(true);
    return () => setTokenProvider(async () => null);
  }, [instance, account]);

  async function login() {
    setBusy(true);
    setError('');
    try {
      await instance.loginPopup({ ...tokenRequest, prompt: 'select_account' });
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  if (!account) {
    return <LoginPage onLogin={login} busy={busy || inProgress !== InteractionStatus.None} error={error} />;
  }
  // Se espera a registrar el token antes de montar la app, para que la primera llamada ya lo lleve
  if (!tokenReady) return null;

  return children({
    name: account.name || account.username,
    username: account.username,
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
function LocalAuthGate({ children }) {
  const [active, setActive] = useState(readLocalSession);

  function setSession(value) {
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
    mode: 'local',
    logout: async () => setSession(false),
  });
}

export default function AuthGate({ children }) {
  return isEntraConfigured ? <MsalAuthGate>{children}</MsalAuthGate> : <LocalAuthGate>{children}</LocalAuthGate>;
}
