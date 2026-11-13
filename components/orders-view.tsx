'use client';
import Link from 'next/link';
import { useEffect,useState } from 'react';
import { money } from '@/lib/catalog';
import { shopRequest } from './checkout';
type Order={id:string;status:string;created_at:string;total_cents:number;shipping_cents:number;shipping_address:string;items:{id:string;product_name:string;unit_price_cents:number;quantity:number;line_total_cents:number}[];history:{to_status:string;name:string;created_at:string;reason:string|null}[]};
const label=(value:string)=>value.replaceAll('_',' ');
export function OrdersView({id}:{id?:string}) {
  const [orders,setOrders]=useState<Order[]>([]);const [error,setError]=useState('');const [message,setMessage]=useState('');const [loading,setLoading]=useState(true);const [busy,setBusy]=useState(false);
  async function refresh(){try{setOrders(await shopRequest('orders'+(id?'?id='+encodeURIComponent(id):'')));}catch(e){setError((e as Error).message);}finally{setLoading(false);}}
  useEffect(()=>{void refresh();},[id]);
  async function act(operation:string,body:unknown){setBusy(true);setError('');setMessage('');try{await shopRequest(operation,body);setMessage(operation==='pay' && !(body as {approved:boolean}).approved?'Pago rechazado. El pedido sigue pendiente; podés reintentar.':'Operación realizada.');await refresh();}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
  return <section className="inner-page"><h1>{id?'Tu pedido':'Mis pedidos'}</h1>{loading&&<p>Cargando pedidos…</p>}{error&&<p role="alert" className="form-error">{error} <Link href="/ingresar">Ingresar</Link></p>}{message&&<p role="status" className="notice">{message}</p>}{!loading&&!error&&!orders.length&&<p>Todavía no hiciste pedidos. <Link href="/">Explorar la tienda</Link></p>}
    {orders.map(order=><article key={order.id} className="account-card order-card"><h2>Pedido {order.id.slice(0,8)}</h2><span className="tag">{label(order.status)}</span><p>{new Date(order.created_at).toLocaleString('es-AR')}</p>{!id?<><strong>{money(order.total_cents)}</strong><Link className="secondary-button" href={'/pedidos/'+order.id}>Ver detalle</Link></>:<>
      <ul>{order.items.map(item=><li key={item.id}>{item.quantity} × {item.product_name} — {money(item.unit_price_cents)} c/u · {money(item.line_total_cents)}</li>)}</ul><p>Entrega: {order.shipping_address}</p><p>Envío: {money(order.shipping_cents)}</p><strong>Total: {money(order.total_cents)}</strong>
      {order.status==='pendiente'&&<><h3>Pago simulado</h3><p>No se cobra dinero ni se solicitan tarjetas.</p><div className="account-links"><button className="primary-button" disabled={busy} onClick={()=>act('pay',{id:order.id,approved:true})}>Aprobar pago</button><button className="secondary-button" disabled={busy} onClick={()=>act('pay',{id:order.id,approved:false})}>Rechazar pago</button></div><form className="stack-form" onSubmit={e=>{e.preventDefault();void act('cancel',{id:order.id,reason:String(new FormData(e.currentTarget).get('reason'))});}}><label htmlFor="cancel-reason">Motivo de cancelación</label><input id="cancel-reason" name="reason" required maxLength={500}/><button className="secondary-button" disabled={busy}>Cancelar pedido</button></form></>}
      <h3>Historial</h3><ol>{order.history.map((entry,index)=><li key={index}>{label(entry.to_status)} · {entry.name} · {new Date(entry.created_at).toLocaleString('es-AR')}{entry.reason&&` · ${entry.reason}`}</li>)}</ol><Link href="/pedidos">Ver todos mis pedidos</Link>
    </>}</article>)}
  </section>;
}
