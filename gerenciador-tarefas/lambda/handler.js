// Função Lambda que consulta as tarefas do backend e retorna um resumo simples de relatório
import fetch from 'node-fetch';

export const handler = async (event) => {
    try {
        // NA AWS: Altere para a URL pública do seu ECS Fargate (ou API Gateway direcionando pro Back) 
        const response = await fetch('http://backend:3000/tasks'); 
        const tasks = await response.json();
        
        const total = tasks.length;
        const concluidas = tasks.filter(t => t.concluida === true).length;
        const pendentes = total - concluidas;
        
        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*" // Evita problemas de CORS na nuvem
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
            body: JSON.stringify({ error: "Falha ao computar relatório: " + error.message })
        };
    }
};