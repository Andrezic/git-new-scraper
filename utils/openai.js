// utils/openai.js
const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = 'gpt-4o';

// Încarcă lista de compatibilități CAEN din fișier markdown
function loadCaenCompatibilities() {
  const mdPath = path.join(__dirname, '..', 'coduri_CAEN_b2b_detaliat.md');
  try {
    return fs.readFileSync(mdPath, 'utf-8');
  } catch (err) {
    console.warn('⚠️ Nu am putut încărca coduri_CAEN_b2b_detaliat.md:', err.message);
    return '';
  }
}

/**
 * Generează textul email-ului B2B pe baza lead-ului și listei CAEN.
 * @param {Object} lead Obiect cu proprietăți input* și client*Text
 * @returns {string} Textul generat de OpenAI
 */
async function genereazaTextLead(lead) {
  const caenList = loadCaenCompatibilities();

  // Prompt de sistem pentru GPT
  const systemPrompt = `Ești GPT-4o, un agent inteligent și autonom specializat în Business Match B2B. Rolul tău este să analizezi informațiile unei firme și specificațiile clientului ideal și să generezi un email profesionist care promovează colaborarea.`;

  // Prompt de utilizator cu detaliile lead-ului
  const userPrompt = `Informații despre firmă:
- Cod CAEN: ${lead.inputCodCaen}
- CUI: ${lead.inputCui}
- Număr angajați: ${lead.inputNumarAngajati}
- Nume firmă: ${lead.inputNumeFirma}
- Servicii oferite: ${lead.inputServicii}
- Prețuri: ${lead.inputPreturi}
- Avantaje competitive: ${lead.inputAvantaje}
- Telefon firmă: ${lead.inputTelefonFirma}
- Email firmă: ${lead.inputEmailFirma}
- Website firmă: ${lead.inputWebsiteFirma}
- Localizare: ${lead.inputLocalizare}
- Descriere adițională: ${lead.inputDescriere}

Specificații client dorit:
- Tipul de clienți vizați: ${lead.inputTipClienti}
- Dimensiunea clientului: ${lead.inputDimensiuneClient}
- Cuvinte cheie relevante: ${lead.inputKeywords}
- Cerințe suplimentare: ${lead.inputCerinteExtra}
- Țintire geografică: ${lead.inputTintireGeo}

Lista compatibilităților CAEN (markdown):
\`\`\`markdown
${caenList}
\`\`\``;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ];

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      { model: OPENAI_MODEL, messages, temperature: 0.8 },
      { headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' } }
    );

    const generated = response.data.choices[0].message.content.trim();
    console.log('🤖 Mesaj generat de AI:', generated);
    return generated;
  } catch (error) {
    console.error('❌ Eroare OpenAI:', error.response?.data || error.message);
    return 'Nu s-a putut genera mesajul automat.';
  }
}

module.exports = { genereazaTextLead };
