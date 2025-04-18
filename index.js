// index.js
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');
const { genereazaTextLead } = require('./utils/openai.js');

dotenv.config();

const app = express();
const port = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('🌐 Skyward Scraper API Live');
});

app.post('/genereaza', async (req, res) => {
  console.log("📥 Request primit:", req.body);

  const { firmaId, clientNameText, clientEmailText } = req.body;

  if (!firmaId || !clientNameText || !clientEmailText) {
    return res.status(400).json({ error: "Lipsesc câmpuri esențiale: firmaId, nume sau email." });
  }

  try {
    // 1. Extragem profilul firmei din Wix
    const profilRes = await axios.get(`https://www.skywardflow.com/_api/profilfirme/${firmaId}`);
    const profilFirma = profilRes.data;

    // 2. Generăm mesajul AI
    const clientRequestText = await genereazaTextLead(profilFirma);

    // 3. Trimitem leadul spre salvare în Wix CMS
    const response = await axios.post('https://www.skywardflow.com/_functions/genereaza', {
      clientNameText,
      clientEmailText,
      clientRequestText,
      dataText: new Date().toISOString(),
      status: "Nou",
      firmaId
    });

    console.log("✅ Lead salvat în Wix:", response.data);
    res.status(200).json({
      success: true,
      message: 'Lead generat de AI și salvat cu succes!',
      data: response.data
    });

  } catch (error) {
    console.error("❌ Eroare generală în fluxul AI → Wix:", error.response?.data || error.message);
    res.status(500).json({
      error: "Eroare la generarea sau trimiterea leadului.",
      details: error.response?.data || error.message
    });
  }
});

app.listen(port, () => {
  console.log(`✅ Serverul rulează pe portul ${port}`);
});
