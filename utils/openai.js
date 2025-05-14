// utils/openai.js
const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = 'gpt-4o';

// Încarcă lista de compatibilități CAEN detaliată din fișier markdown
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
 * Generează textul lead-ului (email B2B) pe baza datelor firmelor și compatibilităților CAEN.
 */
async function genereazaTextLead(lead) {
  const caenList = loadCaenCompatibilities();

  // Construim prompt-ul clar și structurat
  const promptParts = [
    'Urmează acești pași:',
    '1. Filtrează lista de compatibilități CAEN folosind codul principal specificat de utilizator.',
    '',
    'Datele firmei (utilizatorului):',
    `- Cod CAEN: ${lead.inputCodCaen}`,
    `- CUI: ${lead.inputCui}`,
    `- Număr angajați: ${lead.numarAngajati}`,
    `- Nume firmă: ${lead.inputNumeFirma}`,
    `- Servicii: ${lead.inputServicii}`,
    `- Prețuri: ${lead.inputPreturi}`,
    `- Avantaje: ${lead.inputAvantaje}`,
    `- Telefon firmă: ${lead.inputTelefonFirma}`,
    `- Email firmă: ${lead.inputEmailFirma}`,
    `- Website firmă: ${lead.inputWebsiteFirma}`,
    `- Localizare firmă: ${lead.inputLocalizare}`,
    `- Descriere extra: ${lead.inputDescriere}`,
    '',
    'Specificații client (utilizator):',
    `- Tipul de clienți: ${lead.inputTipClienti}`,
    `- Dimensiune client: ${lead.inputDimensiuneClient}`,
    `- Cuvinte cheie: ${lead.inputKeywords}`,
    `- Cerințe extra: ${lead.inputCerinteExtra}`,
    `- Țintire geografică: ${lead.inputTintireGeo}`,
    '',
    'Lista compatibilităților CAEN (markdown):',
    '```markdown',
    caenList,
    '```',
    '',
    'Pe baza acestor informații, construiește un email B2B profesionist cu următoarele elemente:',
    'A) Alege codul CAEN principal și 2-3 coduri compatibile din listă, explicând relevanța fiecăruia.',
    'B) Generează datele clientului:',
    '  - Nume client (#clientNameText)',
    '  - Telefon client (#clientTelefonText)',
    '  - Website client (#clientWebsiteText)',
    '  - Email client (#clientEmailText)',
    'C) Redactează mesajul către client (#mesajCatreClientText) cu un call-to-action clar.',
    ''
  ];
  const prompt = promptParts.join('\n');

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: OPENAI_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const message = response.data.choices[0].message.content.trim();
    console.log('🤖 Mesaj generat de AI:', message);
    return message;
  } catch (error) {
    console.error('❌ Eroare OpenAI:', error.response?.data || error.message);
    return 'Nu s-a putut genera mesajul automat.';
  }
}

module.exports = { genereazaTextLead };
