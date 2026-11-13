'use client';
import { useEffect,useState } from 'react';
import { shopRequest } from './checkout';
import { useStore } from './store-provider';
export function ProfileForm(){
  const [value,setValue]=useState<{phone:string;address:string}|null>(null);const [message,setMessage]=useState('');const [busy,setBusy]=useState(false);const {saveAddress}=useStore();
  useEffect(()=>{shopRequest('profile').then(setValue).catch(e=>setMessage(e.message));},[]);
  return <section><h2>Mis datos de entrega</h2>{value&&<form className="stack-form" onSubmit={async e=>{e.preventDefault();setBusy(true);setMessage('');const f=new FormData(e.currentTarget);try{await shopRequest('profile',{phone:f.get('phone'),address:f.get('address')});saveAddress(String(f.get('address')));setMessage('Datos guardados.');}catch(e){setMessage((e as Error).message);}finally{setBusy(false);}}}><label htmlFor="profile-phone">Teléfono</label><input id="profile-phone" name="phone" type="tel" maxLength={30} defaultValue={value.phone}/><label htmlFor="profile-address">Dirección</label><input id="profile-address" name="address" maxLength={180} defaultValue={value.address}/><button className="primary-button" disabled={busy}>Guardar mis datos</button><p className="muted">Tu correo no se puede cambiar.</p></form>}<p role="status">{message}</p></section>;
}
