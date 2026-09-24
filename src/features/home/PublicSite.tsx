import HomePage from './pages/HomePage';
import SchedulingPage from './pages/SchedulingPage';
import LoginRequiredPage from '../scheduling/pages/LoginRequiredPage';
import type { PublicPageProps } from './types/home';

export default function PublicSite(props: PublicPageProps) {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';

  if (path === '/agendamiento') {
    return <SchedulingPage {...props} />;
  }

  if (path === '/agendamiento/solicitud') {
    return <LoginRequiredPage {...props} />;
  }

  return <HomePage {...props} />;
}
