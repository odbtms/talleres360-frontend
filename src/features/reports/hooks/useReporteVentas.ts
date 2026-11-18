import { useEffect, useState } from 'react';
import { reportsApi, type ReporteKpis } from '../../../api/reportsApi';
import { rangoParaApi, type RangoReporte } from '../utils/fechasReporte';

interface ResultadoReporte {
  datos: ReporteKpis;
  desde: string;
  hasta: string;
  generadoEn: string;
}

interface ConsultaReporte {
  rango: RangoReporte;
  desde: string;
  hasta: string;
}

export function useReporteVentas(desdeInicial: string, hastaInicial: string) {
  const [consulta, setConsulta] = useState<ConsultaReporte>(() => ({
    rango: rangoParaApi(desdeInicial, hastaInicial), desde: desdeInicial, hasta: hastaInicial,
  }));
  const [resultado, setResultado] = useState<ResultadoReporte | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [errorFechas, setErrorFechas] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    let siguiente: number | undefined;
    const { rango, desde, hasta } = consulta;
    async function actualizar() {
      try {
        const datos = await reportsApi.kpis(rango.desde, rango.hasta, controller.signal);
        if (controller.signal.aborted) return;
        setResultado({ datos, desde, hasta, generadoEn: new Date().toISOString() });
        setError('');
      } catch {
        if (!controller.signal.aborted) setError('No pudimos actualizar los indicadores de ventas.');
      } finally {
        if (!controller.signal.aborted) {
          setCargando(false);
          siguiente = window.setTimeout(() => void actualizar(), 10000);
        }
      }
    }
    void actualizar();
    return () => { controller.abort(); window.clearTimeout(siguiente); };
  }, [consulta]);

  function generarReporte(desde: string, hasta: string) {
    try {
      const rango = rangoParaApi(desde, hasta);
      setErrorFechas('');
      setError('');
      setResultado(null);
      setCargando(true);
      setConsulta({ rango, desde, hasta });
    } catch (problema) {
      setErrorFechas(problema instanceof Error ? problema.message : 'Revisa las fechas del reporte.');
    }
  }

  return { resultado, cargando, error, errorFechas, generarReporte };
}
