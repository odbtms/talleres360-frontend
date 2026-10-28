import type { Session } from '../../types';
import HomePage from '../home/pages/HomePage';
import SchedulingPage from '../home/pages/SchedulingPage';
import PublicHeader from '../home/components/PublicHeader';
import NotificacionesPage from '../seguimiento/pages/NotificacionesPage';
import CatalogoPage from '../compras/CatalogoPage';
import MisSolicitudesPage from '../compras/MisSolicitudesPage';

interface ClientSiteProps { session: Session; }

export default function ClientSite({ session }: ClientSiteProps) {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  const cliente = session.roles.includes('Cliente') && !session.roles.some(r => r === 'Admin' || r === 'Operador');
  if (path === '/catalogo') return <CatalogoPage session={session} />;
  if (path === '/mis-solicitudes' || (path === '/mis-revisiones' && cliente)) return <MisSolicitudesPage session={session} />;
  if (path === '/notificaciones' && cliente) return <div className="public-page">
    <PublicHeader accountName={session.name} onLogout={session.logout} roles={session.roles} showClientNavigation />
    <NotificacionesPage session={session} />
  </div>;
  if (path.startsWith('/agendamiento') && cliente) return <SchedulingPage session={session} />;
  return <HomePage session={session} />;
}
