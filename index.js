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

// Endpoint de testare email – rămâne neschimbat
app.post('/test-email', async (req, res) => {
  try {
    await trimiteEmailIMM({
      numeFirma: 'Vand Mere.SRL',
      emailDestinatar: 'skywardflow@gmail.com',
      clientName: 'Cumpar Mere.SRL',
      clientRequest: 'Suntem interesați de oferta dumneavoastră.'
    });
    res.status(200).json({ success: true, message: 'Email de test trimis cu succes!' });
  } catch (err) {
    console.error('❌ Eroare test email:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Endpointul principal care generează și trimite emailuri
app.post('/genereaza', async (req, res) => {
  let { firma, lead } = req.body;
  if (!lead && req.body.clientNameText) lead = req.body;

  // Stub pentru firma dacă lipsește
  if (!firma) {
    firma = {
      inputNumeFirma: process.env.DEFAULT_NUME_FIRMA,
      inputEmailFirma: process.env.DEFAULT_EMAIL_FIRMA,
      contactAutomat: process.env.DEFAULT_CONTACT_AUTOMAT === 'true'
    };
  }

  // Validări de bază
  if (!lead.clientNameText || !lead.clientEmailText) {
    return res.status(400).json({ success: false, message: 'Lipsă date client.' });
  }

  try {
    // 1) Generează email AI
    const emailBody = await genereazaTextLead({ ...lead });

    // 2) Trimite email AI către adresa fixă skywardflow@gmail.com
    await trimiteEmailIMM({
      numeFirma: firma.inputNumeFirma,
      emailDestinatar: 'skywardflow@gmail.com',
      clientName: lead.clientNameText,
      clientRequest: emailBody
    });

    // 3) Trimite email către firma ta (default)
    await trimiteEmailIMM({
      numeFirma: firma.inputNumeFirma,
      emailDestinatar: firma.inputEmailFirma,
      clientName: lead.clientNameText,
      clientRequest: emailBody
    });

    // 4) Dacă e activ contactul automat, trimite și clientului lead
    if (firma.contactAutomat) {
      await trimiteEmailIMM({
        numeFirma: firma.inputNumeFirma,
        emailDestinatar: lead.clientEmailText,
        clientName: firma.inputNumeFirma,
        clientRequest: emailBody
      });
    }

    return res
      .status(200)
      .json({ success: true, message: 'Emailuri trimise cu succes!', aiEmail: emailBody });
  } catch (err) {
    console.error('❌ Eroare trimitere:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Pornește server Express
app.listen(PORT, () => {
  console.log(`🚀 Server online pe portul ${PORT}`);
});