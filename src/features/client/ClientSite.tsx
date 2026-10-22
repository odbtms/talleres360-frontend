import type { Session } from '../../types';
import HomePage from '../home/pages/HomePage';
import SchedulingPage from '../home/pages/SchedulingPage';
import MyReviewsPage from './pages/MyReviewsPage';
import PublicHeader from '../home/components/PublicHeader';
import NotificacionesPage from '../seguimiento/pages/NotificacionesPage';
import ComprasPage from '../compras/ComprasPage';

interface ClientSiteProps { session: Session; }

export default function ClientSite({ session }: ClientSiteProps) {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  if (path === '/' || path === '/catalogo') return <ComprasPage session={session} />;
  if (path === '/mis-solicitudes') return <ComprasPage session={session} solicitudes />;
  if (path === '/notificaciones') return <div className="public-page">
    <PublicHeader accountName={session.name} onLogout={session.logout} showClientNavigation />
    <NotificacionesPage session={session} />
  </div>;
  if (path === '/mis-revisiones') return <MyReviewsPage session={session} />;
  if (path.startsWith('/agendamiento')) return <SchedulingPage session={session} />;
  return <HomePage session={session} />;
}
