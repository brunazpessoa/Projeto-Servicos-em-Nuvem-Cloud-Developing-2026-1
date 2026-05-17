CREATE TABLE IF NOT EXISTS tarefas (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    disciplina VARCHAR(100) NOT NULL,
    concluida BOOLEAN DEFAULT FALSE,
    data_entrega DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dados iniciais para o relatório não virar vazio
INSERT INTO tarefas (titulo, descricao, disciplina, concluida, data_entrega) 
VALUES 
('Projeto de Nuvem', 'Entregar o CRUD com Docker e AWS', 'Serviços em Nuvem', false, '2026-06-01'),
('Estudar para P2', 'Revisar conceitos de Redes', 'Redes de Computadores', true, '2026-05-20'),
('Analisar dados', 'Preparar amostras e gerar gráficos exploratórios', 'Ciencia de Dados', false, '2026-06-05'),
('Resolver listas de exercícios', 'Fazer os problemas de integração e limites', 'Calculo I', false, '2026-05-25'),
('Praticar listening', 'Ouvir áudios em inglês e responder perguntas', 'Ingles', false, '2026-06-10');