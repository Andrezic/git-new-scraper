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
 * Generează lead-ul complet: datele clientului și corpul emailului.
 * AI va popula tag-urile #clientNameText, #clientTelefonText, #clientWebsiteText, #clientEmailText și #mesajCatreClientText.
 * @param {Object} lead - obiect cu câmpurile input*
 * @returns {Object} lead complet cu proprietățile: clientNameText, clientTelefonText, clientWebsiteText, clientEmailText, mesajCatreClientText
 */
async function genereazaTextLead(lead) {
  const caenList = loadCaenCompatibilities();
  const senderName = lead.userName || 'echipa Skyward Flow';

  // Prompt sistem: explică formatul de output
  const systemPrompt = `Ești GPT-4o, agent specializat în Business Match B2B.
În răspuns, folosește exact următorul format (fără alte comentarii):

#clientNameText <Numele companiei client>
#clientTelefonText <Telefon companie client>
#clientWebsiteText <Website companie client>
#clientEmailText <Email companie client>
#mesajCatreClientText
<Textul complet al emailului de propunere>
`;

  // Prompt de user: datele input
  const userPrompt = `Date firmă:
- Cod CAEN: ${lead.inputCodCaen}
- CUI: ${lead.inputCui}
- Nr. angajați: ${lead.inputNumarAngajati}
- Nume firmă: ${lead.inputNumeFirma}
- Servicii: ${lead.inputServicii}
- Prețuri: ${lead.inputPreturi}
- Avantaje: ${lead.inputAvantaje}
- Telefon firmă: ${lead.inputTelefonFirma}
- Email firmă: ${lead.inputEmailFirma}
- Website firmă: ${lead.inputWebsiteFirma}
- Localizare: ${lead.inputLocalizare}
- Descriere: ${lead.inputDescriere}

Specificații client dorit:
- Tip clienți: ${lead.inputTipClienti}
- Dimensiune client: ${lead.inputDimensiuneClient}
- Cuvinte cheie: ${lead.inputKeywords}
- Cerințe extra: ${lead.inputCerinteExtra}
- Țintire geo: ${lead.inputTintireGeo}

Listă compatibilități CAEN:
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
      { model: OPENAI_MODEL, messages, temperature: 0.7 },
      { headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' } }
    );
    const content = response.data.choices[0].message.content;

    // Extragem fiecare secțiune folosind regex
    const clientNameMatch = content.match(/#clientNameText\s*(.*)/i);
    const clientTelefonMatch = content.match(/#clientTelefonText\s*(.*)/i);
    const clientWebsiteMatch = content.match(/#clientWebsiteText\s*(.*)/i);
    const clientEmailMatch = content.match(/#clientEmailText\s*(.*)/i);
    const mesajSplit = content.split(/#mesajCatreClientText/i);
    const mesajCatreClientText = mesajSplit[1] ? mesajSplit[1].trim() : '';

    return {
      clientNameText:      clientNameMatch    ? clientNameMatch[1].trim()    : '',
      clientTelefonText:   clientTelefonMatch ? clientTelefonMatch[1].trim() : '',
      clientWebsiteText:   clientWebsiteMatch ? clientWebsiteMatch[1].trim() : '',
      clientEmailText:     clientEmailMatch   ? clientEmailMatch[1].trim()   : '',
      mesajCatreClientText
    };
  } catch (error) {
    console.error('❌ Eroare OpenAI:', error.response?.data || error.message);
    return {
      clientNameText: '',
      clientTelefonText: '',
      clientWebsiteText: '',
      clientEmailText: '',
      mesajCatreClientText: 'Nu s-a putut genera mesajul automat.'
    };
  }
}

module.exports = { genereazaTextLead };
