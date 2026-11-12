'use client';

import { useRef, useState, type UIEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Clock3, Plus, Check, SearchX, ChevronRight, ShoppingCart } from 'lucide-react';
import { products, categories, filterProducts, money, type Product } from '@/lib/catalog';
import { MAX_QUANTITY } from '@/lib/cart';
import { ProductArt } from './product-art';
import { useStore } from './store-provider';
import { Sheet } from './sheet';

function ProductCard({ product, onOpen, promotion = false }: { product: Product; onOpen: (product: Product) => void; promotion?: boolean }) {
  const { add, cart } = useStore();
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const quantity = cart.find((line) => line.productId === product.id)?.quantity || 0;
  return <article className={`product-card ${promotion ? 'promotion-product' : ''}`}>
    <button className="product-open" onClick={() => onOpen(product)} aria-label={`Ver ${product.name}`}><ProductArt product={product} /><span className="product-name">{product.name}</span><span className="product-detail">{product.detail}</span></button>
    <div className="product-bottom"><strong>{money(product.price)}</strong><button type="button" className={`add-button ${added ? 'added' : ''}`} disabled={quantity >= MAX_QUANTITY} aria-label={quantity >= MAX_QUANTITY ? `Máximo de ${MAX_QUANTITY} unidades de ${product.name}` : `Agregar ${product.name} al carrito`} onClick={() => { add(product.id); setAdded(true); if (timer.current) clearTimeout(timer.current); timer.current = setTimeout(() => setAdded(false), 1200); }}>{added ? <Check size={16} /> : <Plus size={16} />}</button></div>
  </article>;
}

function ProductRow({ title, items, onOpen, promotion = false }: { title: string; items: Product[]; onOpen: (product: Product) => void; promotion?: boolean }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  function onScroll(event: UIEvent<HTMLDivElement>) { const row = event.currentTarget; const max = row.scrollWidth - row.clientWidth; setProgress(max > 0 ? row.scrollLeft / max : 0); }
  return <section className={promotion ? 'promotions' : 'catalog-section'} aria-label={title}>
    <div className="section-heading"><h2>{title}</h2>{promotion ? <span className="promotion-pill"><Clock3 size={16} />Para vos</span> : <button className="row-next" aria-label={`Ver más de ${title}`} onClick={() => { const row = rowRef.current; if (row) row.scrollTo({ left: row.scrollLeft >= row.scrollWidth - row.clientWidth - 4 ? 0 : row.scrollLeft + row.clientWidth * .8, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); }}><ChevronRight size={21} /></button>}</div>
    <div className="row-window"><div className="product-row" ref={rowRef} onScroll={onScroll} tabIndex={0} aria-label={`Productos de ${title}, desplazamiento horizontal`}>{items.map((product) => <ProductCard key={product.id} product={product} onOpen={onOpen} promotion={promotion} />)}</div><span className="row-fade" aria-hidden="true" /></div>
    {!promotion && <div className="row-progress" aria-hidden="true"><span style={{ left: `${progress * 78}%` }} /></div>}
  </section>;
}

export function Catalog({ query = '', category = 'Todo' }: { query?: string; category?: string }) {
  const router = useRouter();
  const { add, cart } = useStore();
  const [selected, setSelected] = useState<Product | null>(null);
  const [feedback, setFeedback] = useState('');
  const filtering = Boolean(query || category !== 'Todo');
  const found = filterProducts(query, category);
  function selectCategory(value: string) { const params = new URLSearchParams(); if (query) params.set('q', query); if (value !== 'Todo') params.set('categoria', value); router.push(params.size ? `/?${params}` : '/', { scroll: false }); }
  return <>
    {!filtering && <ProductRow title="Promociones" items={products.filter((p) => p.promotion)} onOpen={setSelected} promotion />}
    <div className="category-bar" role="group" aria-label="Filtrar por categoría">{categories.map((item) => <button key={item} aria-pressed={category === item} className={category === item ? 'selected' : ''} onClick={() => selectCategory(item)}>{item}</button>)}</div>
    {filtering ? <section className="search-results"><div className="section-heading"><h1>{query ? `Resultados para “${query}”` : category}</h1></div><p className="muted results-count">{found.length} {found.length === 1 ? 'producto' : 'productos'}</p>{found.length ? <div className="product-grid">{found.map((product) => <ProductCard key={product.id} product={product} onOpen={setSelected} />)}</div> : <div className="empty-state"><SearchX /><h2>No encontramos ese producto</h2><p>Probá con otro nombre o cambiá la categoría.</p><Link className="primary-button" href="/">Ver todos los productos <ArrowRight size={17} /></Link></div>}</section> : <><ProductRow title="Recomendaciones para vos" items={products} onOpen={setSelected} /><ProductRow title="Lo más vendido" items={[products[3], products[1], products[5], products[0]]} onOpen={setSelected} /><ProductRow title="Almacén" items={products.filter((p) => p.category === 'Almacén')} onOpen={setSelected} /></>}
    <p className="sample-note">Catálogo de muestra · Productos y precios de ejemplo</p>
    {selected && <Sheet title={selected.name} onClose={() => { setSelected(null); setFeedback(''); }}><div className="detail-art"><ProductArt product={selected} /></div><div className="detail-info"><span className="tag">{selected.category}</span><h3>{selected.detail}</h3><p className="muted">Este producto es un ejemplo para explorar la tienda y armar tu carrito. Todavía no está disponible para comprar.</p><strong className="detail-price">{money(selected.price)}</strong></div><button className="primary-button full-width" disabled={(cart.find((line) => line.productId === selected.id)?.quantity || 0) >= MAX_QUANTITY} onClick={() => { add(selected.id); setFeedback('Producto agregado al carrito'); }}><ShoppingCart size={18} /> Agregar al carrito</button><p className="form-feedback" role="status">{feedback}</p></Sheet>}
  </>;
}
