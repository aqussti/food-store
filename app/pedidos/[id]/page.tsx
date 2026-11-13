import { OrdersView } from '@/components/orders-view';
export default async function Page({params}:{params:Promise<{id:string}>}){return <OrdersView id={(await params).id}/>;}
