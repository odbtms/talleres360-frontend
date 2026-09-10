import { createRoot } from 'react-dom/client';
import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { isEntraConfigured, msalConfig } from './auth/authConfig';
import AuthGate from './auth/AuthGate';
import App from './App';
import './styles.css';

// Como en el tutorial: no se llama a msal.initialize() a mano, MsalProvider se encarga
const msal = isEntraConfigured ? new PublicClientApplication(msalConfig) : null;

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

const app = <AuthGate>{(session) => <App session={session} />}</AuthGate>;

createRoot(rootElement).render(msal ? <MsalProvider instance={msal}>{app}</MsalProvider> : app);
