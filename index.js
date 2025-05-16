// index.js

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { trimiteEmailIMM } = require('./backend/emailService');
const { genereazaTextLead } = require('./utils/openai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

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
// Endpoint principal de generație + trimitere
// ==============================================
app.post('/genereaza', async (req, res) => {
  // Extragem payload: firma, lead şi eventual userName
  let { firma, lead, userName } = req.body;

  // Dacă lead-ul vine direct în request, fără wrapper „firma”
  if (!lead && req.body.clientNameText) {
    lead = req.body;
  }
  // Dacă avem userName, îl atașăm lead-ului pentru OpenAI
  if (userName) {
    lead.userName = userName;
  }

  // Setăm fallback pentru firma dacă nu e trimisă
  if (!firma) {
    firma = {
      inputNumeFirma:  lead.inputNumeFirma   || process.env.DEFAULT_NUME_FIRMA   || 'Firma Implicită',
      inputEmailFirma: lead.inputEmailFirma  || process.env.DEFAULT_EMAIL_FIRMA  || '',
      contactAutomat:  process.env.DEFAULT_CONTACT_AUTOMAT === 'true'
    };
  }

  // Validare minimă
  if (!lead.clientNameText || !lead.clientEmailText) {
    return res.status(400).json({ success: false, message: 'Lipsă date client.' });
  }

  try {
    // 1) Generează email folosind OpenAI, inclusiv userName
    const emailBody = await genereazaTextLead(lead);

    // 2) Trimite un singur email către client
    await trimiteEmailIMM({
      inputNumeFirma:       firma.inputNumeFirma,
      clientEmailText:      lead.clientEmailText,
      clientNameText:       lead.clientNameText,
      mesajCatreClientText: emailBody
    });

    return res
      .status(200)
      .json({ success: true, message: 'Email trimis cu succes!', aiEmail: emailBody });
  } catch (err) {
    console.error('❌ Eroare trimitere:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Pornește serverul
app.listen(PORT, () => {
  console.log(`🚀 Server online pe portul ${PORT}`);
});
