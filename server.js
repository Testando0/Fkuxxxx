require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

const HF_TOKEN = process.env.HF_TOKEN ? process.env.HF_TOKEN.trim() : "";
// SDXL-Turbo é o modelo mais rápido e menos disputado no Router
const MODEL_URL = "https://router.huggingface.co/stabilityai/sdxl-turbo";

app.post('/generate', async (req, res) => {
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

        const buffer = Buffer.from(await response.arrayBuffer());
        res.set('Content-Type', 'image/png');
        res.send(buffer);
    } catch (e) {
        res.status(500).json({ error: "Servidor instável, tente novamente." });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Online na porta ${PORT}`));
