
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
    console.log('📥 Body primit:', req.body);
    const firma = req.body.firma;
    console.log("📥 Firma primită:", firma);

    if (!firma || !firma.inputNumeFirma || !firma.inputCodCaen) {
      return res.status(400).json({ error: 'Lipsesc datele firmei' });
    }

    const rezultat = await genereazaLead(firma);
    if (rezultat.error) return res.json({ lead: rezultat });

    const leadSalvat = await salveazaLead(firma, rezultat);
    res.json({ success: true, lead: leadSalvat });
  } catch (err) {
    console.error('❌ Eroare în /genereaza:', err);
    res.status(500).json({ error: 'Eroare server la generare lead' });
  }
});

// GET /firme-fara-lead - returnează firmele care nu au primit încă lead
app.get('/firme-fara-lead', async (req, res) => {
  try {
    console.log('🔄 Pornit GET /firme-fara-lead');
    const firme = await getFirmeFaraLead();
    res.json(firme);
  } catch (err) {
    console.error('❌ Eroare la /firme-fara-lead:', err.message);
    res.status(500).json({ error: 'Eroare server la obținere firme' });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server pornit pe portul ${port}`);
});
