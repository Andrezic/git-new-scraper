// index.js

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { trimiteEmailIMM } = require('./backend/emailService');
const { genereazaTextLead } = require('./utils/openai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

// Conectare MongoDB
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('🗄️ Conectat la MongoDB'))
  .catch(err => console.error('❌ Eroare MongoDB:', err));

// Definire schema și model pentru "Leaduri"
const leadSchema = new mongoose.Schema({
  inputCodCaen: String,
  inputCui: String,
  inputNumarAngajati: String,
  inputNumeFirma: String,
  inputServicii: String,
  inputPreturi: String,
  inputAvantaje: String,
  inputTelefonFirma: String,
  inputEmailFirma: String,
  inputWebsiteFirma: String,
  inputLocalizare: String,
  inputDescriere: String,
  inputTipClienti: String,
  inputDimensiuneClient: String,
  inputKeywords: String,
  inputCerinteExtra: String,
  inputTintireGeo: String,
  firmaId: String,
  clientNameText: String,
  clientEmailText: String,
  clientTelefonText: String,
  aiEmail: String,
  createdAt: { type: Date, default: Date.now }
});
const Lead = mongoose.model('Lead', leadSchema);

app.use(cors());
app.use(bodyParser.json());

// ==============================================
// Endpoint de testare email
// ==============================================
app.post('/test-email', async (req, res) => {
  try {
    await trimiteEmailIMM({
      inputNumeFirma:       'Vand Mere.SRL',
      clientEmailText:      'skywardflow@gmail.com',
      clientNameText:       'Cumpar Mere.SRL',
      mesajCatreClientText: 'Suntem interesați de oferta dumneavoastră.'
    });
    res.status(200).json({ success: true, message: 'Email de test trimis cu succes!' });
  } catch (err) {
    console.error('❌ Eroare test email:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==============================================
// Endpoint principal de generație + trimitere + salvare
// ==============================================
app.post('/genereaza', async (req, res) => {
  let { firma, lead } = req.body;

  // Dacă trimite direct datele lead fără wrapper „firma”
  if (!lead && req.body.clientNameText) {
    lead = req.body;
  }

  // Fallback pentru firma, dacă nu e trimisă în payload
  if (!firma) {
    firma = {
      inputNumeFirma:  process.env.DEFAULT_NUME_FIRMA   || 'Firma Implicită',
      inputEmailFirma: process.env.DEFAULT_EMAIL_FIRMA  || '',
      contactAutomat:  process.env.DEFAULT_CONTACT_AUTOMAT === 'true'
    };
  }

  // Validare minimă
  if (!lead.clientNameText || !lead.clientEmailText) {
    return res.status(400).json({ success: false, message: 'Lipsă date client.' });
  }

  try {
    // 1) Generează conținutul email-ului prin OpenAI
    const emailBody = await genereazaTextLead({ ...lead });

    // Adăugăm textul AI la obiectul lead pentru salvare
    const fullLead = { ...lead, aiEmail: emailBody };

    // 2) Salvează leadul în colecția Leaduri
    const saved = await Lead.create(fullLead);
    console.log('💾 Lead salvat în DB:', saved._id);

    // 3) Trimite întâi intern, către noi
    await trimiteEmailIMM({
      inputNumeFirma:       firma.inputNumeFirma,
      clientEmailText:      'skywardflow@gmail.com',
      clientNameText:       lead.clientNameText,
      mesajCatreClientText: emailBody
    });

    // 4) Trimite apoi către adresa firmei tale, dacă e definită
    if (firma.inputEmailFirma) {
      await trimiteEmailIMM({
        inputNumeFirma:       firma.inputNumeFirma,
        clientEmailText:      firma.inputEmailFirma,
        clientNameText:       lead.clientNameText,
        mesajCatreClientText: emailBody
      });
    } else {
      console.warn('⚠️ DEFAULT_EMAIL_FIRMA nu este setat; sărtăm trimiterea către firmă.');
    }

    // 5) Dacă ai activat contactul automat, trimite și clientului lead
    if (firma.contactAutomat) {
      await trimiteEmailIMM({
        inputNumeFirma:       firma.inputNumeFirma,
        clientEmailText:      lead.clientEmailText,
        clientNameText:       firma.inputNumeFirma,
        mesajCatreClientText: emailBody
      });
    }

    return res
      .status(200)
      .json({ success: true, message: 'Lead creat și emailuri trimise cu succes!', leadId: saved._id, aiEmail: emailBody });
  } catch (err) {
    console.error('❌ Eroare trimitere/salvare:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Pornește serverul
app.listen(PORT, () => {
  console.log(`🚀 Server online pe portul ${PORT}`);
});
