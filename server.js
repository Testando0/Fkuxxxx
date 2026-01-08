const express = require('express');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
app.use(express.json());

// Serve o arquivo HTML automaticamente
app.use(express.static(path.join(__dirname)));

const HF_TOKEN = process.env.HF_TOKEN;
const MODEL_URL = "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell";

app.post('/generate', async (req, res) => {
    try {
        const response = await fetch(MODEL_URL, {
            headers: {
                Authorization: `Bearer ${HF_TOKEN}`,
                "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({ inputs: req.body.prompt }),
        });

        if (!response.ok) {
            const error = await response.json();
            return res.status(response.status).json(error);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        res.set('Content-Type', 'image/png');
        res.send(buffer);
    } catch (error) {
        res.status(500).json({ error: "Erro interno no servidor" });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Rodando na porta ${PORT}`));
