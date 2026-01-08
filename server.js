require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const HF_TOKEN = process.env.HF_TOKEN ? process.env.HF_TOKEN.trim() : "";

// URL USANDO O ROUTER OFICIAL (Melhor para fidelidade e pouca fila)
const MODEL_URL = "https://router.huggingface.co/ByteDance/SDXL-Lightning";

app.post('/generate', async (req, res) => {
    if (!HF_TOKEN) return res.status(500).json({ error: "HF_TOKEN não configurado no Render." });

    try {
        const hfResponse = await fetch(MODEL_URL, {
            headers: {
                "Authorization": `Bearer ${HF_TOKEN}`,
                "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({ 
                inputs: req.body.prompt,
                // O Router gerencia a fila automaticamente com este parâmetro
                parameters: { "wait_for_model": true } 
            }),
        });

        if (!hfResponse.ok) {
            const errorData = await hfResponse.json();
            console.error("Erro do Router:", errorData);
            return res.status(hfResponse.status).json({ error: errorData.error || "Erro no Hugging Face" });
        }

        const buffer = Buffer.from(await hfResponse.arrayBuffer());
        res.set('Content-Type', 'image/png');
        res.send(buffer);

    } catch (error) {
        console.error("Erro no Servidor:", error);
        res.status(500).json({ error: "Falha na comunicação com o servidor." });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Rodando com Router na porta ${PORT}`));
