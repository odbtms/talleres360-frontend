import { useState, type FormEvent } from 'react';
import { registrosApi } from '../../api/comprasApi';
import PublicHeader from '../home/components/PublicHeader';
import type { PublicPageProps } from '../home/types/home';
import './compras.css';

export default function RegistroPage({ onLogin, busy, loginDisabled }: PublicPageProps) {
  const [nombre,setNombre]=useState(''); const [correo,setCorreo]=useState('');
  const [enviando,setEnviando]=useState(false); const [terminado,setTerminado]=useState(false); const [error,setError]=useState('');
  async function solicitar(e:FormEvent<HTMLFormElement>){e.preventDefault();if(enviando)return;
    if(!/^[\p{L} ]{3,120}$/u.test(nombre.trim())||!/^[-a-z0-9.!#$%&'*+/=?^_`{|}~]+@duocuc\.cl$/i.test(correo.trim())){setError('Ingresa tu nombre y un correo @duocuc.cl válido.');return;}
    setEnviando(true);setError('');try{await registrosApi.solicitar({nombre:nombre.trim(),correo:correo.trim().toLowerCase()});setTerminado(true);}
    catch{setError('No se pudo enviar el registro. Revisa tus datos e inténtalo más tarde.');}finally{setEnviando(false);}}
  return <div className="public-page"><PublicHeader onLogin={onLogin} busy={busy} loginDisabled={loginDisabled}/><main className="tienda"><section className="panel registro-form">
    <h1>Solicita tu registro</h1><p>Acceso exclusivo para correos @duocuc.cl. El administrador revisará tu solicitud y habilitará tu acceso en Microsoft Entra ID como Cliente.</p>
    {terminado?<><p role="status">Tu solicitud fue recibida. Esto no activa tu cuenta automáticamente. Cuando el administrador habilite tu acceso, ingresa con Microsoft usando el mismo correo institucional.</p><button className="btn primary" onClick={()=>void onLogin?.()}>Iniciar sesión con Microsoft</button></>
      :<form onSubmit={e=>void solicitar(e)} className="registro-form"><label>Nombre y apellido<input required minLength={3} maxLength={120} value={nombre} onChange={e=>setNombre(e.target.value.replace(/[^\p{L} ]/gu,''))} autoComplete="name"/></label>
        <label>Correo institucional<input required type="email" maxLength={150} value={correo} onChange={e=>setCorreo(e.target.value)} autoComplete="email" placeholder="nombre@duocuc.cl"/></label>
        <p>No te pedimos ni almacenamos tu contraseña. La autenticación se realiza con Microsoft.</p>{error&&<p role="alert">{error}</p>}<button type="submit" className="btn primary" disabled={enviando}>{enviando?'Enviando…':'Solicitar registro'}</button></form>}
    <a href="/">Volver al inicio</a></section></main></div>;
}
