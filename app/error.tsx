'use client';
export default function ErrorPage({ reset }: { reset: () => void }) { return <div className="inner-page empty-state"><h1>Algo no salió como esperábamos</h1><p>Probá de nuevo en un momento.</p><button className="primary-button" onClick={reset}>Reintentar</button></div>; }
