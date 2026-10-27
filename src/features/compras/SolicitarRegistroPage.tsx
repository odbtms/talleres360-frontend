import { useEffect, useState, type FormEvent } from 'react';
import { registrosApi } from '../../api/comprasApi';
import { ErrorApi } from '../../api/http';
import { correoRegistro } from '../../auth/correoRegistro';
import PublicHeader from '../home/components/PublicHeader';
import type { PublicPageProps } from '../home/types/home';
import './compras.css';

interface RegistroProps extends PublicPageProps {
  correoAutenticado?: string;
  onLogout?: () => void | Promise<void>;
}

function borrador(): { nombre: string; correo: string } {
  try {
    const dato = JSON.parse(sessionStorage.getItem('talleres360-registro-borrador') || '{}');
    return { nombre: typeof dato.nombre === 'string' ? dato.nombre.slice(0, 120) : '', correo: correoRegistro(dato.correo) || '' };
  } catch { return { nombre: '', correo: '' }; }
}

export default function SolicitarRegistroPage({ correoAutenticado, onLogout, ...publico }: RegistroProps) {
  const [nombre, setNombre] = useState(() => borrador().nombre);
  const [correo, setCorreo] = useState(() => borrador().correo);
  const [enviando, setEnviando] = useState(false);
  const [terminado, setTerminado] = useState(false);
  const [error, setError] = useState('');
  const correoSesion = correoRegistro(correoAutenticado);
  useEffect(() => { if (correoSesion) setCorreo(correoSesion); }, [correoSesion]);
  async function solicitar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (enviando || publico.busy) return;
    setError('');
    const normalizado = correoRegistro(correo);
    if (!normalizado) { setError('Ingresa un correo válido terminado exactamente en @duocuc.cl.'); return; }
    const nombreValido = nombre.normalize('NFC').trim();
    if (!/^[\p{L} ]{3,120}$/u.test(nombreValido)) { setError('Ingresa tu nombre y apellido, usando solo letras y espacios.'); return; }
    if (!correoAutenticado) {
      try { sessionStorage.setItem('talleres360-registro-borrador', JSON.stringify({ nombre: nombreValido, correo: normalizado })); }
      catch { /* La autenticación funciona aunque el almacenamiento esté bloqueado. */ }
      await publico.onLogin?.(); return;
    }
    if (!correoSesion || normalizado !== correoSesion) { setError('Debes autenticarte con la misma cuenta @duocuc.cl que solicita el acceso.'); return; }
    setEnviando(true);
    try {
      await registrosApi.solicitar({ nombre: nombreValido, correo: correoSesion });
      try { sessionStorage.removeItem('talleres360-registro-borrador'); } catch { /* Sin almacenamiento. */ }
      setTerminado(true);
    } catch (e) { setError(e instanceof ErrorApi ? e.message : 'No se pudo guardar la solicitud. Inténtalo nuevamente.'); }
    finally { setEnviando(false); }
  }
  return <div className="public-page"><PublicHeader {...publico} />
    <main className="tienda"><section className="panel registro-form">
      <h1>Solicita tu registro como cliente</h1>
      <p>Este formulario admite únicamente cuentas <strong>@duocuc.cl</strong>. No solicita ni guarda contraseñas.</p>
      <p>El envío es privado: tu cuenta debe poder iniciar sesión en este tenant de Microsoft Entra ID, aunque todavía no tenga el rol Cliente. Si Microsoft rechaza tu cuenta, contacta primero al encargado de Entra para que la agregue o invite.</p>
      {terminado ? <div role="status"><h2>Solicitud recibida</h2><p>Quedó guardada en Registros de Talleres360. El encargado revisará tu solicitud y asignará manualmente el rol Cliente en Entra ID. Después deberás cerrar sesión y volver a ingresar.</p><p>El formulario no crea cuentas ni aprobaciones automáticas en Azure.</p></div> : <form onSubmit={evento => void solicitar(evento)} className="registro-campos">
        <label>Nombre y apellido<input required minLength={3} maxLength={120} autoComplete="name" value={nombre} onChange={e => setNombre(e.target.value.normalize('NFC').replace(/[^\p{L} ]/gu, ''))} /></label>
        <label>Correo Duoc<input required type="email" maxLength={150} autoComplete="email" placeholder="nombre@duocuc.cl" value={correo} readOnly={Boolean(correoSesion)} onChange={e => setCorreo(e.target.value)} /></label>
        {correoAutenticado && !correoSesion && <p role="alert">La cuenta actual no es @duocuc.cl. Cambia de cuenta para enviar este registro. Las cuentas onmicrosoft.com ya habilitadas pueden iniciar sesión normalmente, pero no solicitar alta mediante este formulario.</p>}
        {error && <p className="field-error" role="alert">{error}</p>}
        <button className="btn primary" type="submit" disabled={enviando || publico.busy || publico.loginDisabled || publico.configurationMissing || Boolean(correoAutenticado && !correoSesion)}>{enviando ? 'Enviando…' : correoAutenticado ? 'Enviar solicitud de registro' : 'Autenticarse para enviar'}</button>
      </form>}
      {correoAutenticado && <button className="btn ghost" onClick={() => void onLogout?.()}>Cerrar sesión / cambiar cuenta</button>}
      <a href="/">Volver al inicio</a>
    </section></main>
  </div>;
}
