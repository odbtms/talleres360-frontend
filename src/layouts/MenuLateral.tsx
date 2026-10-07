import BrandLogo from '../features/home/components/BrandLogo';
import { OPCIONES_GESTION } from '../constants/navegacionGestion';
import type { DestinoGestion } from '../types/gestion';

interface MenuLateralProps {
  roles: string[];
  destinoActivo: DestinoGestion;
  abierto: boolean;
  onNavegar: (destino: DestinoGestion) => void;
}

export default function MenuLateral({ roles, destinoActivo, abierto, onNavegar }: MenuLateralProps) {
  const opciones = OPCIONES_GESTION.filter((opcion) => opcion.id !== 'new-order' && opcion.roles.some((rol) => roles.includes(rol)));

  return (
    <aside id="menu-gestion" className={`management-sidebar${abierto ? ' is-open' : ''}`}>
      <div className="management-sidebar__brand">
        <BrandLogo />
        <div><strong>Talleres360</strong><span>Panel de gestión</span></div>
      </div>
      <nav className="management-navigation" aria-label="Navegación del panel de gestión">
        <p className="management-navigation__label">Menú principal</p>
        {opciones.map((opcion) => (
          <button
            key={opcion.id}
            type="button"
            className={`management-navigation__item${destinoActivo === opcion.id ? ' is-active' : ''}`}
            aria-current={destinoActivo === opcion.id ? 'page' : undefined}
            onClick={() => onNavegar(opcion.id)}
          >
            <strong>{opcion.etiqueta}</strong>
            <span>{opcion.descripcion}</span>
          </button>
        ))}
      </nav>
      <p className="management-sidebar__footer">{roles.includes('Admin') ? 'Administración' : 'Operación del taller'}</p>
    </aside>
  );
}
