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

// Endpoint de testare email
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

// Endpoint principal
app.post('/genereaza', async (req, res) => {
  let { firma, lead } = req.body;
  if (!lead && req.body.clientNameText) lead = req.body;

  if (!firma) {
    firma = {
      inputNumeFirma:    process.env.DEFAULT_NUME_FIRMA,
      inputEmailFirma:   process.env.DEFAULT_EMAIL_FIRMA,
      contactAutomat:    process.env.DEFAULT_CONTACT_AUTOMAT === 'true'
    };
  }

  if (!lead.clientNameText || !lead.clientEmailText) {
    return res.status(400).json({ success: false, message: 'Lipsă date client.' });
  }

  try {
    // 1) Generează email AI
    const emailBody = await genereazaTextLead({ ...lead });

    // 2) Trimite email intern
    await trimiteEmailIMM({
      inputNumeFirma:       firma.inputNumeFirma,
      clientEmailText:      'skywardflow@gmail.com',
      clientNameText:       lead.clientNameText,
      mesajCatreClientText: emailBody
    });

    // 3) Trimite email către firma ta
    await trimiteEmailIMM({
      inputNumeFirma:       firma.inputNumeFirma,
      clientEmailText:      firma.inputEmailFirma,
      clientNameText:       lead.clientNameText,
      mesajCatreClientText: emailBody
    });

    // 4) Dacă e activ contactul automat, trimite și clientului lead
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
      .json({ success: true, message: 'Emailuri trimise cu succes!', aiEmail: emailBody });
  } catch (err) {
    console.error('❌ Eroare trimitere:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server online pe portul ${PORT}`);
});
