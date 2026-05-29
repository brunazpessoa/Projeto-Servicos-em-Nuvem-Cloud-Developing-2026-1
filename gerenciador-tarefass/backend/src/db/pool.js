// Gerencia o pool de conexões com o banco PostgreSQL para uso em todo o backend
import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

// SSL é obrigatório no Amazon RDS. Ativado quando DB_SSL=true (Task Definition na AWS).
// Localmente (Docker), DB_SSL fica não setado → SSL desligado.
const sslEnabled = process.env.DB_SSL === 'true';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: sslEnabled ? { rejectUnauthorized: false } : false,
});

// Garante que a tabela `tarefas` existe e tem seeds. Idempotente:
// - Local (Docker): tabela já criada pelo /docker-entrypoint-initdb.d/, com rows → no-op.
// - AWS (RDS): RDS nasce vazio → cria tabela e insere seeds no primeiro start.
export async function ensureSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tarefas (
      id SERIAL PRIMARY KEY,
      titulo VARCHAR(255) NOT NULL,
      descricao TEXT,
      disciplina VARCHAR(100) NOT NULL,
      concluida BOOLEAN DEFAULT FALSE,
      data_entrega DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM tarefas');
  if (rows[0].count === 0) {
    console.log('[DB] Tabela vazia — inserindo seeds iniciais');
    await pool.query(`
      INSERT INTO tarefas (titulo, descricao, disciplina, concluida, data_entrega) VALUES
      ('Projeto de Nuvem', 'Entregar o CRUD com Docker e AWS', 'Serviços em Nuvem', false, '2026-06-01'),
      ('Estudar para P2', 'Revisar conceitos de Redes', 'Redes de Computadores', true, '2026-05-20'),
      ('Analisar dados', 'Preparar amostras e gerar gráficos exploratórios', 'Ciencia de Dados', false, '2026-06-05'),
      ('Resolver listas de exercícios', 'Fazer os problemas de integração e limites', 'Calculo I', false, '2026-05-25'),
      ('Praticar listening', 'Ouvir áudios em inglês e responder perguntas', 'Ingles', false, '2026-06-10')
    `);
    console.log('[DB] Seeds inseridos com sucesso');
  } else {
    console.log(`[DB] Tabela tarefas já tem ${rows[0].count} registros — skip seeds`);
  }
}

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
