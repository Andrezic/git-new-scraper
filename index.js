// index.js – Versiunea finală Skyward Flow cu MailerSend

const express = require('express');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
dotenv.config();

const { trimiteEmailIMM } = require('./backend/emailService');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// 🔁 Endpoint principal – generează lead
app.post('/genereaza', async (req, res) => {
  try {
    const lead = req.body;
    console.log("🔁 Trimit către Wix:", lead);

    const wixResp = await fetch('https://www.skywardflow.com/_functions/genereaza', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead)
    });

    if (!wixResp.ok) {
      const errText = await wixResp.text();
      throw new Error(`Eroare de la Wix: ${wixResp.status} - ${errText}`);
    }

    const wixData = await wixResp.json();
    console.log("✅ Răspuns Wix:", wixData);

    // 📦 Luăm datele firmei
    const firmaResp = await fetch('https://www.skywardflow.com/_functions/getFirma', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firmaId: lead.firmaId })
    });

    if (!firmaResp.ok) {
      const errText = await firmaResp.text();
      throw new Error(`Eroare la obținere firmă: ${firmaResp.status} - ${errText}`);
    }

    const firma = await firmaResp.json();
    console.log("📦 Firma găsită:", firma);

    // 📨 Trimitem email IMM prin MailerSend
    const continutLeadIMM = `Lead nou generat:\n\nNume client: ${lead.clientNameText}\nEmail client: ${lead.clientEmailText}\nCerere client: ${lead.clientRequestText}`;

    await trimiteEmailIMM({
      numeFirma: firma.inputNumeFirma,
      emailDestinatar: firma.inputEmailFirma,
      continutLead: continutLeadIMM
    });

    // 📨 Dacă switchul e ON, trimitem și către client
    if (firma.switchContactAutomat === true || firma.switchContactAutomat === 'true') {
      const continutLeadClient = `Bună,\n\nFirma ${firma.inputNumeFirma} a primit cererea ta:\n\n\"${lead.clientRequestText}\"\n\nTe vor contacta în curând.\n\n--\nSkyward Flow`;

      await trimiteEmailIMM({
        numeFirma: firma.inputNumeFirma,
        emailDestinatar: lead.clientEmailText,
        continutLead: continutLeadClient
      });
    }

    res.status(200).json({ success: true });

  } catch (err) {
    console.error('❌ Eroare la generare lead:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Endpoint de testare email (opțional)
app.post('/test-email', async (req, res) => {
  try {
    const payload = {
      numeFirma: "Skyward Flow",
      emailDestinatar: "skywardflow@gmail.com",
      continutLead: "Lead test: Client Test - Cerere Test"
    };

    await trimiteEmailIMM(payload);

    res.status(200).json({ success: true, message: "Email de test trimis" });
  } catch (err) {
    console.error('❌ Eroare test email:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Serverul rulează pe portul ${PORT}`);
});
