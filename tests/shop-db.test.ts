import {randomUUID} from 'node:crypto';
import {beforeAll,afterAll,describe,it,expect} from 'vitest';
import {getDb} from '@/lib/db';
import {createOrder,payOrder,cancelOwnOrder,ownOrders,profile,saveProfile,publicProducts,SHIPPING_CENTS} from '@/lib/shop';
import {cancelOrder,advanceOrder,detailedMetrics,getOrderMetrics} from '@/lib/admin/orders';
import {createUser,editUser} from '@/lib/admin/manage-users';
import {setUserActive,updateUserRole} from '@/lib/admin/users';
import type {CurrentUser} from '@/lib/auth/types';
describe.skipIf(!process.env.TEST_DATABASE_URL)('Circuito completo en esquema aislado',()=>{
 let customer:CurrentUser,other:CurrentUser,employee:CurrentUser,admin:CurrentUser;
 const db=getDb();let products:string[]=[];
 beforeAll(async()=>{
   for(const role of ['cliente','cliente','empleado','superadmin'] as const){const id=randomUUID();await db.query(`INSERT INTO food_store_users(id,name,email,"emailVerified",role) VALUES($1,$2,$3,false,$2)`,[id,role,id+'@example.test']);const user={id,name:role,email:id+'@example.test',role,isActive:true};if(role==='cliente'){if(customer)other=user;else customer=user;}else if(role==='empleado')employee=user;else admin=user;}
 });
 afterAll(async()=>{await db.end();});
 async function product(stock=10){const id=randomUUID();await db.query(`INSERT INTO food_store_products(id,name,price_cents,stock) VALUES($1,'Producto QA',10000,$2)`,[id,stock]);products.push(id);return id;}
 async function stock(id:string){return (await db.query('SELECT stock FROM food_store_products WHERE id=$1',[id])).rows[0].stock;}
 async function order(ids:string[],qty=1){return createOrder(customer,ids.map(id=>({productId:id,quantity:qty})),'Dirección ficticia 123',randomUUID());}
 it('calcula total, conserva precios, no descuenta al crear y deduplica reintentos',async()=>{
   const p=await product();const key=randomUUID();const lines=[{productId:p,quantity:2,price:1}];
   const [a,b]=await Promise.all([createOrder(customer,lines,'Dirección 123',key),createOrder(customer,lines,'Dirección 123',key)]);expect(a).toBe(b);expect(await stock(p)).toBe(10);
   await db.query('UPDATE food_store_products SET price_cents=90000,is_active=false WHERE id=$1',[p]);const saved=(await ownOrders(customer,a))[0];expect(saved.total_cents).toBe(20000+SHIPPING_CENTS);expect(saved.items[0].unit_price_cents).toBe(10000);expect((await publicProducts()).some(x=>x.id===p)).toBe(false);
 });
 it('R1 todo o nada; R2 rechazo reintentable; pago duplicado descuenta una sola vez',async()=>{
   const a=await product(),b=await product();const id=await order([a,b],2);await db.query('UPDATE food_store_products SET stock=0 WHERE id=$1',[b]);await expect(payOrder(customer,id,true)).rejects.toThrow('stock');expect(await stock(a)).toBe(10);expect((await ownOrders(customer,id))[0].status).toBe('pendiente');
   await payOrder(customer,id,false);expect((await ownOrders(customer,id))[0].status).toBe('pendiente');await db.query('UPDATE food_store_products SET stock=10 WHERE id=$1',[b]);await Promise.all([payOrder(customer,id,true),payOrder(customer,id,true)]);expect(await stock(a)).toBe(8);expect(await stock(b)).toBe(8);
   await cancelOrder(employee,id,'Error de prueba');expect(await stock(a)).toBe(10);await expect(cancelOrder(employee,id,'Reintento')).rejects.toThrow();expect(await stock(a)).toBe(10);
 });
 it('dos pedidos compiten por el último stock sin negativos',async()=>{
   const p=await product(1);const a=await order([p]),b=await order([p]);const results=await Promise.allSettled([payOrder(customer,a,true),payOrder(customer,b,true)]);expect(results.filter(r=>r.status==='fulfilled')).toHaveLength(1);expect(await stock(p)).toBe(0);
 });
 it('R6 cliente cancela pendiente; nadie cancela En camino; estados e historial',async()=>{
   const p=await product();const pending=await order([p]);await cancelOwnOrder(customer,pending,'No lo necesito');expect(await stock(p)).toBe(10);
   const id=await order([p]);await payOrder(customer,id,true);await expect(cancelOwnOrder(customer,id,'No')).rejects.toThrow();await expect(advanceOrder(employee,id,'entregado')).rejects.toThrow();await advanceOrder(employee,id,'en_preparacion');await expect(cancelOrder(employee,id,'No')).rejects.toThrow();await advanceOrder(employee,id,'en_camino');await expect(cancelOrder(admin,id,'No')).rejects.toThrow();await advanceOrder(employee,id,'entregado');const saved=(await ownOrders(customer,id))[0];expect(saved.history.map((h:{to_status:string})=>h.to_status)).toEqual(['pendiente','confirmado','en_preparacion','en_camino','entregado']);
 });
 it('R7 y R8: aislamiento de pedidos, perfil y roles',async()=>{
   const id=await order([await product()]);await expect(ownOrders(other,id)).rejects.toThrow();await expect(payOrder(other,id,true)).rejects.toThrow();await expect(createOrder(employee,[], '', '')).rejects.toThrow();await expect(profile(admin)).rejects.toThrow();await saveProfile(customer,'123456','Casa de prueba');expect((await profile(customer)).address).toBe('Casa de prueba');expect((await profile(other)).address).toBe('');
 });
 it('alta, edición, baja y protección de superadmin; métricas',async()=>{
   const id=await createUser(admin,{name:'Usuario QA',email:randomUUID()+'@example.test',password:'Clave-ficticia-123',role:'cliente'});await editUser(admin,id,'Editado','123','Dirección');expect((await db.query('SELECT name FROM food_store_users WHERE id=$1',[id])).rows[0].name).toBe('Editado');await updateUserRole(admin,id,'empleado');await setUserActive(admin,id,false);expect((await db.query('SELECT is_active FROM food_store_users WHERE id=$1',[id])).rows[0].is_active).toBe(false);await expect(updateUserRole(admin,admin.id,'cliente')).rejects.toThrow();await expect(setUserActive(admin,admin.id,false)).rejects.toThrow();expect((await getOrderMetrics(admin)).revenueCents).toBeGreaterThan(0);expect((await detailedMetrics(admin)).best.units).toBeGreaterThan(0);await expect(detailedMetrics(customer)).rejects.toThrow();
 });
});
