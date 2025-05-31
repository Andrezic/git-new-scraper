
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');
const { genereazaLead } = require('./utils/openai');
const { salveazaLead } = require('./utils/wix-leads');
const { getFirmeFaraLead } = require('./utils/wix-data');

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/', (req, res) => {
  res.send('✅ Server funcționează!');
});

// POST /genereaza - generează lead pentru o firmă dată
app.post('/genereaza', async (req, res) => {
  try {
    const firma = req.body.firma || req.body;
    console.log("📥 Firma primită:", firma);

    if (!firma || !firma.inputNumeFirma || !firma.inputCodCaen) {
      console.warn("⚠️ Verificare eșuată: lipsesc câmpuri esențiale");
      return res.status(400).json({ error: "Lipsesc datele firmei" });
    }

    console.log("🧠 Apelez genereazaLead...");
    const rezultat = await genereazaLead(firma);
    console.log("✅ Răspuns genereazaLead:", rezultat);

    if (rezultat.error) {
      console.warn("⚠️ Lead invalid:", rezultat);
      return res.json({ lead: rezultat });
    }

    console.log("📦 Apelez salveazaLead...");
    const leadSalvat = await salveazaLead(firma, rezultat);
    console.log("✅ Lead salvat:", leadSalvat);

    res.json({ success: true, lead: leadSalvat });
  } catch (err) {
    console.error("❌ Eroare în /genereaza:", err);
    res.status(500).json({ error: "Eroare server la generare lead", details: err.message });
  }
});

// GET /firme-fara-lead - returnează firmele care nu au primit încă lead
app.get('/firme-fara-lead', async (req, res) => {
  try {
    console.log("🔄 Pornit GET /firme-fara-lead");
    const firme = await getFirmeFaraLead();
    res.json(firme);
  } catch (err) {
    console.error("❌ Eroare la /firme-fara-lead:", err.message);
    res.status(500).json({ error: "Eroare server la obținere firme" });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server pornit pe portul ${port}`);
});
