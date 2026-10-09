interface Props { pagina: number; totalPaginas: number; total: number; onCambiar: (pagina: number) => void; }

export default function Paginacion({ pagina, totalPaginas, total, onCambiar }: Props) {
  return <nav className="seguimiento-paginacion" aria-label="Paginación de resultados">
    <span>{total} registros · Página {totalPaginas ? pagina + 1 : 0} de {totalPaginas}</span>
    <div className="actions">
      <button className="btn ghost" type="button" disabled={pagina === 0} onClick={() => onCambiar(pagina - 1)}>Anterior</button>
      <button className="btn ghost" type="button" disabled={pagina + 1 >= totalPaginas} onClick={() => onCambiar(pagina + 1)}>Siguiente</button>
    </div>
  </nav>;
}
