import Link from 'next/link';
export default function NotFound() { return <div className="inner-page empty-state"><h1>Esta página no está en la tienda</h1><p>Volvé al inicio para seguir explorando.</p><Link className="primary-button" href="/">Volver al inicio</Link></div>; }
