require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const HF_TOKEN = process.env.HF_TOKEN ? process.env.HF_TOKEN.trim() : "";
// URL ATUALIZADA PARA O ROUTER
const MODEL_URL = "https://router.huggingface.co/black-forest-labs/FLUX.1-schnell";

app.post('/generate', async (req, res) => {
    if (!HF_TOKEN) {
        return res.status(500).json({ error: "Token não configurado no Render." });
    }

    try {
        const hfResponse = await fetch(MODEL_URL, {
            headers: {
                "Authorization": `Bearer ${HF_TOKEN}`,
                "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({ 
                inputs: req.body.prompt,
                parameters: { "wait_for_model": true } 
            }),
        });

        if (!hfResponse.ok) {
            const errorMsg = await hfResponse.text();
            console.error("Erro do HF:", errorMsg);
            return res.status(hfResponse.status).json({ error: errorMsg });
        }

        const buffer = Buffer.from(await hfResponse.arrayBuffer());
        res.set('Content-Type', 'image/png');
        res.send(buffer);

    } catch (error) {
        console.error("Erro de conexão:", error);
        res.status(500).json({ error: "Erro de conexão no servidor." });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Rodando na porta ${PORT}`));
