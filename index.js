const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const { importProfilFirme } = require('./utils/wix-data');
const { genereazaLeadAI } = require('./utils/openai');
const { salveazaLead } = require('./utils/salvare-lead');
const { v4: uuidv4 } = require('uuid');

dotenv.config();
const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Skyward Flow server e activ 🚀');
});

app.post('/genereaza', async (req, res) => {
  try {
    const firma = req.body;
    if (!firma || !firma.inputNumeFirma || !firma._id) {
      console.error("❌ Lipsesc datele firmei:", firma);
      return res.status(400).json({ error: 'Date firmă invalide' });
    }

    const rezultat = await genereazaLeadAI(firma);

    if (!rezultat || !rezultat.clientNameText || !rezultat.clientEmailText || !rezultat.mesajCatreClientText) {
      console.error("❌ Leadul generat nu e valid:", rezultat);
      return res.status(400).json({ error: 'Lead invalid generat' });
    }

    const lead = {
      _id: uuidv4(),
      firmaId: firma._id,
      ...rezultat,
      status: 'nou',
      dataText: new Date().toISOString()
    };

    await salveazaLead(lead);

    console.log("✅ Lead salvat:", lead.clientNameText);
    res.json({ success: true, lead });
  } catch (err) {
    console.error("❌ Eroare generală în procesul de generare/salvare:", err.message);
    res.status(500).json({ error: 'Eroare internă' });
  }
});

// Endpoint nou pentru cronjob
app.get('/firme-fara-lead', async (req, res) => {
  try {
    console.log("🔍 Caut firme fără lead generat recent...");
    const firme = await importProfilFirme();

    const firmeFaraLead = firme.filter((firma) => {
      const last = firma.lastGenerated;
      if (!last) return true;

      const lastDate = new Date(last);
      const diffMinutes = (Date.now() - lastDate.getTime()) / (1000 * 60);
      return diffMinutes >= 5;
    });

    console.log(`📦 ${firmeFaraLead.length} firme fără lead recent`);
    res.json({ firme: firmeFaraLead });
  } catch (err) {
    console.error("❌ Eroare la /firme-fara-lead:", err.message);
    res.status(500).json({ error: 'Eroare internă la /firme-fara-lead' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Serverul rulează pe portul ${PORT}`);
});