'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, type FormEvent, type ReactNode } from 'react';
import { Bell, ShoppingCart, Search, ChevronDown, House, ClipboardList, UserRound, MapPin, ArrowRight } from 'lucide-react';
import { useStore } from './store-provider';
import { Sheet } from './sheet';

export function StoreShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { cart, address, saveAddress, storageWarning } = useStore();
  const [sheet, setSheet] = useState<'address' | 'notifications' | null>(null);
  const count = cart.reduce((total, line) => total + line.quantity, 0);
  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = new FormData(event.currentTarget).get('q')?.toString().trim() || '';
    router.push(value ? `/?q=${encodeURIComponent(value)}` : '/');
  }
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return <div className="admin-route">{children}</div>;
  return <div className="app-frame">
    <a className="skip-link" href="#contenido">Ir al contenido</a>
    <header className="store-header">
      <div className="header-top">
        <button className="address-button" type="button" onClick={() => setSheet('address')} aria-label={address ? `Dirección: ${address}. Cambiar` : 'Agregar dirección de entrega'}><span>{address || 'Tu dirección'}</span><ChevronDown size={17} /></button>
        <div className="header-actions"><button className="icon-button" aria-label="Notificaciones" onClick={() => setSheet('notifications')}><Bell /></button><Link className="icon-button cart-link" href="/carrito" aria-label={`Carrito, ${count} productos`}><ShoppingCart />{count > 0 && <span className="cart-badge">{count > 99 ? '99+' : count}</span>}</Link></div>
      </div>
      <form role="search" className="search-form" action="/" onSubmit={search}><label className="sr-only" htmlFor="store-search">Buscar productos</label><input key={pathname} id="store-search" type="search" name="q" placeholder="Tomate, gaseosa, hamburguesa..." maxLength={100} autoComplete="off" /><button aria-label="Buscar" type="submit"><Search /></button></form>
    </header>
    <main id="contenido" className="main-content">{storageWarning && <p className="notice" role="status">{storageWarning}</p>}{children}</main>
    <nav className="bottom-nav" aria-label="Navegación principal">
      {[{ href: '/', label: 'Inicio', icon: House }, { href: '/pedidos', label: 'Mis pedidos', icon: ClipboardList }, { href: '/cuenta', label: 'Mi cuenta', icon: UserRound }].map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={(pathname === href || (href === '/cuenta' && ['/ingresar', '/registro'].includes(pathname))) ? 'active' : ''} aria-label={label} aria-current={pathname === href ? 'page' : undefined}><Icon aria-hidden="true" /><span className="sr-only">{label}</span></Link>)}
    </nav>
    {sheet === 'address' && <Sheet title="¿Dónde te lo llevamos?" onClose={() => setSheet(null)}><div className="sheet-symbol"><MapPin /></div><p className="muted">Guardá una dirección para tenerla a mano cuando hagas tu pedido.</p><form className="stack-form" onSubmit={(event) => { event.preventDefault(); saveAddress(new FormData(event.currentTarget).get('address')!.toString()); setSheet(null); }}><label htmlFor="address">Calle, número y departamento</label><input id="address" name="address" defaultValue={address} placeholder="Ej.: San Martín 123, depto. 2" required minLength={5} maxLength={180} autoComplete="street-address" /><button className="primary-button" type="submit">Guardar dirección <ArrowRight size={18} /></button></form></Sheet>}
    {sheet === 'notifications' && <Sheet title="Notificaciones" onClose={() => setSheet(null)}><div className="empty-state compact"><Bell /><h3>Todo al día</h3><p>Todavía no tenés notificaciones.</p></div></Sheet>}
  </div>;
}
