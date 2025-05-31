// index.js

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { genereazaLead } = require('./utils/openai');     // ✅ Import corect
const { salveazaLead } = require('./utils/wix-leads');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('✅ Skyward Flow AI backend funcționează.');
});

app.post('/genereaza', async (req, res) => {
  try {
    const firma = req.body.firma;

    if (!firma || !firma.firmaId) {
      return res.status(400).json({ error: 'Lipseste firmaId' });
    }

    console.log('📥 Firma primită:', firma);

    const lead = await genereazaLead(firma);
    const rezultat = await salveazaLead(lead, firma.firmaId);

    console.log('✅ Lead generat și salvat cu succes!');
    res.json(rezultat);
  } catch (e) {
    console.error('❌ Eroare server la /genereaza:', e);
    res.status(500).json({ error: 'Eroare server la generare lead' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server pornit pe portul ${PORT}`);
});
