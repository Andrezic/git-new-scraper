// index.js - Varianta completă actualizată corect

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { trimiteEmailIMM } = require('./backend/emailService');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Endpoint de testare rapidă pentru trimitere email
app.post('/test-email', async (req, res) => {
  try {
    await trimiteEmailIMM({
      numeFirma: "Vand Mere.SRL",
      emailDestinatar: "skywardflow@gmail.com",
      clientName: "Cumpar Mere.SRL",
      clientRequest: "Suntem interesați de oferta dumneavoastră."
    });

    res.status(200).json({ success: true, message: "Email de test trimis cu succes!" });
  } catch (err) {
    console.error('❌ Eroare test email:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Endpointul principal care procesează leaduri
app.post('/genereaza', async (req, res) => {
  const { firma, lead } = req.body;

  if (!firma || !lead) {
    return res.status(400).json({ success: false, message: "Lipsesc datele necesare." });
  }

  try {
    // Trimitem email IMM-ului
    await trimiteEmailIMM({
      numeFirma: firma.inputNumeFirma,
      emailDestinatar: firma.inputEmailFirma,
      clientName: lead.clientNameText,
      clientRequest: lead.clientRequestText
    });

    // Dacă switch-ul este activ, trimitem și email Clientului
    if (firma.contactAutomat) {
      await trimiteEmailIMM({
        numeFirma: firma.inputNumeFirma,
        emailDestinatar: lead.clientEmailText,
        clientName: firma.inputNumeFirma,
        clientRequest: lead.clientRequestText
      });
    }

    res.status(200).json({ success: true, message: "Emailuri trimise cu succes!" });
  } catch (err) {
    console.error('❌ Eroare trimitere emailuri:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server pornit pe portul ${PORT}`);
});
