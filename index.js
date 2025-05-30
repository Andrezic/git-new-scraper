const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const path = require('path');
const { genereazaLeadAI } = require('./utils/openai'); // funcție redenumită

dotenv.config();
const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('✅ Skyward Scraper server este activ.');
});

app.post('/genereaza', async (req, res) => {
  const firmaId = req.body.firmaId;

  if (!firmaId) {
    console.warn('⚠️ Lipsă firmaId în body.');
    return res.status(400).json({ error: "firmaId este obligatoriu." });
  }

  try {
    console.log(`📩 Primit request pentru firmaId: ${firmaId}`);

    // Obține firma din CMS Wix
    const firmaResponse = await axios.get(`https://www.skywardflow.com/_functions/firmabyid/${firmaId}`);
    const firma = firmaResponse.data.firma;

    if (!firma) {
      console.warn("⚠️ Firma nu a fost găsită în CMS.");
      return res.status(404).json({ error: "Firma nu a fost găsită în CMS." });
    }

    console.log("📦 Firma primită din Wix:\n", JSON.stringify(firma, null, 2));
    console.log("📨 Email firmă:", firma.inputEmailFirma);

    // Generează lead cu AI
    const lead = await genereazaLeadAI(firma);

    if (!lead || !lead.clientNameText) {
      console.error("❌ Leadul generat este invalid:\n", lead);
      return res.status(500).json({ error: "Leadul generat este invalid." });
    }

    // Adaugă metadate înainte de salvare
    lead.userEmail = firma.inputEmailFirma || "";
    lead.firmaId = firmaId;

    console.log("📬 Lead generat:\n", JSON.stringify(lead, null, 2));

    // Trimite leadul în CMS Wix
    const response = await axios.post(
      'https://www.skywardflow.com/_functions/genereaza',
      lead,
      {
        headers: {
          'Authorization': 'SecretKeySkyward',
          'Content-Type': 'application/json'
        }
      }
    );

    console.log("✅ Lead salvat în CMS cu succes.");
    res.status(200).json({ success: true, lead: response.data });

  } catch (error) {
    console.error("❌ Eroare generală în procesul de generare/salvare:\n", error?.response?.data || error.message);
    res.status(500).json({ error: error?.response?.data || error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Serverul Skyward Flow rulează pe portul ${PORT}`);
});
