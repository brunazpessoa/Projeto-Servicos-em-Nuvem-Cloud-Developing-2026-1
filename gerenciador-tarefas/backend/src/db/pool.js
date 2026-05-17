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

// Tenta conectar com retry — o Postgres pode demorar alguns segundos mesmo após o healthcheck
export async function connectDB(retries = 10, delayMs = 2000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();
      console.log('[DB] Conectado ao PostgreSQL com sucesso!');
      return;
    } catch (err) {
      console.warn(`[DB] Tentativa ${attempt}/${retries} falhou: ${err.message}`);
      if (attempt === retries) {
        throw new Error(`[DB] Não foi possível conectar ao banco após ${retries} tentativas.`);
      }
      await new Promise(res => setTimeout(res, delayMs));
    }
  }
}

export default pool;
