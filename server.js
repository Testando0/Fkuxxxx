// O dotenv deve ser a PRIMEIRA coisa do código
require('dotenv').config(); 
const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const HF_TOKEN = process.env.HF_TOKEN;
const MODEL_URL = "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell";

// Log para você conferir no painel do Render se o token carregou
if (!HF_TOKEN) {
    console.error("ERRO CRÍTICO: Variável HF_TOKEN não encontrada! Verifique o painel do Render.");
} else {
    console.log("Token carregado com sucesso: ", HF_TOKEN.substring(0, 5) + "...");
}

app.post('/generate', async (req, res) => {
    try {
        const response = await fetch(MODEL_URL, {
            headers: {
                "Authorization": `Bearer ${HF_TOKEN.trim()}`,
                "Content-Type": "application/json",
                "x-use-cache": "false" // Força uma nova geração
            },
            method: "POST",
            body: JSON.stringify({ 
                inputs: req.body.prompt,
                parameters: { "wait_for_model": true } // Faz a API esperar o modelo carregar
            }),
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error("Resposta do HF:", errorData);
            return res.status(response.status).send(errorData);
        }

        const buffer = Buffer.from(await response.arrayBuffer());
        res.set('Content-Type', 'image/png');
        res.send(buffer);

    } catch (error) {
        console.error("Erro no Servidor:", error);
        res.status(500).send("Erro interno no servidor");
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Rodando na porta ${PORT}`));
