'use client';

import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, MapPin } from 'lucide-react';
import { useStore } from './store-provider';
import { products, money } from '@/lib/catalog';
import { MAX_QUANTITY } from '@/lib/cart';
import { ProductArt } from './product-art';

export function CartView() {
  const { cart, changeQuantity, address, ready } = useStore();
  const lines = cart.flatMap((line) => { const product = products.find((p) => p.id === line.productId); return product ? [{ ...line, product }] : []; });
  const total = lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  return <div className="inner-page"><Link href="/" className="back-link"><ArrowLeft size={16} /> Seguir mirando</Link><h1>Tu carrito</h1>{!ready ? <p className="muted" role="status">Cargando tu carrito…</p> : lines.length ? <><div className="cart-lines">{lines.map(({ product, quantity }) => <article key={product.id} className="cart-line"><div className="cart-art"><ProductArt product={product} /></div><div className="cart-line-info"><h2>{product.name}</h2><p>{product.detail}</p><strong>{money(product.price * quantity)}</strong><div className="quantity-control"><button aria-label={`Quitar una unidad de ${product.name}`} onClick={() => changeQuantity(product.id, quantity - 1)}><Minus size={15} /></button><span aria-live="polite">{quantity}</span><button aria-label={`Sumar una unidad de ${product.name}`} disabled={quantity >= MAX_QUANTITY} onClick={() => changeQuantity(product.id, quantity + 1)}><Plus size={15} /></button></div></div><button className="remove-button" aria-label={`Eliminar ${product.name}`} onClick={() => changeQuantity(product.id, 0)}><Trash2 size={17} /></button></article>)}</div><div className="cart-summary"><div><span>Subtotal</span><strong>{money(total)}</strong></div><p><MapPin size={16} />{address || 'Podés agregar tu dirección en la cabecera.'}</p><p className="muted">Estás armando un carrito con productos de ejemplo. La compra estará disponible cuando se cargue el catálogo real.</p></div></> : <div className="empty-state"><ShoppingBag /><h2>Tu carrito te está esperando</h2><p>Explorá la tienda y agregá lo que te guste.</p><Link className="primary-button" href="/">Ir a la tienda</Link></div>}</div>;
}
