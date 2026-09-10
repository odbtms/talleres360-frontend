import { InteractionRequiredAuthError } from '@azure/msal-browser';
import { tokenRequest } from './authConfig';

// Token de api-fullstack desde la cache; si expiro o requiere interaccion, abre popup
export async function obtenerToken(instance, account) {
  const request = { ...tokenRequest, account };
  return instance.acquireTokenSilent(request).catch((error) => {
    if (error instanceof InteractionRequiredAuthError) {
      return instance.acquireTokenPopup(request);
    }
    throw error;
  });
}
