import 'server-only';
import { randomUUID } from 'node:crypto';
import { hashPassword } from 'better-auth/crypto';
import { getDb } from '@/lib/db';
import { requireRole,isUserRole } from '@/lib/auth/roles';
import type { CurrentUser } from '@/lib/auth/types';
import { ValidationError,ConflictError,NotFoundError } from './errors';
import { requiredString } from './validation';
export async function createUser(actor:CurrentUser|null,input:{name:unknown;email:unknown;password:unknown;role:unknown}) {
  requireRole(actor,['superadmin']);
  const name=requiredString(input.name,'El nombre',80);const email=requiredString(input.email,'El correo',254).toLowerCase();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||typeof input.password!=='string'||input.password.length<10||input.password.length>128||!isUserRole(input.role)) throw new ValidationError('Revisá el correo, el rol y la contraseña (10 a 128 caracteres).');
  const hash=await hashPassword(input.password);const id=randomUUID();const db=await getDb().connect();
  try {await db.query('BEGIN');await db.query(`INSERT INTO food_store_users(id,name,email,"emailVerified",role) VALUES($1,$2,$3,false,$4)`,[id,name,email,input.role]);
    await db.query(`INSERT INTO food_store_accounts(id,"accountId","providerId","userId",password,"updatedAt") VALUES($1,$2,'credential',$2,$3,now())`,[randomUUID(),id,hash]);await db.query('COMMIT');return id;
  }catch(error){await db.query('ROLLBACK');if((error as {code:string}).code==='23505')throw new ConflictError('Ese correo ya está registrado.');throw error;}finally{db.release();}
}
export async function editUser(actor:CurrentUser|null,id:string,nameInput:unknown,phone:unknown,address:unknown) {
  requireRole(actor,['superadmin']);const name=requiredString(nameInput,'El nombre',80);
  if(typeof phone!=='string'||!/^[-+()\d\s]{0,30}$/.test(phone)||typeof address!=='string'||address.length>180)throw new ValidationError('Revisá el teléfono y la dirección.');
  const result=await getDb().query('UPDATE food_store_users SET name=$2,phone=$3,address=$4,"updatedAt"=now() WHERE id=$1',[id,name,phone,address]);if(!result.rowCount)throw new NotFoundError('El usuario no existe.');
}
