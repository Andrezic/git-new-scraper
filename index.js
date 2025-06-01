const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { getFirmeFaraLead, getFirmaById } = require('./utils/wix-data');
const { salveazaLead } = require('./utils/wix-leads');
const { genereazaLeadAI } = require('./utils/openai'); // ✅ IMPORT CORECT
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

app.get('/firme-fara-lead', async (req, res) => {
  try {
    const firme = await getFirmeFaraLead();
    res.json(firme);
  } catch (error) {
    console.error('❌ Eroare la getFirmeFaraLead:', error.message);
    res.status(500).json({ error: 'Eroare server la getFirmeFaraLead' });
  }
});

app.post('/genereaza', async (req, res) => {
  try {
    const firma = req.body.firma || req.body.firmaUtilizator;

    if (!firma || !firma.firmaId) {
      return res.status(400).json({ error: 'Lipseste firmaId' });
    }

    console.log('📥 Firma primită:', firma);

    console.log('📦 Firma trimisă la AI:', JSON.stringify(firma, null, 2));

    const lead = await genereazaLeadAI(firma);

    console.log('🧠 Lead returnat de AI:', JSON.stringify(lead, null, 2));

    if (!lead || !lead.clientNameText || !lead.clientEmailText || !lead.mesajCatreClientText) {
      return res.status(500).json({ error: 'Lead generat incomplet sau invalid' });
    }

    const salvat = await salveazaLead(lead, firma.firmaId);

    console.log('✅ Lead generat și salvat:', salvat);

    res.status(200).json({ mesaj: 'Lead generat cu succes', lead });
  } catch (error) {
    console.error('❌ Eroare server la /genereaza:', error);
    res.status(500).json({ error: 'Eroare server la generare lead' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server pornit pe portul ${PORT}`);
});
