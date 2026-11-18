import type { ProductoKpi, TiempoDia, VentasDia } from '../../../api/reportsApi';
import { formatMinutes, formatMoney } from '../../../utils/format';

interface Barra {
  id: string | number;
  etiqueta: string;
  cantidad: number;
  valor: string;
}

const fechaBreve = new Intl.DateTimeFormat('es-CL', {
  day: 'numeric', month: 'short', timeZone: 'UTC',
});
const numero = new Intl.NumberFormat('es-CL');

function dia(fecha: string) {
  return fechaBreve.format(new Date(`${fecha}T00:00:00Z`));
}

function GraficoBarras({ titulo, filas, vacio }: {
  titulo: string; filas: readonly Barra[]; vacio: string;
}) {
  const maximo = filas.reduce((max, fila) => Math.max(max, fila.cantidad), 1);
  return (
    <section className="panel kpi-chart" aria-label={titulo}>
      <h2>{titulo}</h2>
      {filas.length === 0 ? <p className="muted">{vacio}</p> : (
        <ul className="kpi-chart__serie">
          {filas.map(fila => (
            <li key={fila.id}>
              <span>{fila.etiqueta}</span>
              <strong>{fila.valor}</strong>
              <span className="kpi-chart__pista" aria-hidden="true">
                <span style={{ inlineSize: `${fila.cantidad / maximo * 100}%` }} />
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function SalesChartComponent({ datos }: { datos: readonly VentasDia[] }) {
  return <GraficoBarras titulo="Ventas por día" vacio="No hay entregas en este período."
    filas={datos.map(venta => ({
      id: venta.fecha, etiqueta: dia(venta.fecha), cantidad: venta.monto,
      valor: `${formatMoney(venta.monto)} · ${numero.format(venta.entregas)} ${venta.entregas === 1 ? 'entrega' : 'entregas'}`,
    }))} />;
}

export function LeadTimeChartComponent({ datos }: { datos: readonly TiempoDia[] }) {
  return <GraficoBarras titulo="Tiempo de entrega por día"
    vacio="No hay entregas con su evento de creación en el historial."
    filas={datos.map(tiempo => ({
      id: tiempo.fecha, etiqueta: dia(tiempo.fecha), cantidad: tiempo.promedioMinutos,
      valor: `${formatMinutes(tiempo.promedioMinutos)} · ${numero.format(tiempo.entregasMedidas)} ${tiempo.entregasMedidas === 1 ? 'entrega' : 'entregas'}`,
    }))} />;
}

export function TopProductsChartComponent({ datos }: { datos: readonly ProductoKpi[] }) {
  return <GraficoBarras titulo="Productos más vendidos" vacio="No hay productos registrados en las entregas del período."
    filas={datos.map(producto => ({
      id: producto.productoId, etiqueta: producto.nombre, cantidad: producto.unidades,
      valor: `${numero.format(producto.unidades)} ${producto.unidades === 1 ? 'unidad' : 'unidades'}`,
    }))} />;
}
