export const TALLER = { id: 1, name: 'Talleres360' } as const;

// Los IDs anteriores se muestran únicamente como datos históricos, no como sedes activas.
export const workshopLabel = (id: number) => id === TALLER.id ? TALLER.name : `Taller histórico #${id}`;
