const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const { genereazaLeadAI } = require('./utils/openai');
const { getFirmaById } = require('./utils/wix-data');
const { salveazaLeadNou } = require('./utils/wix-leads');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('✅ Serverul funcționează!');
});

app.get('/firme-fara-lead', async (req, res) => {
  console.log('🔄 Pornit GET /firme-fara-lead');
  try {
    const response = await getFirmaById(null, true); // true = doar firme fără lead
    if (!response) {
      return res.status(404).json({ error: 'Nicio firmă fără leaduri disponibile' });
    }
    res.json(response);
  } catch (error) {
    console.error('❌ Eroare la getFirmeFaraLead:', error.message);
    res.status(500).json({ error: 'Eroare la obținerea firmelor fără lead' });
  }
});

app.post('/genereaza', async (req, res) => {
  const { firmaId } = req.body;
  console.log('🔧 POST /genereaza firmaId:', firmaId);

  try {
    const firma = await getFirmaById(firmaId);
    if (!firma || !firma.inputNumeFirma) {
      return res.status(400).json({ error: 'Lipsesc datele firmei' });
    }

    console.log('📦 Firma primită:', firma);

    // TODO: Aici vei avea nevoie de un sistem real de generare leaduri prin scraping
    const leadPropus = {
      clientNameText: 'Nume Client Test',
      clientEmailText: 'client@exemplu.com',
      clientTelefonText: '0712345678',
      clientWebsiteText: 'https://www.exemplu.com',
    };

    // Apel GPT pentru generarea mesajului personalizat
    const rezultatAI = await genereazaLeadAI({ firmaUtilizator: firma, leadPropus });

    const leadFinal = {
      ...leadPropus,
      mesajCatreClientText: rezultatAI.mesajFinal,
      firmaId: firma._id,
      status: 'trimis',
      dataText: new Date().toISOString()
    };

    const rezultatSalvare = await salveazaLeadNou(leadFinal);

    res.json({ mesaj: 'Lead generat și salvat cu succes', lead: rezultatSalvare });
  } catch (error) {
    console.error('❌ Eroare în /genereaza:', error.message);
    res.status(500).json({ error: 'Eroare server la generare lead' });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server pornit pe portul ${port}`);
});
