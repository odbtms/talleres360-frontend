import { useEffect, useRef, useState } from 'react';
import { reportsApi, type SalesReport } from '../../../api/reportsApi';
import { rangoParaApi, type RangoReporte } from '../utils/fechasReporte';

interface ResultadoReporte {
  datos: SalesReport;
  desde: string;
  hasta: string;
  generadoEn: string;
}

interface EstadoReporteVentas {
  resultado: ResultadoReporte | null;
  cargando: boolean;
  error: string;
  generarReporte: (desde: string, hasta: string) => Promise<void>;
}

export function useReporteVentas(): EstadoReporteVentas {
  const [resultado, setResultado] = useState<ResultadoReporte | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const activo = useRef(true);
  const enCurso = useRef(false);

  useEffect(() => {
    activo.current = true;
    return () => { activo.current = false; };
  }, []);

  async function generarReporte(desde: string, hasta: string): Promise<void> {
    if (enCurso.current) return;
    setError('');
    setResultado(null);
    let rango: RangoReporte;
    try {
      rango = rangoParaApi(desde, hasta);
    } catch (problema: unknown) {
      setError(problema instanceof Error ? problema.message : 'Revisa las fechas del reporte.');
      return;
    }
    enCurso.current = true;
    setCargando(true);
    try {
      const datos = await reportsApi.sales(rango.desde, rango.hasta);
      if (activo.current) setResultado({ datos, desde, hasta, generadoEn: new Date().toISOString() });
    } catch {
      if (activo.current) setError('No pudimos generar el reporte. Inténtalo nuevamente.');
    } finally {
      enCurso.current = false;
      if (activo.current) setCargando(false);
    }
  }

  return { resultado, cargando, error, generarReporte };
}
