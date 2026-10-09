import { useEffect, useState } from 'react';
import type { Pagina } from '../types';

/** Cancela lecturas anteriores para que cambiar filtros no reemplace datos con respuestas antiguas. */
export function usePagina<T>(cargar: (signal: AbortSignal) => Promise<Pagina<T>>, mensajeError: string) {
  const [datos, setDatos] = useState<Pagina<T> | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setCargando(true);
    setError('');
    setDatos(null);
    cargar(controller.signal).then((resultado) => {
      if (!controller.signal.aborted) setDatos(resultado);
    }).catch(() => {
      if (!controller.signal.aborted) setError(mensajeError);
    }).finally(() => {
      if (!controller.signal.aborted) setCargando(false);
    });
    return () => controller.abort();
  }, [cargar, mensajeError, revision]);
  return { datos, cargando, error, actualizar: () => setRevision((valor) => valor + 1) };
}
