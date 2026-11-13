import { readFileSync, appendFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { parseEnv } from 'node:util';

const values = parseEnv(readFileSync('.env.local', 'utf8'));
if (!values.BETTER_AUTH_SECRET) appendFileSync('.env.local', `\nBETTER_AUTH_SECRET="${randomBytes(48).toString('base64url')}"\n`);
if (!values.BETTER_AUTH_URL) appendFileSync('.env.local', 'BETTER_AUTH_URL="http://localhost:3000"\n');
console.log('Configuración local de acceso lista. No se muestran secretos.');
