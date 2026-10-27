import { useState, type FormEvent } from 'react';
import { registrosApi } from '../../api/comprasApi';
import PublicHeader from '../home/components/PublicHeader';
import type { PublicPageProps } from '../home/types/home';
import { normalizarCorreoPermitido } from '../../auth/correoPermitido';
import './compras.css';

interface RegistroProps extends PublicPageProps {
  correoAutenticado?: string;
  onLogout?: () => void | Promise<void>;
}

export default function RegistroPage({ correoAutenticado, onLogout, ...publico }: RegistroProps) {
  const [nombre, setNombre] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [terminado, setTerminado] = useState(false);
  const [error, setError] = useState('');
  const institucional = normalizarCorreoPermitido(correoAutenticado) !== undefined;

  async function solicitar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (enviando || !institucional || !correoAutenticado) return;
    if (!/^[\p{L} ]{3,120}$/u.test(nombre.trim())) {
      setError('Ingresa un nombre y apellido válidos.');
      return;
    }
    setEnviando(true);
    setError('');
    try {
      await registrosApi.solicitar({ nombre: nombre.trim(), correo: correoAutenticado });
      setTerminado(true);
    } catch {
      setError('No se pudo enviar la solicitud. Revisa tu sesión e inténtalo nuevamente.');
    } finally {
      setEnviando(false);
    }
  }

  return <div className="public-page">
    <PublicHeader {...publico} />
    <main className="tienda"><section className="panel registro-form">
      <h1>Solicita tu acceso</h1>
      <p>Se admiten correos @duocuc.cl y cuentas de dominios onmicrosoft.com autorizadas en Microsoft Entra ID. La persona responsable habilita manualmente el rol Cliente.</p>
      {!correoAutenticado ? <>
        <p>Primero inicia sesión con Microsoft. Tu cuenta debe estar habilitada para acceder a esta aplicación en Entra ID. No se admiten registros anónimos.</p>
        <button className="btn primary" disabled={publico.busy || publico.loginDisabled || publico.configurationMissing} onClick={() => void publico.onLogin?.()}>Iniciar sesión con Microsoft</button>
      </> : !institucional ? <p role="alert">Ingresa con una cuenta @duocuc.cl o de un dominio onmicrosoft.com autorizada en Entra ID.</p>
        : terminado ? <p role="status">Solicitud recibida. El acceso al catálogo se habilitará cuando la persona responsable de Entra ID asigne el rol Cliente. Después cierra sesión y vuelve a ingresar.</p>
        : <form onSubmit={evento => void solicitar(evento)} className="registro-form">
          <label>Nombre y apellido<input required minLength={3} maxLength={120} value={nombre} onChange={evento => setNombre(evento.target.value.replace(/[^\p{L} ]/gu, ''))} autoComplete="name" /></label>
          <label>Correo institucional autenticado<input type="email" value={correoAutenticado} readOnly /></label>
          <p>No pedimos ni almacenamos tu contraseña. El servidor toma tu correo del token de Microsoft.</p>
          {error && <p role="alert">{error}</p>}
          <button type="submit" className="btn primary" disabled={enviando}>{enviando ? 'Enviando…' : 'Solicitar acceso'}</button>
        </form>}
      {correoAutenticado && <button className="btn ghost" onClick={() => void onLogout?.()}>Cerrar sesión</button>}
      <a href="/">Volver al inicio</a>
    </section></main>
  </div>;
}
