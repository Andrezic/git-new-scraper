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
 * Generează textul lead-ului (email B2B) pe baza datelor firmei și lista CAEN detaliată.
 * Așteaptă în obiectul lead proprietatea userName cu numele expeditorului.
 */
async function genereazaTextLead(lead) {
  const caenList = loadCaenCompatibilities();
  const senderName = lead.userName || 'echipa Skyward Flow';

  // Mesaj de sistem (prompt principal)
  const systemPrompt = `Ești GPT-4o, un agent inteligent și autonom specializat în Business Match B2B.
Rolul tău principal este să analizezi atent informațiile introduse de IMM-uri (firme mici și medii) și să identifici cele mai bune oportunități de colaborare B2B, pe baza unei potriviri avansate între nevoile și serviciile firmelor implicate.

În mod concret, responsabilitățile tale includ:

1. Analiză Logică (nu scrii în email): Examinezi și înțelegi detaliile oferite de firma utilizatorului (domeniu, servicii, avantaje competitive etc.) și cerințele sale privind clientul ideal.
2. Calificare inteligentă (nu scrii în email): Dintr-o listă oferită de sistemul extern (realizată prin scraping de site-uri specializate), identifici cea mai compatibilă firmă-client pentru utilizator.
3. Generare email profesionist (generezi emailul): Compui un mesaj profesionist, formal și prietenos, care să promoveze colaborarea între firme și să includă un call-to-action clar.
4. Scrii conținutul mesajului (email) si il pui in inputul #mesajCatreClientText.


Important: Răspunsul final va fi formulat integral în limba română, adaptat contextului și va include un call-to-action clar.`;

  // Înlocuiește placeholder-ele #input* cu valorile reale din lead
  const finalSystemPrompt = systemPrompt
    .replace(/#inputCodCaen/g,         lead.inputCodCaen || '')
    .replace(/#inputCui/g,             lead.inputCui || '')
    .replace(/#inputNumarAngajati/g,   lead.inputNumarAngajati || '')
    .replace(/#inputNumeFirma/g,       lead.inputNumeFirma || '')
    .replace(/#inputServicii/g,        lead.inputServicii || '')
    .replace(/#inputPreturi/g,         lead.inputPreturi || '')
    .replace(/#inputAvantaje/g,        lead.inputAvantaje || '')
    .replace(/#inputTelefonFirma/g,    lead.inputTelefonFirma || '')
    .replace(/#inputEmailFirma/g,      lead.inputEmailFirma || '')
    .replace(/#inputWebsiteFirma/g,    lead.inputWebsiteFirma || '')
    .replace(/#inputLocalizare/g,      lead.inputLocalizare || '')
    .replace(/#inputDescriere/g,       lead.inputDescriere || '')
    .replace(/#inputTipClienti/g,      lead.inputTipClienti || '')
    .replace(/#inputDimensiuneClient/g,lead.inputDimensiuneClient || '')
    .replace(/#inputKeywords/g,        lead.inputKeywords || '')
    .replace(/#inputCerinteExtra/g,    lead.inputCerinteExtra || '')
    .replace(/#inputTintireGeo/g,      lead.inputTintireGeo || '');

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
    { role: 'system', content: finalSystemPrompt },
    { role: 'user',   content: userPrompt }
  ];

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      { model: OPENAI_MODEL, messages, temperature: 0.8 },
      { headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' } }
    );

    let generated = response.data.choices[0].message.content.trim();

    // Curățare output:
    // Elimină orice linie de tip "Email..." la început
    generated = generated.replace(/^\*?Email[^\n]*\n+/i, '');
    // Elimină separatorul '---' dacă există
    generated = generated.replace(/^---+\s*/i, '');
    // Elimină placeholder-ul #mesajCatreClientText
    generated = generated.replace(/^#mesajCatreClient(?:e)?Text\s*/i, '');
    // Elimină 'Subiect: ...' dacă apare la început
    generated = generated.replace(/^Subiect:[^\n]*\n+/i, '');
    // Înlocuiește toate placeholder-ele de nume cu valorile reale
    generated = generated.replace(/\[Numele\s*(?:tău|dvs\.|dumneavoastră|Dumneavoastră)\]/gi, senderName);
    // Înlocuiește placeholder-ul [Nume Companie] și variațiile similare
    generated = generated.replace(/\[Nume\s+Companie\]/gi, lead.clientNameText || '');
    generated = generated.replace(/\[Numele Firmei Compatibile\]/gi, lead.clientNameText || '');
    generated = generated.replace(/\[Nume\s*(?:companie\s*)?client\]/gi, lead.clientNameText || '');
    generated = generated.replace(/\[Nume\s+Contact\]/gi, lead.clientNameText || '');

    console.log('🤖 Mesaj generat de AI:', generated);
    return generated;
  } catch (error) {
    console.error('❌ Eroare OpenAI:', error.response?.data || error.message);
    return 'Nu s-a putut genera mesajul automat.';
  }
}

module.exports = { genereazaTextLead };
