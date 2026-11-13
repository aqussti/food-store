import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {Pool} from 'pg';
const base=process.env.TEST_BASE_URL||'http://localhost:3000';
const accounts=JSON.parse(await readFile(process.env.DEMO_CREDENTIALS_PATH,'utf8'));
const db=new Pool({connectionString:process.env.DATABASE_URL});
const pid='smoke-'+randomUUID();const orderIds=[];let cookie='';
async function api(path,body,session=cookie){const r=await fetch(base+path,{method:body?'POST':'GET',headers:{Origin:base,'Content-Type':'application/json',Cookie:session},body:body?JSON.stringify(body):undefined});return {r,data:await r.json().catch(()=>null)};}
async function login(account){const {r}=await api('/api/auth/sign-in/email',{email:account.email,password:account.password},'');assert.equal(r.status,200,'Ingreso de '+account.role);return r.headers.getSetCookie().map(x=>x.split(';')[0]).join('; ');}
try{
 assert.equal((await fetch(base)).status,200);
 assert.equal((await api('/api/health/db')).data.database,'connected');
 const catalog=(await api('/api/store/catalog')).data;assert.ok(catalog.length>=12);assert.ok(new Set(catalog.map(p=>p.category)).size>=3);
 cookie=await login(accounts.find(a=>a.role==='cliente'));
 await db.query(`INSERT INTO food_store_products(id,name,price_cents,stock) VALUES($1,'QA publicado temporal',10000,5)`,[pid]);
 const created=await api('/api/store/orders',{lines:[{productId:pid,quantity:2}],address:'Dirección ficticia QA 123',key:randomUUID(),total:1});assert.equal(created.r.status,200);const id=created.data.id;orderIds.push(id);
 assert.equal((await api('/api/store/orders?id='+id)).data[0].total_cents,170000);
 assert.equal((await api('/api/store/pay',{id,approved:false})).r.status,200);
 assert.equal((await api('/api/store/orders?id='+id)).data[0].status,'pendiente');
 const payments=await Promise.all([api('/api/store/pay',{id,approved:true}),api('/api/store/pay',{id,approved:true})]);assert.ok(payments.every(x=>x.r.status===200));
 assert.equal((await db.query('SELECT stock FROM food_store_products WHERE id=$1',[pid])).rows[0].stock,3);
 assert.equal((await api('/api/store/orders?id='+id,'','')).r.status,401);
 const staff=await login(accounts.find(a=>a.role==='empleado'));
 assert.equal((await api('/api/store/orders',{lines:[{productId:pid,quantity:1}],address:'QA 123',key:randomUUID()},staff)).r.status,403);
 assert.match(await (await fetch(base+'/admin/productos',{headers:{Cookie:staff}})).text(),/Productos/);
 const admin=await login(accounts.find(a=>a.role==='superadmin'));
 assert.match(await (await fetch(base+'/admin/usuarios',{headers:{Cookie:admin}})).text(),/Crear usuario/);
 assert.match(await (await fetch(base+'/admin',{headers:{Cookie:admin}})).text(),/Producto m.*s vendido/);
 for(const session of [cookie,staff,admin])await api('/api/auth/sign-out',{},session);
 console.log('OK publicado: acceso público, Neon, 12 productos/3 categorías, tres roles, pedido, total del servidor, rechazo, aprobación concurrente, privacidad y panel.');
}finally{
 if(orderIds.length)await db.query('DELETE FROM food_store_orders WHERE id=ANY($1::text[])',[orderIds]);
 await db.query('DELETE FROM food_store_products WHERE id=$1',[pid]);await db.end();
}
