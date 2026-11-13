import {Pool} from 'pg';
import {randomBytes,randomUUID} from 'node:crypto';
import {hashPassword} from 'better-auth/crypto';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {dirname} from 'node:path';
const output=process.env.DEMO_CREDENTIALS_PATH;
if(!output)throw new Error('Definí DEMO_CREDENTIALS_PATH fuera del repositorio.');
const pool=new Pool({connectionString:process.env.DATABASE_URL});const db=await pool.connect();
let accounts;try{accounts=JSON.parse(await readFile(output,'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;accounts=['cliente','empleado','superadmin'].map(role=>({role,email:`${role}@foodstore.example`,password:randomBytes(18).toString('base64url')}));}
try{
 await mkdir(dirname(output),{recursive:true});await writeFile(output,JSON.stringify(accounts,null,2),{mode:0o600});
 await db.query('BEGIN');
 for(const category of ['Bebidas','Almacén','Frescos'])await db.query('INSERT INTO food_store_categories(id,name,slug) VALUES($1,$2,$1) ON CONFLICT(id) DO NOTHING',['demo-'+category.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(),category]);
 const names=['Bebida de ejemplo','Jugo de ejemplo','Agua de ejemplo','Té de ejemplo','Galletas de ejemplo','Cereal de ejemplo','Arroz de ejemplo','Conserva de ejemplo','Leche de ejemplo','Yogur de ejemplo','Queso de ejemplo','Fruta de ejemplo'];
 for(let i=0;i<12;i++)await db.query(`INSERT INTO food_store_products(id,category_id,name,description,price_cents,stock,min_stock,image_url) VALUES($1,$2,$3,'Producto ficticio para el TP. Imagen ilustrativa.',$4,$5,3,'/producto-ejemplo.svg') ON CONFLICT(id) DO NOTHING`,['seed-'+(i+1),['demo-bebidas','demo-almacen','demo-frescos'][Math.floor(i/4)],names[i],100000+i*15000,i===11?2:30]);
 for(const a of accounts){const existing=await db.query('SELECT id FROM food_store_users WHERE email=$1',[a.email]);if(existing.rowCount)continue;const id=randomUUID();await db.query(`INSERT INTO food_store_users(id,name,email,"emailVerified",role) VALUES($1,$2,$3,false,$4)`,[id,'Demo '+a.role,a.email,a.role]);await db.query(`INSERT INTO food_store_accounts(id,"accountId","providerId","userId",password,"updatedAt") VALUES($1,$2,'credential',$2,$3,now())`,[randomUUID(),id,await hashPassword(a.password)]);}
 await db.query('COMMIT');console.log('Demo preparada: 12 productos, 3 categorías y 3 roles. Credenciales guardadas solo en el archivo privado.');
}catch(e){await db.query('ROLLBACK');throw e;}finally{db.release();await pool.end();}
