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

// Endpointul principal, adaptat la ce trimite scraper.js :contentReference[oaicite:0]{index=0}:contentReference[oaicite:1]{index=1}
app.post('/genereaza', async (req, res) => {
  let { firma, lead } = req.body;

  // Daca nu e wrapper, tratăm direct req.body ca lead
  if (!firma && req.body.clientNameText) {
    lead = req.body;
    // TODO: înlocuieşte stub-ul de mai jos cu un fetch real din baza ta de date,
    // pe baza lead.firmaId (are proprietatea firmaId din scraper.js) :contentReference[oaicite:2]{index=2}:contentReference[oaicite:3]{index=3}
    firma = {
      inputNumeFirma:  process.env.DEFAULT_NUME_FIRMA  || '',
      inputEmailFirma: process.env.DEFAULT_EMAIL_FIRMA || '',
      contactAutomat:  process.env.DEFAULT_CONTACT_AUTOMAT === 'true'
    };
  }

  // validări
  if (!firma || !lead) {
    return res
      .status(400)
      .json({ success: false, message: 'Lipsesc datele necesare (firma sau lead).' });
  }
  if (!lead.clientNameText || !lead.clientEmailText || !lead.mesajCatreClientText) {
    return res
      .status(400)
      .json({ success: false, message: 'Lipsesc datele necesare în lead.' });
  }

  try {
    // trimit email IMM-ului
    await trimiteEmailIMM({
      numeFirma:       firma.inputNumeFirma,
      emailDestinatar: firma.inputEmailFirma,
      clientName:      lead.clientNameText,
      clientRequest:   lead.mesajCatreClientText
    });

    // dacă e activ switch-ul, trimitem şi clientului
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
