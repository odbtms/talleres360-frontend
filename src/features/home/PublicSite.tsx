import HomePage from './pages/HomePage';
import SchedulingPage from './pages/SchedulingPage';
import type { PublicPageProps } from './types/home';

export default function PublicSite(props: PublicPageProps) {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';

  if (path.startsWith('/agendamiento')) {
    return <SchedulingPage {...props} />;
  }

  return <HomePage {...props} />;
}
