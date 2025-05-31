require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { genereazaLeadAI } = require('./utils/openai');
const { salveazaLead } = require('./utils/wix-leads');
const { getFirmaById } = require('./utils/wix-data');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// 🔄 GET endpoint pentru debug (cronjob)
app.get('/firme-fara-lead', async (req, res) => {
  console.log('🔄 Pornit GET /firme-fara-lead');
  res.status(404).json({ error: 'Endpoint în curs de implementare' });
});

// ✅ POST endpoint pentru generare lead
app.post('/genereaza', async (req, res) => {
  try {
    const firma = req.body.firma;

    console.log("📥 Firma primită:", firma);

    if (!firma || !firma.firmaId) {
      return res.status(400).json({ error: "Lipseste firmaId" });
    }

    const rezultat = await genereazaLead(firma);

    if (rezultat.error) {
      return res.status(500).json({ error: rezultat.error });
    }

    return res.json({ success: true, lead: rezultat });
  } catch (e) {
    console.error("❌ Eroare în /genereaza:", e);
    return res.status(500).json({ error: "Eroare server la generare lead" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server pornit pe portul ${PORT}`);
});
