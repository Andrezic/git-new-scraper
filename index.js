require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { genereazaLeadAI } = require('./utils/openai');
const { salveazaLead } = require('./utils/wix-leads');
const { getFirmaById } = require('./wix-data');

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
    const { firmaId } = req.body;
    if (!firmaId) return res.status(400).json({ error: 'Lipseste firmaId' });

    const firma = await getFirmaById(firmaId);
    if (!firma) return res.status(404).json({ error: 'Firma nu a fost gasita' });

    console.log('📥 Firma primită:', firma);

    const leadAI = await genereazaLeadAI(firma);

    const leadFinal = {
      ...leadAI,
      firmaId: firma._id,
      status: 'trimis',
      dataText: new Date().toISOString()
    };

    await salveazaLeadNou(leadFinal);

    console.log('✅ Lead generat și salvat:', leadFinal);
    res.status(200).json({ success: true, lead: leadFinal });
  } catch (err) {
    console.error('❌ Eroare în /genereaza:', err);
    res.status(500).json({ error: 'Eroare server la generare lead' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server pornit pe portul ${PORT}`);
});
