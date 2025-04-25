// index.js – Versiune cu fetch în loc de axios (pentru compatibilitate totală pe Render)

const express = require('express');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// Endpoint principal – primește lead de la scraper
app.post('/genereaza', async (req, res) => {
  try {
    const lead = req.body;
    console.log("🔁 Trimit către Wix:", lead);

    // 1. Trimite leadul către Wix CMS
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

    // 2. Obține datele firmei
    const firmaResp = await fetch('https://www.skywardflow.com/_functions/getFirma', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firmaId: lead.firmaId })
    });

    const firma = await firmaResp.json();

    // 3. Trimite email IMM
    await fetch('https://email.yourdomain.com/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: firma.inputEmailFirma,
        subject: '🔔 Ai un nou lead prin Skyward Flow!',
        html: `Salut ${firma.inputNumeFirma},<br><br>AI-ul nostru ți-a generat automat un lead nou:<br>
              Nume client: ${lead.clientNameText}<br>
              Email: ${lead.clientEmailText}<br>
              Cerere: ${lead.clientRequestText}`
      })
    });

    // 4. Trimite email clientului dacă switch-ul e activat
    if (firma.contactAutomat === true) {
      await fetch('https://email.yourdomain.com/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: lead.clientEmailText,
          subject: `Mesaj automat din partea ${firma.inputNumeFirma}`,
          html: `Bună!<br><br>${firma.inputNumeFirma} a primit solicitarea ta și este interesată de o colaborare.<br>
                Poți accesa site-ul lor: <a href="${firma.inputWebsiteFirma}">${firma.inputWebsiteFirma}</a><br>
                Contact direct: ${firma.inputEmailFirma}`
        })
      });
    }

    res.status(200).json({ success: true });

  } catch (err) {
    console.error('❌ Eroare la generare lead:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Serverul rulează pe portul ${PORT}`);
});
