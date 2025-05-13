// index.js

const express = require('express');
const cors    = require('cors');
const bodyParser = require('body-parser');
const { trimiteEmailIMM } = require('./backend/emailService');
require('dotenv').config();

const app  = express();
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

  // Dacă nu există wrapper 'lead' și payload este direct lead (din scraper.js)
  if (!lead && req.body.clientNameText) {
    lead = req.body;
  }

  // Stub firma dacă lipsește, până la implementarea fetch-ului din DB în Wix
  if (!firma) {
    firma = {
      inputNumeFirma:  process.env.DEFAULT_NUME_FIRMA  || '',
      inputEmailFirma: process.env.DEFAULT_EMAIL_FIRMA || '',
      contactAutomat:  process.env.DEFAULT_CONTACT_AUTOMAT === 'true'
    };
  }

  // Validări obligatorii
  if (!lead.clientNameText || !lead.clientEmailText || !lead.mesajCatreClientText) {
    return res.status(400).json({
      success: false,
      message: 'Lipsesc datele necesare în lead.'
    });
  }

  try {
    // Trimite email către compania ta
    await trimiteEmailIMM({
      numeFirma:       firma.inputNumeFirma,
      emailDestinatar: firma.inputEmailFirma,
      clientName:      lead.clientNameText,
      clientRequest:   lead.mesajCatreClientText
    });

    // Dacă e setat, trimite și clientului
    if (firma.contactAutomat) {
      await trimiteEmailIMM({
        numeFirma:       firma.inputNumeFirma,
        emailDestinatar: lead.clientEmailText,
        clientName:      firma.inputNumeFirma,
        clientRequest:   lead.mesajCatreClientText
      });
    }

    return res.status(200).json({ success: true, message: 'Emailuri trimise cu succes!' });
  } catch (err) {
    console.error('❌ Eroare trimitere emailuri:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server pornit pe portul ${PORT}`);
});
