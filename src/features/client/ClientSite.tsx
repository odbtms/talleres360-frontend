import type { Session } from '../../types';
import HomePage from '../home/pages/HomePage';
import SchedulingPage from '../home/pages/SchedulingPage';
import BookingPage from '../scheduling/pages/BookingPage';
import type { ServiceType } from '../scheduling/types/scheduling';
import MyReviewsPage from './pages/MyReviewsPage';

interface ClientSiteProps { session: Session; }

export default function ClientSite({ session }: ClientSiteProps) {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  if (path === '/mis-revisiones') return <MyReviewsPage session={session} />;
  if (path === '/agendamiento') return <SchedulingPage session={session} />;
  if (path === '/agendamiento/solicitud') {
    const requestedType = new URLSearchParams(window.location.search).get('tipo');
    const serviceType: ServiceType = requestedType === 'diagnostics' ? 'diagnostics' : 'maintenance';
    return <BookingPage session={session} serviceType={serviceType} />;
  }
  return <HomePage session={session} />;
}
