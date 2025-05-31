const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const wixData = require('./utils/wix-data');
const genereazaLeadAI = require('./utils/openai').genereazaLeadAI;

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.post('/genereaza', async (req, res) => {
  try {
    const firma = req.body;
    if (!firma || !firma.inputNumeFirma || !firma.inputEmailFirma) {
      return res.status(400).json({ error: 'Lipsesc datele firmei' });
    }

    const rezultat = await genereazaLeadAI(firma);
    if (!rezultat || rezultat.error) {
      return res.status(400).json({ error: rezultat?.error || 'Eroare generare lead' });
    }

    return res.status(200).json({ success: true, lead: rezultat });
  } catch (err) {
    console.error("❌ Eroare generală în procesul de generare/salvare:", err);
    return res.status(500).json({ error: 'Eroare internă server' });
  }
});

app.get('/firme-fara-lead', async (req, res) => {
  try {
    const toateFirmele = await wixData.importProfilFirme();
    const firmeFiltrate = toateFirmele.filter(firma =>
      !firma.ultimaGenerare || firma.ultimaGenerare.trim() === ""
    );

    console.log(`🔎 Găsite ${firmeFiltrate.length} firme fără lead.`);

    res.status(200).json({ firme: firmeFiltrate });
  } catch (err) {
    console.error("❌ Eroare la /firme-fara-lead:", err);
    res.status(500).json({ error: 'Eroare internă în extragerea firmelor' });
  }
});

app.listen(port, () => {
  console.log(`🚀 Serverul rulează la http://localhost:${port}`);
});