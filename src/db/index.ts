import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { p2pAdvertOrderHistory, priceSnapshots } from '@/db/schema';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
	throw new Error('DATABASE_URL environment variable is required');
}

const db = drizzle(databaseUrl);

export { db, p2pAdvertOrderHistory, priceSnapshots };
