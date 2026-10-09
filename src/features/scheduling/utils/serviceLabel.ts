export const serviceLabel = (type: string | null) => type === 'MAINTENANCE' || type === 'maintenance'
  ? 'Mantenciones y arreglos'
  : type === 'DIAGNOSTICS' || type === 'diagnostics' ? 'Diagnóstico' : 'Atención registrada por el taller';
