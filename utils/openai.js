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

  // Mesaj de sistem preluat din specificațiile AI (PROMPT_AI.rtf)
  const systemPrompt = `Ești GPT-4o, un agent inteligent și autonom specializat în Business Match B2B.
Rolul tău principal este să analizezi atent informațiile introduse de IMM-uri (firme mici și medii) și să identifici cele mai bune oportunități de colaborare B2B, pe baza unei potriviri avansate între nevoile și serviciile firmelor implicate.

Responsabilități:
- Analiză Logică: Examinează și înțelege detaliile firmei utilizatorului (cod CAEN, domeniu, servicii, avantaje competitive etc.) și cerințele clientului ideal.
- Calificare inteligentă: Din lista externă de firme (prin scraping), identifică cea mai compatibilă firmă-client.
- Generare email profesionist: Compune un mesaj prietenos și formal cu un call-to-action clar.

Toate datele de intrare vor fi furnizate ca variabile și trebuie folosite fără text adițional.`;

  // Mesaj de utilizator: datele firmei și lista CAEN
  const userPrompt = `Informații despre firmă (utilizator):
- Cod CAEN: ${lead.inputCodCaen}
- CUI: ${lead.inputCui}
- Număr angajați: ${lead.numarAngajati}
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

  // Combinăm sistem + utilizator
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
