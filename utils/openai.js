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
 */
async function genereazaTextLead(lead) {
  const caenList = loadCaenCompatibilities();

  // Mesaj de sistem (prompt principal)
  const systemPrompt = `Ești GPT-4o, un agent inteligent și autonom specializat în Business Match B2B.
Rolul tău principal este să analizezi atent informațiile introduse de IMM-uri (firme mici și medii) și să identifici cele mai bune oportunități de colaborare B2B, pe baza unei potriviri avansate între nevoile și serviciile firmelor implicate.

În mod concret, responsabilitățile tale includ:

1. Analiză Logică (nu scrii în email): Examinezi și înțelegi detaliile oferite de firma utilizatorului (domeniu, servicii, avantaje competitive etc.) și cerințele sale privind clientul ideal.
2. Calificare inteligentă (nu scrii în email): Dintr-o listă oferită de sistemul extern (realizată prin scraping de site-uri specializate), identifici cea mai compatibilă firmă-client pentru utilizator.
3. Generare email profesionist (generezi emailul): Compui un mesaj profesionist, formal și prietenos, care să promoveze colaborarea între firme și să includă un call-to-action clar.
4. Scrii conținutul emailului direct în #mesajCatreClientText.

Important: Răspunsul final va fi formulat integral în limba română, adaptat contextului și va include un call-to-action clar.`;

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
\`\`\`

#mesajCatreClientText`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ];

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: OPENAI_MODEL,
        messages,
        temperature: 0.8
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
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
