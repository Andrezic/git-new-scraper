const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const { genereazaLeadAI } = require('./utils/openai');
const { salveazaLead } = require('./utils/wix-leads');
const { getFirmaById } = require('./utils/wix-data');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json({ limit: '1mb' }));

// ================== TEST POST LOCAL ==================
app.post('/genereaza', async (req, res) => {
  try {
    const { firmaId, leadPropus } = req.body;

    if (!firmaId || !leadPropus) {
      return res.status(400).json({ error: 'Lipsesc datele firmei sau ale leadului propus' });
    }

    const firma = await getFirmaById(firmaId);
    if (!firma || !firma.inputNumeFirma) {
      return res.status(404).json({ error: 'Firma nu a fost găsită în baza de date' });
    }

    const raspunsAI = await genereazaLeadAI({ firmaUtilizator: firma, leadPropus });
    const json = JSON.parse(raspunsAI);

    if (json.error) {
      return res.status(200).json({ success: true, lead: json });
    }

    // Salvează lead valid în CMS
    await salveazaLead(firmaId, json);
    return res.status(200).json({ success: true, lead: json });

  } catch (err) {
    console.error('❌ Eroare la generare:', err.message);
    return res.status(500).json({ error: 'Eroare server la generare lead' });
  }
});

// ================== HEALTHCHECK ==================
app.get('/', (req, res) => {
  res.send('✅ Skyward Flow AI Server Live');
});

app.listen(PORT, () => {
  console.log(`🚀 Server pornit pe portul ${PORT}`);
});
