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

// Endpointul principal, adaptat la ce trimite scraper.js
app.post('/genereaza', async (req, res) => {
  let { firma, lead } = req.body;

  // Dacă nu există obiectul firma în payload, primim direct lead
  if (!firma && req.body.clientNameText) {
    lead = req.body;
    // Stub: date implicite pentru firma (înlocuiește cu fetch DB când e gata)
    firma = {
      inputNumeFirma:  process.env.DEFAULT_NUME_FIRMA  || '',
      inputEmailFirma: process.env.DEFAULT_EMAIL_FIRMA || '',
      contactAutomat:  process.env.DEFAULT_CONTACT_AUTOMAT === 'true'
    };
  }

  // Validări
  if (!firma || !lead) {
    return res.status(400).json({
      success: false,
      message: 'Lipsesc datele necesare (firma sau lead).'
    });
  }
  if (!lead.clientNameText || !lead.clientEmailText || !lead.mesajCatreClientText) {
    return res.status(400).json({
      success: false,
      message: 'Lipsesc datele necesare în lead.'
    });
  }

  try {
    // Trimite email către firma ta
    await trimiteEmailIMM({
      numeFirma:       firma.inputNumeFirma,
      emailDestinatar: firma.inputEmailFirma,
      clientName:      lead.clientNameText,
      clientRequest:   lead.mesajCatreClientText
    });

    // Dacă e activ switch-ul, trimitem și clientului
    if (firma.contactAutomat) {
      await trimiteEmailIMM({
        numeFirma:       firma.inputNumeFirma,
        emailDestinatar: lead.clientEmailText,
        clientName:      firma.inputNumeFirma,
        clientRequest:   lead.mesajCatreClientText
      });
    }

    res.status(200).json({ success: true, message: 'Emailuri trimise cu succes!' });
  } catch (err) {
    console.error('❌ Eroare trimitere emailuri:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server pornit pe portul ${PORT}`);
});
