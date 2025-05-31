const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { getFirmeFaraLead } = require('./utils/wix-data');
const { genereazaLeadAI } = require('./utils/openai');
const { salveazaLeadInWix } = require('./utils/wix-leads');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('🧠 Skyward Flow AI Server');
});

app.get('/firme-fara-lead', async (req, res) => {
  try {
    console.log('🔄 Pornit GET /firme-fara-lead');
    const firme = await getFirmeFaraLead();

    if (!Array.isArray(firme)) {
      console.error('❌ Răspuns invalid din getFirmeFaraLead');
      return res.status(500).json({ error: 'Răspuns invalid de la getFirmeFaraLead' });
    }

    const firmeFaraLead = firme.filter((firma) => {
      if (!firma.lastGenerated) return true;
      const last = new Date(firma.lastGenerated);
      return isFinite(last.getTime()) && ((Date.now() - last.getTime()) / (1000 * 60)) >= 5;
    });

    console.log(`📊 Firme fără lead recent: ${firmeFaraLead.length}`);
    res.json(firmeFaraLead);
  } catch (err) {
    console.error('❌ Eroare la /firme-fara-lead:', err.message);
    res.status(500).json({ error: 'Eroare la /firme-fara-lead' });
  }
});

app.post('/genereaza', async (req, res) => {
  try {
    const firma = req.body;
    if (!firma || !firma.inputNumeFirma || !firma.inputCodCaen) {
      return res.status(400).json({ error: 'Lipsesc datele firmei' });
    }

    console.log(`📦 Firma utilizator: ${firma.inputNumeFirma}`);
    const rezultat = await genereazaLeadAI(firma);

    if (!rezultat || !rezultat.clientNameText || !rezultat.clientEmailText || !rezultat.mesajCatreClientText) {
      return res.status(200).json({ error: 'Leadul generat este incomplet sau invalid.', lead: rezultat });
    }

    const leadFinal = {
      ...rezultat,
      firmaId: firma._id,
      dataText: new Date().toISOString(),
      status: 'generat'
    };

    await salveazaLeadInWix(leadFinal);
    console.log('✅ Lead salvat cu succes.');
    res.json({ success: true, lead: leadFinal });
  } catch (err) {
    console.error('❌ Eroare generală în procesul de generare/salvare:', err.message);
    res.status(500).json({ error: 'Eroare generală în generarea/salvarea leadului' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server pornit pe portul ${PORT}`);
});