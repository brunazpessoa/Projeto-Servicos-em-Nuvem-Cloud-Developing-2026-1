// Lambda que consulta /tasks via API Gateway e devolve estatísticas (relatório).
// Node 20.x tem fetch nativo — sem necessidade de node_modules.
// Em produção (AWS), API_URL é setada na Lambda com a Invoke URL do API Gateway.

const API_URL = process.env.API_URL || 'http://backend:3000';

export const handler = async (event) => {
    try {
        const response = await fetch(`${API_URL}/tasks`);
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
