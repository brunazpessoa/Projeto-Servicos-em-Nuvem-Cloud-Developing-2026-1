// Servidor principal do backend - gerencia todas as rotas da API de tarefas
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import pool, { connectDB } from './pool.js';

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middlewares ───────────────────────────────────────────────────────────────
// CORS explícito: permite qualquer origem (necessário para o browser acessar localhost:3000)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.options('*', cors()); // responde preflight OPTIONS para todas as rotas
app.use(express.json());

// ─── Conexão com banco (com retry + tratamento de falha fatal) ─────────────────
try {
  await connectDB();
} catch (err) {
  console.error('[FATAL] Não foi possível conectar ao banco:', err.message);
  process.exit(1);
}

// ─── Rotas de Tarefas ──────────────────────────────────────────────────────────

// GET /tasks → lista todas as tarefas
app.get('/tasks', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tarefas ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('[GET /tasks]', err.message);
    res.status(500).json({ error: 'Erro ao buscar tarefas' });
  }
});

// GET /tasks/:id → busca uma tarefa por ID
app.get('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM tarefas WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Tarefa não encontrada' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[GET /tasks/:id]', err.message);
    res.status(500).json({ error: 'Erro ao buscar tarefa' });
  }
});

// POST /tasks → cria uma nova tarefa
app.post('/tasks', async (req, res) => {
  try {
    const { titulo, descricao, disciplina, data_entrega } = req.body;
    if (!titulo || !disciplina) {
      return res.status(400).json({ error: 'titulo e disciplina são obrigatórios' });
    }
    const result = await pool.query(
      'INSERT INTO tarefas (titulo, descricao, disciplina, data_entrega) VALUES ($1, $2, $3, $4) RETURNING *',
      [titulo, descricao || null, disciplina, data_entrega || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('[POST /tasks]', err.message);
    res.status(500).json({ error: 'Erro ao criar tarefa' });
  }
});

// PUT /tasks/:id → atualiza uma tarefa existente
app.put('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descricao, disciplina, concluida, data_entrega } = req.body;
    const result = await pool.query(
      `UPDATE tarefas 
       SET titulo = COALESCE($1, titulo),
           descricao = COALESCE($2, descricao),
           disciplina = COALESCE($3, disciplina),
           concluida = COALESCE($4, concluida),
           data_entrega = COALESCE($5, data_entrega)
       WHERE id = $6 RETURNING *`,
      [titulo, descricao, disciplina, concluida, data_entrega, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Tarefa não encontrada' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[PUT /tasks/:id]', err.message);
    res.status(500).json({ error: 'Erro ao atualizar tarefa' });
  }
});

// DELETE /tasks/:id → remove uma tarefa
app.delete('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM tarefas WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Tarefa não encontrada' });
    res.json({ message: 'Tarefa removida com sucesso', tarefa: result.rows[0] });
  } catch (err) {
    console.error('[DELETE /tasks/:id]', err.message);
    res.status(500).json({ error: 'Erro ao remover tarefa' });
  }
});

// PATCH /tasks/:id/toggle → alterna o status concluida da tarefa
app.patch('/tasks/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'UPDATE tarefas SET concluida = NOT concluida WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Tarefa não encontrada' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[PATCH /tasks/:id/toggle]', err.message);
    res.status(500).json({ error: 'Erro ao alternar status da tarefa' });
  }
});

// ─── Rota de Relatório (local) — na AWS será substituída pelo Lambda ───────────
app.get('/report', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tarefas');
    const tasks = result.rows;
    const total = tasks.length;
    const concluidas = tasks.filter(t => t.concluida === true).length;
    const pendentes = total - concluidas;
    res.json({ total, concluidas, pendentes, timestamp: new Date().toISOString() });
  } catch (err) {
    console.error('[GET /report]', err.message);
    res.status(500).json({ error: 'Falha ao computar relatório: ' + err.message });
  }
});

// ─── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// ─── Start — escuta em 0.0.0.0 para funcionar dentro do container ─────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[API] Servidor rodando na porta ${PORT}`);
});
