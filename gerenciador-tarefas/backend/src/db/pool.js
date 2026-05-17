// Gerencia o pool de conexões com o banco PostgreSQL para uso em todo o backend
import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

export async function connectDB() {
  const client = await pool.connect();
  try {
    await client.query('SELECT 1');
    console.log('[DB] Conectado ao PostgreSQL com sucesso!');
  } finally {
    client.release();
  }
}

export default pool;