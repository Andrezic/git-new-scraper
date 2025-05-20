// index.js
const express           = require('express');
const cors              = require('cors');
const bodyParser        = require('body-parser');
const { trimiteEmailIMM } = require('./backend/emailService');
const { genereazaTextLead } = require('./utils/openai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const INTERNAL_EMAIL = process.env.INTERNAL_EMAIL || 'skywardflow@gmail.com';

app.use(cors());
app.use(bodyParser.json());

app.post('/genereaza', async (req, res) => {
  let { firma, lead, userName } = req.body;

  if (!lead && req.body.clientNameText) lead = req.body;
  if (userName) lead.userName = userName;

  if (!firma) {
    firma = {
      inputNumeFirma:  lead.inputNumeFirma  || process.env.DEFAULT_NUME_FIRMA  || 'Firma Implicită',
      inputEmailFirma: lead.inputEmailFirma || process.env.DEFAULT_EMAIL_FIRMA || '',
      contactAutomat:  process.env.DEFAULT_CONTACT_AUTOMAT === 'true'
    };
  }

  if (!lead.inputNumeFirma || !lead.inputServicii) {
    return res.status(400).json({ success: false, message: 'Lipsesc datele firmei necesare.' });
  }

  try {
    const aiResult = await genereazaTextLead(lead);
    const {
      clientNameText:      aiClientName,
      clientTelefonText:   aiClientTelefon,
      clientWebsiteText:   aiClientWebsite,
      clientEmailText:     aiClientEmail,
      mesajCatreClientText
    } = aiResult;

    try {
      await trimiteEmailIMM({
        inputNumeFirma:       firma.inputNumeFirma,
        clientEmailText:      INTERNAL_EMAIL,
        clientNameText:       aiClientName,
        mesajCatreClientText
      });
    } catch (errMail) {
      console.error('❌ Eroare trimitere email intern:', errMail);
    }

    if (lead.switchContactAutomat && aiClientEmail) {
      try {
        await trimiteEmailIMM({
          inputNumeFirma:       firma.inputNumeFirma,
          clientEmailText:      aiClientEmail,
          clientNameText:       aiClientName,
          mesajCatreClientText
        });
      } catch (errMail) {
        console.error('❌ Eroare trimitere email client:', errMail);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Lead generat și email-urile (intern și/sau client) au fost procesate.',
      lead: aiResult
    });

  } catch (err) {
    console.error('❌ Eroare fatală în /genereaza:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => console.log(`🚀 Server online pe portul ${PORT}`));
