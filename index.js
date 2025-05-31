const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { genereazaLead } = require('./utils/openai');
const { getFirmaById } = require('./utils/wix-data');
const { salveazaLead } = require('./utils/wix-leads');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// ✅ GET /firme-fara-lead – aici decizi tu cum identifici firmele fără leaduri (temporar e gol)
app.get('/firme-fara-lead', async (req, res) => {
  console.log('🔄 Pornit GET /firme-fara-lead');
  try {
    return res.status(200).json({ message: 'Temporar gol – TODO logica' });
  } catch (err) {
    console.error('❌ Eroare la getFirmeFaraLead:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// ✅ POST /genereaza
app.post('/genereaza', async (req, res) => {
  console.log('🔄 POST /genereaza');

  const firmaId = req.body?.firmaId;
  if (!firmaId) {
    return res.status(400).json({ error: 'Lipsesc datele firmei' });
  }

  try {
    const firma = await getFirmaById(firmaId);
    if (!firma) {
      return res.status(404).json({ error: 'Firma nu a fost găsită' });
    }

    const lead = await genereazaLead(firma);
    if (!lead || !lead.clientNameText || !lead.clientEmailText) {
      console.log('⚠️ Lead invalid:', lead);
      return res.status(400).json({ error: 'Leadul generat este incomplet sau invalid' });
    }

    const rezultat = await salveazaLead(firmaId, lead);
    return res.status(200).json(rezultat);
  } catch (err) {
    console.error('❌ Eroare generare lead:', err);
    return res.status(500).json({ error: 'Eroare server la generare lead' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server pornit pe portul ${PORT}`);
});
