const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const { genereazaLeadAI } = require('./utils/openai.js');

dotenv.config();
const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

app.post('/genereaza', async (req, res) => {
  const firmaId = req.body.firmaId;

  try {
    // 🔍 Caută firma în colecția ProfilFirme
    const firmaResponse = await axios.get(`https://www.skywardflow.com/_functions/firmabyid/${firmaId}`);
    const firma = firmaResponse.data.firma;

    if (!firma) {
      return res.status(404).json({ error: "Firma nu a fost găsită în CMS." });
    }

    // ✅ Log complet pentru debugging
    console.log("✅ Firma completă:", JSON.stringify(firma, null, 2));
    console.log("🎯 Email extras din firma:", firma.inputEmailFirma);

    // 🧠 Generează lead cu AI
    const lead = await genereazaLeadAI(firma);

    if (!lead || !lead.clientNameText) {
      return res.status(500).json({ error: "Leadul generat de AI este invalid." });
    }

    // ✅ Adaugă userEmail din firma și firmaId
    lead.userEmail = firma.inputEmailFirma;
    lead.firmaId = firmaId;

    console.log("📩 Email utilizator pentru dashboard:", lead.userEmail);

    // 🚀 Trimite leadul complet la Wix
    const cmsResponse = await axios.post(
      'https://www.skywardflow.com/_functions/genereaza',
      lead,
      {
        headers: {
          'Authorization': 'SecretKeySkyward',
          'Content-Type': 'application/json'
        }
      }
    );

    console.log("✅ Lead salvat:", cmsResponse.data);
    res.status(200).json({ success: true, lead: cmsResponse.data });

  } catch (error) {
    console.error("❌ Eroare generală:", error?.response?.data || error.message);
    res.status(500).json({ error: error?.response?.data || error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Serverul rulează pe portul ${PORT}`);
});
