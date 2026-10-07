import type { Session } from '../../types';
import HomePage from '../home/pages/HomePage';
import SchedulingPage from '../home/pages/SchedulingPage';
import MyReviewsPage from './pages/MyReviewsPage';

interface ClientSiteProps { session: Session; }

export default function ClientSite({ session }: ClientSiteProps) {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  if (path === '/mis-revisiones') return <MyReviewsPage session={session} />;
  if (path.startsWith('/agendamiento')) return <SchedulingPage session={session} />;
  return <HomePage session={session} />;
}
