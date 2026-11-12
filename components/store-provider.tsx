'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { CART_KEY, parseCart, setQuantity, type CartLine } from '@/lib/cart';
import { products } from '@/lib/catalog';

type Store = { cart: CartLine[]; changeQuantity: (id: string, quantity: number) => void; add: (id: string) => void; address: string; saveAddress: (address: string) => void; ready: boolean; storageWarning: string };
const StoreContext = createContext<Store | null>(null);
const ADDRESS_KEY = 'food-store:address:v1';

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [address, setAddress] = useState('');
  const [ready, setReady] = useState(false);
  const [storageWarning, setStorageWarning] = useState('');
  useEffect(() => {
    try {
      setCart(parseCart(localStorage.getItem(CART_KEY), products.map((p) => p.id)));
      setAddress((localStorage.getItem(ADDRESS_KEY) || '').slice(0, 180));
    } catch { setStorageWarning('El navegador no permite guardar tus cambios. Se conservarán mientras uses esta página.'); }
    setReady(true);
    function sync(event: StorageEvent) {
      if (event.key === CART_KEY) setCart(parseCart(event.newValue, products.map((p) => p.id)));
      if (event.key === ADDRESS_KEY) setAddress((event.newValue || '').slice(0, 180));
    }
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch { setStorageWarning('El carrito no se puede guardar en este navegador.'); }
  }, [cart, ready]);
  function changeQuantity(id: string, quantity: number) {
    if (products.some((p) => p.id === id)) setCart((current) => setQuantity(current, id, quantity));
  }
  function add(id: string) {
    if (products.some((p) => p.id === id)) setCart((current) => setQuantity(current, id, (current.find((line) => line.productId === id)?.quantity || 0) + 1));
  }
  function saveAddress(value: string) {
    const next = value.trim().slice(0, 180);
    setAddress(next);
    try { localStorage.setItem(ADDRESS_KEY, next); } catch { setStorageWarning('La dirección no se puede guardar en este navegador.'); }
  }
  return <StoreContext.Provider value={{ cart, changeQuantity, add, address, saveAddress, ready, storageWarning }}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const value = useContext(StoreContext);
  if (!value) throw new Error('Falta StoreProvider');
  return value;
}
