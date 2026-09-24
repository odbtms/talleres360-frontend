const tenantId = import.meta.env.VITE_ENTRA_TENANT_ID;
const spaClientId = import.meta.env.VITE_SPA_CLIENT_ID;
const apiClientId = import.meta.env.VITE_API_CLIENT_ID;

// Sin los tres IDs la aplicación muestra un error de configuración y no permite iniciar sesión.
export const isEntraConfigured = Boolean(tenantId && spaClientId && apiClientId);

export const msalConfig: Configuration = {
  auth: {
    clientId: spaClientId as string,
    authority: `https://login.microsoftonline.com/${tenantId}`,
    redirectUri: `${window.location.origin}/redirect.html`,
    postLogoutRedirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'sessionStorage',
  },
};

export const tokenRequest: PopupRequest = {
  scopes: [`api://${apiClientId}/access_as_user`],
};
import type { Configuration, PopupRequest } from '@azure/msal-browser';

