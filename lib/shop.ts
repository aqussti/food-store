import 'server-only';
import { randomUUID } from 'node:crypto';
import { getDb } from './db';
import { requireRole } from './auth/roles';
import type { CurrentUser } from './auth/types';
import { ValidationError, ConflictError, NotFoundError } from './admin/errors';
import { requiredString } from './admin/validation';

export const SHIPPING_CENTS = 150000;
export async function publicProducts() {
  const { rows } = await getDb().query(`SELECT p.id,p.name,coalesce(p.description,'') AS detail,
    coalesce(c.name,'Sin categoría') AS category,p.price_cents AS price,p.stock,p.image_url AS image,
    'box' AS shape,'#e9b36d' AS color FROM food_store_products p
    LEFT JOIN food_store_categories c ON c.id=p.category_id
    WHERE p.is_active AND (c.id IS NULL OR c.is_active) ORDER BY p.name`);
  return rows;
}
export function checkoutLines(input: unknown): {productId:string; quantity:number}[] {
  if (!Array.isArray(input) || !input.length || input.length > 50) throw new ValidationError('El carrito debe tener entre 1 y 50 productos.');
  const ids = new Set<string>();
  return input.map(item => {
    if (!item || typeof item.productId !== 'string' || item.productId.length > 100 || ids.has(item.productId) || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 20) throw new ValidationError('Revisá las cantidades y productos del carrito.');
    ids.add(item.productId); return { productId:item.productId, quantity:item.quantity };
  }).sort((a,b)=>a.productId.localeCompare(b.productId));
}
export async function createOrder(actor:CurrentUser|null, input:unknown, addressInput:unknown, keyInput:unknown) {
  const user = requireRole(actor,['cliente']);
  const lines = checkoutLines(input);
  const address = requiredString(addressInput,'La dirección',180);
  const key = requiredString(keyInput,'La referencia del carrito',100);
  const db = await getDb().connect();
  try {
    await db.query('BEGIN');
    await db.query('SELECT pg_advisory_xact_lock(hashtext($1))',[user.id+key]);
    const existing = await db.query('SELECT id FROM food_store_orders WHERE customer_id=$1 AND checkout_key=$2',[user.id,key]);
    if(existing.rows[0]) { await db.query('COMMIT'); return existing.rows[0].id as string; }
    const products = await db.query(`SELECT p.* FROM food_store_products p LEFT JOIN food_store_categories c ON c.id=p.category_id
      WHERE p.id=ANY($1::text[]) AND p.is_active AND (c.id IS NULL OR c.is_active) ORDER BY p.id FOR UPDATE OF p`,[lines.map(x=>x.productId)]);
    let subtotal=0;
    const items=lines.map(line=> {
      const p=products.rows.find(p=>p.id===line.productId);
      if(!p || p.stock<line.quantity) throw new ConflictError('No hay stock suficiente de todos los productos. Revisá tu carrito.');
      subtotal+=p.price_cents*line.quantity;
      return {...line,name:p.name,price:p.price_cents};
    });
    if(!Number.isSafeInteger(subtotal) || subtotal+SHIPPING_CENTS>2147483647) throw new ValidationError('El pedido supera el importe permitido.');
    const id=randomUUID();
    await db.query(`INSERT INTO food_store_orders(id,customer_id,subtotal_cents,shipping_cents,total_cents,shipping_address,checkout_key)
      VALUES($1,$2,$3,$4,$5,$6,$7)`,[id,user.id,subtotal,SHIPPING_CENTS,subtotal+SHIPPING_CENTS,address,key]);
    for(const item of items) await db.query(`INSERT INTO food_store_order_items(id,order_id,product_id,product_name,unit_price_cents,quantity,line_total_cents)
      VALUES($1,$2,$3,$4,$5,$6,$7)`,[randomUUID(),id,item.productId,item.name,item.price,item.quantity,item.price*item.quantity]);
    await db.query(`INSERT INTO food_store_order_status_history(id,order_id,to_status,changed_by) VALUES($1,$2,'pendiente',$3)`,[randomUUID(),id,user.id]);
    await db.query('COMMIT'); return id;
  } catch(error) { await db.query('ROLLBACK'); throw error; } finally { db.release(); }
}
export async function payOrder(actor:CurrentUser|null,id:string,approved:boolean) {
  const user=requireRole(actor,['cliente']);
  const db=await getDb().connect();
  try {
    await db.query('BEGIN');
    const result=await db.query('SELECT status FROM food_store_orders WHERE id=$1 AND customer_id=$2 FOR UPDATE',[id,user.id]);
    const order=result.rows[0]; if(!order) throw new NotFoundError('El pedido no existe.');
    if(order.status==='confirmado' && approved) { await db.query('COMMIT'); return; }
    if(order.status!=='pendiente') throw new ConflictError('El pedido ya no admite pagos.');
    if(approved) {
      const items=await db.query('SELECT product_id,quantity FROM food_store_order_items WHERE order_id=$1 ORDER BY product_id',[id]);
      for(const item of items.rows) {
        const updated=await db.query(`UPDATE food_store_products SET stock=stock-$2,updated_at=now() WHERE id=$1 AND stock >= $2 RETURNING id`,[item.product_id,item.quantity]);
        if(!updated.rowCount) throw new ConflictError('Falta stock. No se descontó ningún producto; tu pedido sigue pendiente.');
      }
      await db.query(`UPDATE food_store_orders SET status='confirmado',payment_reference=$2,updated_at=now() WHERE id=$1`,[id,randomUUID()]);
      await db.query(`INSERT INTO food_store_order_status_history(id,order_id,from_status,to_status,changed_by) VALUES($1,$2,'pendiente','confirmado',$3)`,[randomUUID(),id,user.id]);
    }
    await db.query('INSERT INTO food_store_payment_attempts(id,order_id,approved) VALUES($1,$2,$3)',[randomUUID(),id,approved]);
    await db.query('COMMIT');
  } catch(error) { await db.query('ROLLBACK'); throw error; } finally { db.release(); }
}
export async function cancelOwnOrder(actor:CurrentUser|null,id:string,reasonInput:unknown) {
  const user=requireRole(actor,['cliente']);
  const reason=requiredString(reasonInput,'El motivo',500);
  const db=await getDb().connect();
  try {
    await db.query('BEGIN');
    const result=await db.query(`UPDATE food_store_orders SET status='cancelado',cancel_reason=$3,cancelled_by=$2,cancelled_at=now(),updated_at=now()
      WHERE id=$1 AND customer_id=$2 AND status='pendiente' RETURNING id`,[id,user.id,reason]);
    if(!result.rowCount) throw new ConflictError('Solo podés cancelar tus pedidos pendientes.');
    await db.query(`INSERT INTO food_store_order_status_history(id,order_id,from_status,to_status,changed_by,reason) VALUES($1,$2,'pendiente','cancelado',$3,$4)`,[randomUUID(),id,user.id,reason]);
    await db.query('COMMIT');
  } catch(error) { await db.query('ROLLBACK'); throw error; } finally { db.release(); }
}
export async function ownOrders(actor:CurrentUser|null, id?:string) {
  const user=requireRole(actor,['cliente']);
  const {rows}=await getDb().query(`SELECT o.*,
    (SELECT coalesce(json_agg(i ORDER BY i.id),'[]'::json) FROM food_store_order_items i WHERE i.order_id=o.id) AS items,
    (SELECT coalesce(json_agg(json_build_object('to_status',h.to_status,'created_at',h.created_at,'reason',h.reason,'name',u.name) ORDER BY h.created_at),'[]'::json)
      FROM food_store_order_status_history h LEFT JOIN food_store_users u ON u.id=h.changed_by WHERE h.order_id=o.id) AS history
    FROM food_store_orders o WHERE customer_id=$1 AND ($2::text IS NULL OR o.id=$2) ORDER BY created_at DESC`,[user.id,id||null]);
  if(id&&!rows.length) throw new NotFoundError('El pedido no existe.');
  return rows;
}
export async function profile(actor:CurrentUser|null) {
  const user=requireRole(actor,['cliente']);
  return (await getDb().query('SELECT name,email,phone,address FROM food_store_users WHERE id=$1',[user.id])).rows[0];
}
export async function saveProfile(actor:CurrentUser|null,phone:unknown,address:unknown) {
  const user=requireRole(actor,['cliente']);
  if(typeof phone!=='string'||!/^[-+()\d\s]{0,30}$/.test(phone)||typeof address!=='string'||address.length>180) throw new ValidationError('Revisá el teléfono y la dirección.');
  await getDb().query('UPDATE food_store_users SET phone=$2,address=$3,"updatedAt"=now() WHERE id=$1',[user.id,phone.trim(),address.trim()]);
}
