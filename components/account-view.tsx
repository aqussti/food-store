'use client';

import Link from 'next/link';
import { ProfileForm } from './profile-form';
import { useState } from 'react';
import { LogOut, ClipboardList, ShoppingBag, UserRound } from 'lucide-react';
import { authClient } from '@/lib/auth-client';

export function AccountView({ showAdmin = false }: { showAdmin?: boolean }) {
  const { data: session, isPending, error, refetch } = authClient.useSession();
  const [signingOut, setSigningOut] = useState(false);
  const [message, setMessage] = useState('');
  if (isPending) return <p className="auth-state" role="status">Cargando tu cuenta…</p>;
  if (error) return <div className="inner-page empty-state"><h1>No pudimos cargar tu cuenta</h1><p>Probá nuevamente en un momento.</p><button className="primary-button" onClick={() => refetch()}>Reintentar</button></div>;
  if (!session) return <section className="inner-page"><h1>Tu cuenta</h1><div className="empty-state"><UserRound /><h2>Todo lo tuyo, en un lugar</h2><p>Ingresá o creá una cuenta para ver tus datos.</p><div className="account-links"><Link className="primary-button" href="/ingresar">Ingresar</Link><Link className="secondary-button" href="/registro">Crear mi cuenta</Link></div></div></section>;
  return <section className="inner-page"><h1>Tu cuenta</h1><div className="account-card"><div className="account-avatar" aria-hidden="true">{session.user.name.slice(0, 1).toUpperCase()}</div><h2>{session.user.name}</h2><p>{session.user.email}</p><span className="tag">Cuenta de Food Store</span></div>{!showAdmin && <ProfileForm />}<div className="account-links">{showAdmin && <Link href="/admin" className="primary-button">Panel de administración</Link>}<Link href="/pedidos" className="secondary-button"><ClipboardList size={18} /> Mis pedidos</Link><Link href="/" className="secondary-button"><ShoppingBag size={18} /> Volver a la tienda</Link><button className="secondary-button" disabled={signingOut} onClick={async () => { setSigningOut(true); setMessage(''); try { const result = await authClient.signOut(); if (result.error) setMessage('No pudimos cerrar la sesión. Intentá de nuevo.'); else await refetch(); } catch { setMessage('Revisá tu conexión e intentá nuevamente.'); } finally { setSigningOut(false); } }}><LogOut size={18} />{signingOut ? 'Cerrando sesión…' : 'Cerrar sesión'}</button></div>{message && <p className="form-error" role="alert">{message}</p>}</section>;
}
