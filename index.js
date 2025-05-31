const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const { genereazaLeadAI } = require('./utils/openai'); // <-- corect
const { getFirmaById } = require('./utils/wix-data');
const { salveazaLeadNou } = require('./utils/wix-leads');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

app.post('/genereaza', async (req, res) => {
  const { firmaId } = req.body;
  console.log('🔧 POST /genereaza firmaId:', firmaId);

  try {
    const firma = await getFirmaById(firmaId);
    if (!firma || !firma.inputNumeFirma) {
      return res.status(400).json({ error: 'Lipsesc datele firmei' });
    }

    console.log('📥 Firma primită:', firma);

    const leadPropus = {
      clientNameText: 'Nume Client Test',
      clientEmailText: 'client@exemplu.com',
      clientTelefonText: '0712345678',
      clientWebsiteText: 'https://www.exemplu.com'
    };

    const rezultatAI = await genereazaLeadAI({ firmaUtilizator: firma, leadPropus }); // <-- corect
    const leadFinal = {
      ...leadPropus,
      mesajCatreClientText: rezultatAI.mesajFinal,
      firmaId: firma._id,
      status: 'trimis',
      dataText: new Date().toISOString()
    };

    const rezultatSalvare = await salveazaLeadNou(leadFinal);
    res.json({ mesaj: '✅ Lead generat', lead: rezultatSalvare });

  } catch (error) {
    console.error('❌ Eroare în /genereaza:', error.message);
    res.status(500).json({ error: 'Eroare server la generare lead' });
  }
});
