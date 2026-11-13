import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/current-user';
import { publicProducts,createOrder,payOrder,cancelOwnOrder,ownOrders,profile,saveProfile } from '@/lib/shop';
export const dynamic='force-dynamic';
export const runtime='nodejs';
type Context={params:Promise<{operation:string}>};
function failure(error:unknown) {
  const e=error as {status?:number;message?:string};
  return NextResponse.json({error:e.status?e.message:'No pudimos completar la operación. Intentá nuevamente.'},{status:e.status||500});
}
export async function GET(request:NextRequest,context:Context) {
  try {
    const {operation}=await context.params;
    if(operation==='catalog') return NextResponse.json(await publicProducts());
    const user=await getCurrentUser();
    if(operation==='orders') return NextResponse.json(await ownOrders(user,request.nextUrl.searchParams.get('id')||undefined));
    if(operation==='profile') return NextResponse.json(await profile(user));
    return NextResponse.json({error:'No encontrado'},{status:404});
  } catch(error) {return failure(error);}
}
export async function POST(request:NextRequest,context:Context) {
  if(request.headers.get('origin')!==request.nextUrl.origin) return NextResponse.json({error:'Origen inválido'},{status:403});
  try {
    const {operation}=await context.params;
    const input=await request.json();
    const user=await getCurrentUser();
    if(operation==='orders') return NextResponse.json({id:await createOrder(user,input.lines,input.address,input.key)});
    if(operation==='pay' && typeof input.id==='string' && typeof input.approved==='boolean') await payOrder(user,input.id,input.approved);
    else if(operation==='cancel' && typeof input.id==='string') await cancelOwnOrder(user,input.id,input.reason);
    else if(operation==='profile') await saveProfile(user,input.phone,input.address);
    else return NextResponse.json({error:'Solicitud inválida'},{status:400});
    return NextResponse.json({ok:true});
  } catch(error) {return failure(error);}
}
