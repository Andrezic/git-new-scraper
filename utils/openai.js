// utils/openai.js
const fs   = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL   = 'gpt-4o';

function loadCaenCompatibilities() {
  const mdPath = path.join(__dirname, '..', 'coduri_CAEN_b2b_detaliat.md');
  try {
    return fs.readFileSync(mdPath, 'utf-8');
  } catch (err) {
    console.warn('⚠️ Nu am putut încărca coduri_CAEN_b2b_detaliat.md:', err.message);
    return '';
  }
}

async function genereazaTextLead(lead) {
  const caenList = loadCaenCompatibilities();

  const systemPrompt = `
Ești echipa Skyward Flow (GPT-4.o), formată din 4 roluri specializate în găsirea și calificarea
oportunităților de afaceri. Scopul tău: să livrezi lead-uri relevante și mesaje profesionale.

Flux:
1. Mara (Web Search Master) – găsește potențiali clienți.
2. Alex (Data Validator) – validează datele.
3. Radu (Business Analyzer) – aplică scor și alege lead.
4. Ana (Email Sender) – compune e-mailul.

Răspunde **doar** în acest format, fără comentarii adiționale:
#clientNameText <Nume client>
#clientTelefonText <Telefon client>
#clientWebsiteText <Website client>
#clientEmailText <Email client>
#mesajCatreClientText
<Text complet al e-mailului de propunere>
`;

  const userPrompt = `
Date firmă:
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

Specificații client:
- Tip clienți: ${lead.inputTipClienti}
- Dimensiune client: ${lead.inputDimensiuneClient}
- Cuvinte cheie: ${lead.inputKeywords}
- Cerințe extra: ${lead.inputCerinteExtra}
- Țintire geo: ${lead.inputTintireGeo}

Compatibilități CAEN:
\`\`\`markdown
${caenList}
\`\`\`
`;

  try {
    const response = await axios.post(
  'https://api.openai.com/v1/chat/completions',
  { model: OPENAI_API_KEY, messages, temperature: 0.7 },
  {
    headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    timeout: 30000
  }
);

    const content = resp.data.choices[0].message.content;
    const clientNameText       = (content.match(/#clientNameText\s+(.+)/i) || [])[1]?.trim() || '';
    const clientTelefonText    = (content.match(/#clientTelefonText\s+(.+)/i) || [])[1]?.trim() || '';
    const clientWebsiteText    = (content.match(/#clientWebsiteText\s+(.+)/i) || [])[1]?.trim() || '';
    const clientEmailText      = (content.match(/#clientEmailText\s+(.+)/i) || [])[1]?.trim() || '';
    const mesajParts           = content.split(/#mesajCatreClientText/i);
    const mesajCatreClientText = mesajParts[1]?.trim() || '';

    if (!clientNameText || !clientEmailText || !mesajCatreClientText) {
      throw new Error('AI a returnat un lead incomplet.');
    }

    return { clientNameText, clientTelefonText, clientWebsiteText, clientEmailText, mesajCatreClientText };

  } catch (err) {
    console.error('❌ Eroare OpenAI detaliată:', err.response?.data || err.message);
    return {
      clientNameText:       '',
      clientTelefonText:    '',
      clientWebsiteText:    '',
      clientEmailText:      '',
      mesajCatreClientText: 'Lead-ul nu a putut fi generat automat.'
    };
  }
}

module.exports = { genereazaTextLead };
