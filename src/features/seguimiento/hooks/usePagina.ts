import { useEffect, useState } from 'react';
import type { Pagina } from '../types';
import { ErrorApi } from '../../../api/http';

/** Cancela lecturas anteriores para que cambiar filtros no reemplace datos con respuestas antiguas. */
export function usePagina<T>(cargar: (signal: AbortSignal) => Promise<Pagina<T>>, mensajeError: string, intervalo = 0) {
  const [datos, setDatos] = useState<Pagina<T> | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setCargando(true);
    setError('');
    setDatos(null);
    let temporizador: number | undefined;
    const consultar = async () => {
      try {
        const resultado = await cargar(controller.signal);
        if (!controller.signal.aborted) { setDatos(resultado); setError(''); }
      } catch (error) {
        if (!controller.signal.aborted) setError(error instanceof ErrorApi ? error.message : mensajeError);
      } finally {
        if (!controller.signal.aborted) {
          setCargando(false);
          // El próximo sondeo espera a que termine el actual: no se solapan consultas.
          if (intervalo > 0) temporizador = window.setTimeout(() => void consultar(), intervalo);
        }
      }
    };
    void consultar();
    return () => { controller.abort(); window.clearTimeout(temporizador); };
  }, [cargar, mensajeError, revision, intervalo]);
  return { datos, cargando, error, actualizar: () => setRevision((valor) => valor + 1) };
}
