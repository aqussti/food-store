'use client';
import { useRef,useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStore } from './store-provider';
import { money } from '@/lib/catalog';
export async function shopRequest(operation:string,body?:unknown) {
  const r=await fetch('/api/store/'+operation,{method:body?'POST':'GET',headers:body?{'Content-Type':'application/json'}:undefined,body:body?JSON.stringify(body):undefined});
  const data=await r.json(); if(!r.ok) throw new Error(data.error||'No pudimos completar la operación.'); return data;
}
export function Checkout({subtotal}:{subtotal:number}) {
  const {cart,address,clearCart}=useStore(); const router=useRouter();
  const [busy,setBusy]=useState(false); const [error,setError]=useState('');
  const attempt=useRef<{signature:string;key:string}|null>(null);
  return <form className="stack-form" onSubmit={async e=>{e.preventDefault();setBusy(true);setError('');const destination=String(new FormData(e.currentTarget).get('address')); const signature=JSON.stringify([cart,destination]);if(attempt.current?.signature!==signature)attempt.current={signature,key:crypto.randomUUID()};try{const result=await shopRequest('orders',{lines:cart,address:destination,key:attempt.current.key});clearCart();router.push('/pedidos/'+result.id);}catch(err){setError((err as Error).message);}finally{setBusy(false);}}}>
    <label htmlFor="checkout-address">Dirección de entrega</label><input key={address} id="checkout-address" name="address" required minLength={5} maxLength={180} defaultValue={address}/>
    <p>Envío fijo: {money(150000)}</p><strong>Total: {money(subtotal+150000)}</strong><p className="muted">El pedido se registra pendiente. El stock baja al aprobar el pago simulado.</p>
    <button disabled={busy} className="primary-button">{busy?'Registrando…':'Crear pedido'}</button>{error&&<p role="alert" className="form-error">{error} <Link href="/ingresar">Ingresar a mi cuenta</Link></p>}
  </form>;
}
