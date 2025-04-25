// index.js – Versiune finală Skyward Flow, complet sincronizat cu Wix Automation

const express = require('express');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

app.post('/genereaza', async (req, res) => {
  try {
    const lead = req.body;
    console.log("🔁 Trimit către Wix:", lead);

    const wixResp = await fetch('https://www.skywardflow.com/_functions/genereaza', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead)
    });

    if (!wixResp.ok) {
      const errText = await wixResp.text();
      throw new Error(`Eroare de la Wix: ${wixResp.status} - ${errText}`);
    }

    const wixData = await wixResp.json();
    console.log("✅ Răspuns Wix:", wixData);

    const firmaResp = await fetch('https://www.skywardflow.com/_functions/getFirma', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firmaId: lead.firmaId })
    });

    const firma = await firmaResp.json();
    console.log("📦 Firma returnată:", firma);

    // 🔔 Declanșăm automatizarea Wix pentru IMM
    await fetch("https://www.skywardflow.com/_functions/declanseazaEmailIMM", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firmaId: lead.firmaId,
        clientNameText: lead.clientNameText,
        clientEmailText: lead.clientEmailText,
        clientRequestText: lead.clientRequestText
      })
    });

    res.status(200).json({ success: true });

  } catch (err) {
    console.error('❌ Eroare la generare lead:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Serverul rulează pe portul ${PORT}`);
});
