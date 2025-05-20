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

  // Dacă lead vine direct în payload fără wrapper
  if (!lead && req.body.clientNameText) {
    lead = req.body;
  }
  // Atașăm userName dacă există
  if (userName) {
    lead.userName = userName;
  }

  // Fallback pentru datele firmei
  if (!firma) {
    firma = {
      inputNumeFirma:  lead.inputNumeFirma   || process.env.DEFAULT_NUME_FIRMA   || 'Firma Implicită',
      inputEmailFirma: lead.inputEmailFirma  || process.env.DEFAULT_EMAIL_FIRMA  || '',
      contactAutomat:  process.env.DEFAULT_CONTACT_AUTOMAT === 'true'
    };
  }

  // Validare minimă: câmpuri user înainte de AI
  if (!lead.inputNumeFirma || !lead.inputServicii) {
    return res.status(400).json({ success: false, message: 'Lipsesc datele firmei necesare.' });
  }

  try {
    // 1) Apelează AI pentru generarea lead-ului client
    const aiResult = await genereazaTextLead(lead);
    const {
      clientNameText: aiClientName,
      clientTelefonText: aiClientTelefon,
      clientWebsiteText: aiClientWebsite,
      clientEmailText: aiClientEmail,
      mesajCatreClientText
    } = aiResult;

        // 2) Email intern
    await trimiteEmailIMM({
      inputNumeFirma:       firma.inputNumeFirma,
      clientEmailText:      INTERNAL_EMAIL,
      clientNameText:       aiClientName,
      mesajCatreClientText: mesajCatreClientText
    });

    // 3) Email client doar dacă avem email valid
-   if (lead.switchContactAutomat) {
+   if (lead.switchContactAutomat && aiClientEmail) {
      await trimiteEmailIMM({
        inputNumeFirma:       firma.inputNumeFirma,
        clientEmailText:      aiClientEmail,
        clientNameText:       aiClientName,
        mesajCatreClientText: mesajCatreClientText
      });
    }

    // 4) Răspuns API
    return res.status(200).json({
      success: true,
      message: 'Email intern și, dacă a fost activat, și către client au fost trimise cu succes!',
      lead: {
        clientNameText: aiClientName,
        clientTelefonText: aiClientTelefon,
        clientWebsiteText: aiClientWebsite,
        clientEmailText: aiClientEmail,
        mesajCatreClientText
      }
    });
  } catch (err) {
    console.error('❌ Eroare trimitere:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server online pe portul ${PORT}`);
});
