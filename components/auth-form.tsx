'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { ArrowRight, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { authClient } from '@/lib/auth-client';

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const register = mode === 'register';
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const form = new FormData(event.currentTarget);
    const email = form.get('email')!.toString().trim().toLowerCase();
    const password = form.get('password')!.toString();
    const name = form.get('name')?.toString().trim() || '';
    if (register && name.length < 2) { setError('Ingresá tu nombre, con al menos 2 caracteres.'); return; }
    if (register && password !== form.get('confirm')) { setError('Las contraseñas no coinciden.'); return; }
    setPending(true);
    try {
      const result = register ? await authClient.signUp.email({ email, password, name }) : await authClient.signIn.email({ email, password });
      if (result.error) {
        const code = result.error.code || '';
        setError(result.error.status === 429 ? 'Demasiados intentos. Esperá un minuto y volvé a probar.' : code.includes('USER_ALREADY_EXISTS') ? 'Ya existe una cuenta con ese correo. Iniciá sesión.' : code.includes('INVALID_EMAIL') ? 'Revisá el correo electrónico.' : register ? 'No pudimos crear tu cuenta. Revisá los datos e intentá otra vez.' : 'El correo o la contraseña no son correctos.');
      } else { router.replace('/cuenta'); router.refresh(); }
    } catch { setError('No pudimos conectarnos. Revisá tu conexión e intentá nuevamente.'); }
    finally { setPending(false); }
  }
  return <section className="inner-page auth-page"><Link className="back-link" href="/"><ArrowLeft size={16} /> Volver a la tienda</Link><p className="auth-kicker">FOOD STORE</p><h1>{register ? 'Hacete de la casa.' : 'Qué bueno verte.'}</h1><p className="muted">{register ? 'Creá tu cuenta y tené todo a mano.' : 'Ingresá a tu cuenta para seguir donde dejaste.'}</p><form className="stack-form" onSubmit={submit}>
    {register && <><label htmlFor="name">Tu nombre</label><input id="name" name="name" autoComplete="name" placeholder="¿Cómo te llamás?" required minLength={2} maxLength={80} disabled={pending} /></>}
    <label htmlFor="email">Correo electrónico</label><input id="email" name="email" type="email" inputMode="email" autoComplete="email" placeholder="vos@ejemplo.com" required maxLength={254} disabled={pending} />
    <label htmlFor="password">Contraseña</label><div className="password-field"><input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete={register ? 'new-password' : 'current-password'} placeholder={register ? 'Al menos 10 caracteres' : 'Tu contraseña'} required minLength={register ? 10 : 1} maxLength={128} disabled={pending} /><button type="button" aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button></div>
    {register && <><p className="form-note">Usá una contraseña que no uses en otros sitios.</p><label htmlFor="confirm">Repetí la contraseña</label><input id="confirm" name="confirm" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required minLength={10} maxLength={128} disabled={pending} /></>}
    {error && <p role="alert" className="form-error">{error}</p>}
    <button className="primary-button" type="submit" disabled={pending}>{pending ? 'Un momento…' : register ? 'Crear mi cuenta' : 'Ingresar'}<ArrowRight size={18} /></button>
  </form><p className="auth-footer">{register ? '¿Ya tenés cuenta?' : '¿Primera vez por acá?'} <Link href={register ? '/ingresar' : '/registro'}>{register ? 'Ingresá' : 'Creá tu cuenta'}</Link></p></section>;
}
