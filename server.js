require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());

// Força o Express a servir o index.html na raiz
app.use(express.static(path.join(__dirname)));

// Rota de teste para saber se o servidor está vivo
app.get('/health', (req, res) => res.send("Servidor OK"));

// ROTA PRINCIPAL (Certifique-se que o fetch no HTML aponta exatamente para /generate)
app.post('/generate', async (req, res) => {
    const HF_TOKEN = process.env.HF_TOKEN ? process.env.HF_TOKEN.trim() : "";
    const MODEL_URL = "https://router.huggingface.co/stabilityai/sdxl-turbo";

    if (!HF_TOKEN) return res.status(500).json({ error: "Token faltando no Render!" });

    try {
        const response = await fetch(MODEL_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${HF_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ 
                inputs: req.body.prompt,
                parameters: { "wait_for_model": true }
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            return res.status(response.status).json({ error: errText });
        }

        const arrayBuffer = await response.arrayBuffer();
        res.set('Content-Type', 'image/png');
        res.send(Buffer.from(arrayBuffer));
    } catch (e) {
        res.status(500).json({ error: "Erro interno: " + e.message });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Rodando na porta ${PORT}`));
