import { useCallback,useEffect,useState } from 'react';
import { registrosApi } from '../../api/comprasApi';
import type { SolicitudRegistro } from '../../types';
import { formatDate } from '../../utils/format';
export default function RegistrosPage(){const[datos,setDatos]=useState<SolicitudRegistro[]>([]);const[error,setError]=useState('');
  const cargar=useCallback(async()=>{try{setDatos(await registrosApi.listar());setError('');}catch{setError('No se pudieron cargar los registros.');}},[]);
  useEffect(()=>{void cargar();},[cargar]);
  return <main className="panel products-page"><h1>Solicitudes de registro</h1><p>Solicitudes recibidas, no cuentas verificadas. En Microsoft Entra ID invita o habilita el correo institucional en tu tenant y asigna el rol Cliente de la API. Recibir este formulario no concede acceso ni verifica la propiedad del buzón.</p>
    <p>La autorización se comprueba en el token emitido por Entra ID. Esta pantalla no asigna roles ni reemplaza la aprobación en Azure.</p><button className="btn primary" onClick={()=>void cargar()}>Actualizar</button>
    {error&&<p role="alert">{error}</p>}<div className="table-wrap"><table><thead><tr><th>Nombre</th><th>Correo solicitado</th><th>Recibida</th></tr></thead><tbody>{datos.map(d=><tr key={d.correo}><td>{d.nombre}</td><td>{d.correo}</td><td>{formatDate(d.creadaEn)}</td></tr>)}</tbody></table></div>{!datos.length&&!error&&<p>No hay solicitudes registradas.</p>}</main>;
}
