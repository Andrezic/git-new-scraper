
const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const { genereazaLeadAI } = require('./utils/openai');

dotenv.config();
const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('✅ Skyward Flow backend este activ.');
});

app.post('/genereaza', async (req, res) => {
  const { firmaUtilizator, leadPropus } = req.body;

  if (!firmaUtilizator || !leadPropus) {
    return res.status(400).json({ error: 'Lipsesc datele firmei sau ale leadului.' });
  }

  try {
    console.log('📦 Firma utilizator:', firmaUtilizator.inputNumeFirma);
    console.log('🎯 Lead propus:', leadPropus.clientNameText);

    const rezultat = await genereazaLeadAI({ firmaUtilizator, leadPropus });

    // Parsăm rezultatul text în JSON dacă e posibil
    let parsed;
    try {
      parsed = JSON.parse(rezultat);
    } catch (e) {
      console.warn('⚠️ Răspuns AI nu este JSON. Returnăm ca text.');
      return res.status(200).json({ mesaj: rezultat });
    }

    console.log('✅ Lead generat și validat de AI.');
    res.status(200).json({ success: true, lead: parsed });

  } catch (err) {
    console.error('❌ Eroare în generarea leadului:', err.message || err);
    res.status(500).json({ error: err.message || 'Eroare necunoscută' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Serverul rulează pe portul ${PORT}`);
});
