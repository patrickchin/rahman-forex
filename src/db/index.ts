import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { p2pAdvertOrderHistory } from '@/db/schema';

const db = drizzle(process.env.DATABASE_URL!);

export { db, p2pAdvertOrderHistory };
