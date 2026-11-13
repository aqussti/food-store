import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCart, setQuantity, MAX_QUANTITY } from '../lib/cart.ts';
import { filterProducts, money, normalizeSearch } from '../lib/catalog.ts';

test('el carrito descarta datos corruptos, productos ajenos y cantidades inválidas', () => {
  assert.deepEqual(parseCart('no es JSON', ['demo-01']), []);
  assert.deepEqual(parseCart(JSON.stringify([{ productId: 'otro', quantity: 2 }, { productId: 'demo-01', quantity: -2 }, { productId: 'demo-01', quantity: 1.5 }, null]), ['demo-01']), []);
});
test('el carrito agrupa duplicados y limita cantidades sin aceptar infinito', () => {
  assert.deepEqual(parseCart(JSON.stringify([{ productId: 'demo-01', quantity: 12 }, { productId: 'demo-01', quantity: 12 }]), ['demo-01']), [{ productId: 'demo-01', quantity: MAX_QUANTITY }]);
  assert.deepEqual(setQuantity([], 'demo-01', Infinity), []);
  assert.deepEqual(setQuantity([{ productId: 'demo-01', quantity: 1 }], 'demo-01', 0), []);
});
test('la búsqueda combina nombre y categoría, ignorando mayúsculas y tildes', () => {
  assert.equal(normalizeSearch('  ALMACÉN '), 'almacen');
  assert.equal(filterProducts('BEBIDA', 'Bebidas').length, 1);
  assert.equal(filterProducts('BEBIDA', 'Almacén').length, 0);
  assert.equal(filterProducts('no existe', 'Todo').length, 0);
});
test('los totales del carrito se expresan desde centavos enteros', () => {
  assert.match(money(250000 * 3), /7[.,]500/);
});
