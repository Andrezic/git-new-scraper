const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const path = require('path');

// Fix import corect din /utils/openai.js
const { genereazaLeadAI } = require('./utils/openai');

dotenv.config();
const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('✅ Skyward Scraper server este activ.');
});

app.post('/genereaza', async (req, res) => {
  const firmaId = req.body.firmaId;

  try {
    // Obține firma din CMS Wix
    const firmaResponse = await axios.get(`https://www.skywardflow.com/_functions/firmabyid/${firmaId}`);
    const firma = firmaResponse.data.firma;

    if (!firma) {
      return res.status(404).json({ error: "Firma nu a fost găsită în CMS." });
    }

    console.log("📦 Firma completă primit de la Wix:", JSON.stringify(firma, null, 2));
    console.log("🎯 Email extras din firma:", firma.inputEmailFirma);

    const lead = await genereazaLeadAI(firma);

    if (!lead || !lead.clientNameText) {
      return res.status(500).json({ error: "Leadul generat este invalid." });
    }

    lead.userEmail = firma.inputEmailFirma || "";
    lead.firmaId = firmaId;

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

    console.log("✅ Lead salvat în CMS:", response.data);
    res.status(200).json({ success: true, lead: response.data });

  } catch (error) {
    console.error("❌ Eroare generală:", error?.response?.data || error.message);
    res.status(500).json({ error: error?.response?.data || error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Serverul rulează pe portul ${PORT}`);
});
