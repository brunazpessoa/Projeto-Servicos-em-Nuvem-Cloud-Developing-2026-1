// Função Lambda que consulta as tarefas do backend e retorna um resumo de relatório
// ATENÇÃO: na AWS, altere BACKEND_URL para a URL pública do seu ALB/ECS ou API Gateway
import fetch from 'node-fetch';

const BACKEND_URL = process.env.BACKEND_URL || 'http://backend:3000';

export const handler = async (event) => {
    try {
        const response = await fetch(`${BACKEND_URL}/tasks`);
        if (!response.ok) throw new Error(`Backend retornou ${response.status}`);
        const tasks = await response.json();

        const total = tasks.length;
        const concluidas = tasks.filter(t => t.concluida === true).length;
        const pendentes = total - concluidas;

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify({
                total,
                concluidas,
                pendentes,
                timestamp: new Date().toISOString()
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ error: "Falha ao computar relatório: " + error.message })
        };
    }
};
