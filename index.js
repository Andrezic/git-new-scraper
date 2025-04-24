// index.js – Complet, cu generare lead + trimitere email IMM + email client (dacă switchul e ON)

import express from 'express';
import axios from 'axios';
import cors from 'cors';
import bodyParser from 'body-parser';
import { config } from 'dotenv';
config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// Endpoint principal – primește lead de la scraper
app.post('/genereaza', async (req, res) => {
  try {
    const lead = req.body;

    // 1. Salvează leadul în Wix CMS
    await axios.post('https://www.skywardflow.com/_functions/adaugaLead', lead);

    // 2. Ia datele firmei din Wix CMS
    const firmaResp = await axios.post('https://www.skywardflow.com/_functions/getFirma', {
      firmaId: lead.firmaId
    });
    const firma = firmaResp.data;

    // 3. Trimite email IMM
    await axios.post('https://email.yourdomain.com/send', {
      to: firma.inputEmailFirma,
      subject: '🔔 Ai un nou lead prin Skyward Flow!',
      html: `Salut ${firma.inputNumeFirma},<br><br>AI-ul nostru ți-a generat automat un lead nou:<br>
            Nume client: ${lead.clientNameText}<br>
            Email: ${lead.clientEmailText}<br>
            Cerere: ${lead.clientRequestText}`
    });

    // 4. Trimite email clientului dacă switch-ul e activat
    if (firma.contactAutomat === true) {
      await axios.post('https://email.yourdomain.com/send', {
        to: lead.clientEmailText,
        subject: `Mesaj automat din partea ${firma.inputNumeFirma}`,
        html: `Bună!<br><br>${firma.inputNumeFirma} a primit solicitarea ta și este interesată de o colaborare.<br>
              Poți accesa site-ul lor: <a href="${firma.inputWebsiteFirma}">${firma.inputWebsiteFirma}</a><br>
              Contact direct: ${firma.inputEmailFirma}`
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
