import Link from 'next/link';
import { ClipboardList } from 'lucide-react';
export const metadata = { title: 'Mis pedidos · Food Store' };
export default function Page() { return <section className="inner-page"><h1>Mis pedidos</h1><div className="empty-state"><ClipboardList /><h2>Acá vas a encontrar tus pedidos</h2><p>Por ahora podés explorar los productos de ejemplo y armar tu carrito. La compra todavía no está disponible.</p><Link className="primary-button" href="/">Explorar la tienda</Link></div></section>; }
