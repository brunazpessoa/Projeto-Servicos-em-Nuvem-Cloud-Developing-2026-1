// Inicializa o servidor Express, configura rotas de tarefas e conecta ao banco de dados
import express from 'express';
import cors from 'cors';
import pool, { connectDB } from './db/pool.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 1. READ ALL (Listar)
app.get('/tasks', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tarefas ORDER BY data_entrega ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. CREATE (Criar)
app.post('/tasks', async (req, res) => {
  const { titulo, descricao, disciplina, data_entrega } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO tarefas (titulo, descricao, disciplina, data_entrega) VALUES ($1, $2, $3, $4) RETURNING *',
      [titulo, descricao, disciplina, data_entrega || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. UPDATE (Atualizar status de conclusão)
app.put('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { concluida } = req.body;
  try {
    const result = await pool.query(
      'UPDATE tarefas SET concluida = $1 WHERE id = $2 RETURNING *',
      [concluida, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Tarefa não encontrada' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. DELETE (Excluir)
app.delete('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM tarefas WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Tarefa não encontrada' });
    res.json({ deleted: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rota de relatório que calcula quantas tarefas existem, quantas foram concluídas e quantas ainda estão pendentes
app.get('/report', async (_req, res) => {
  try {
    const tasksRes = await pool.query('SELECT * FROM tarefas');
    const tasks = tasksRes.rows;
    const total = tasks.length;
    const concluidas = tasks.filter(t => t.concluida === true).length;
    res.json({ total, concluidas, pendentes: total - concluidas });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

async function bootstrap() {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`API rodando na porta ${PORT}`));
  } catch (err) {
    console.error('Falha ao iniciar backend:', err.message);
    process.exit(1);
  }
}
bootstrap();