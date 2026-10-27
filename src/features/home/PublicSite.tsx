import HomePage from './pages/HomePage';
import SchedulingPage from './pages/SchedulingPage';
import type { PublicPageProps } from './types/home';
import RegistroPage from '../compras/RegistroPage';
import PublicHeader from './components/PublicHeader';

export default function PublicSite(props: PublicPageProps) {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  if (path === '/registro') return <RegistroPage {...props} />;
  if (path === '/catalogo') return <div className="public-page"><PublicHeader {...props}/><main className="tienda"><section className="panel registro-form"><h1>Catálogo de repuestos</h1><p>Para consultar productos y enviar solicitudes necesitas una cuenta @duocuc.cl o de un dominio onmicrosoft.com aprobada en Entra ID.</p><button className="btn primary" disabled={props.configurationMissing||props.loginDisabled||props.busy} onClick={()=>void props.onLogin?.()}>Iniciar sesión con Microsoft</button><a href="/registro">Solicitar mi registro</a></section></main></div>;

  if (path.startsWith('/agendamiento')) {
    return <SchedulingPage {...props} />;
  }

  return <HomePage {...props} />;
}
