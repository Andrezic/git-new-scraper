// index.js

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { trimiteEmailIMM } = require('./backend/emailService');
const { genereazaTextLead } = require('./utils/openai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
// Email intern pentru notificări
const INTERNAL_EMAIL = process.env.INTERNAL_EMAIL || 'skywardflow@gmail.com';

app.use(cors());
app.use(bodyParser.json());

app.post('/genereaza', async (req, res) => {
  let { firma, lead, userName } = req.body;

  // Dacă lead vine direct
  if (!lead && req.body.clientNameText) {
    lead = req.body;
  }
  // Atașăm userName dacă există
  if (userName) lead.userName = userName;

  // Fallback firma
  if (!firma) {
    firma = {
      inputNumeFirma:  lead.inputNumeFirma   || process.env.DEFAULT_NUME_FIRMA   || 'Firma Implicită',
      inputEmailFirma: lead.inputEmailFirma  || process.env.DEFAULT_EMAIL_FIRMA  || '',
      contactAutomat:  process.env.DEFAULT_CONTACT_AUTOMAT === 'true'
    };
  }

  // Validare minimală
  if (!lead.clientNameText || !lead.clientEmailText) {
    return res.status(400).json({ success: false, message: 'Lipsă date client.' });
  }

  try {
    // Generează conținutul email-ului
    const emailBody = await genereazaTextLead(lead);

    // Trimite email intern (copy)
    await trimiteEmailIMM({
      inputNumeFirma:       firma.inputNumeFirma,
      clientEmailText:      INTERNAL_EMAIL,
      clientNameText:       lead.clientNameText,
      mesajCatreClientText: emailBody
    });

    // Trimite email către client doar dacă switchContactAutomat este activ
    if (lead.switchContactAutomat) {
      await trimiteEmailIMM({
        inputNumeFirma:       firma.inputNumeFirma,
        clientEmailText:      lead.clientEmailText,
        clientNameText:       lead.clientNameText,
        mesajCatreClientText: emailBody
      });
    }

    return res
      .status(200)
      .json({ success: true, message: 'Email intern și către client trimise cu succes!', aiEmail: emailBody });
  } catch (err) {
    console.error('❌ Eroare trimitere:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server online pe portul ${PORT}`);
});
