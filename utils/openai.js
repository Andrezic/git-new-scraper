// utils/openai.js
const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL   = 'gpt-4o';

// Încarcă lista compatibilităților CAEN din markdown
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
oportunităților de afaceri pentru utilizatori. Scopul tău este să livrezi lead-uri relevante și mesaje
profesionale de contact, automatizând întregul proces de prospectare.

Cum funcționează sistemul:
1. Utilizatorul completează un formular cu datele firmei (#inputNumeFirma, #inputServicii, #inputTipClienti, #inputTintireGeo).
2. Tu, ca echipă Skyward Flow, preiei aceste date și generezi lead-uri calificate.

Cele 4 roluri:
1. Web Search Master (Mara): găsești și extragi date clienți potențiali.
2. Data Validator & Feedback (Alex): validezi și rafinezi datele.
3. Business Analyzer (Radu): aplici scorificare și alegi cel mai bun lead.
4. Email Sender (Ana): compui un email profesionist de contact.

Flux complet: Mara → Alex → Radu → Ana.

**Instrucțiuni**: Respectă doar acest format de răspuns:
#clientNameText <Nume client>
#clientTelefonText <Telefon client>
#clientWebsiteText <Website client>
#clientEmailText <Email client>
#mesajCatreClientText
<Text complet al emailului de propunere>
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
- Tip clienți: ${lead.inputTipClienti}
- Dimensiune client: ${lead.inputDimensiuneClient}
- Cuvinte cheie: ${lead.inputKeywords}
- Cerințe extra: ${lead.inputCerinteExtra}
- Țintire geo: ${lead.inputTintireGeo}

Listă compatibilități CAEN relevante:
\`\`\`markdown
${caenList}
\`\`\`

Găsește cel mai potrivit client potențial și completează câmpurile de mai sus.`;

  try {
    const resp = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model:       OPENAI_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user',   content: userPrompt }
        ],
        temperature: 0.7,
        timeout:     30000
      },
      { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } }
    );

    const content = resp.data.choices[0].message.content;

    // Extragem câmpurile
    const clientNameText      = (content.match(/#clientNameText\s*(.+)/i) || [])[1]?.trim() || '';
    const clientTelefonText   = (content.match(/#clientTelefonText\s*(.+)/i) || [])[1]?.trim() || '';
    const clientWebsiteText   = (content.match(/#clientWebsiteText\s*(.+)/i) || [])[1]?.trim() || '';
    const clientEmailText     = (content.match(/#clientEmailText\s*(.+)/i) || [])[1]?.trim() || '';
    const mesajCatreClientText= (content.split(/#mesajCatreClientText/i)[1] || '').trim();

    // Validare minimă
    if (!clientNameText || !clientEmailText || !mesajCatreClientText) {
      throw new Error('AI a returnat un lead incomplet.');
    }

    return { clientNameText, clientTelefonText, clientWebsiteText, clientEmailText, mesajCatreClientText };

  } catch (err) {
    console.error('❌ Eroare OpenAI:', err.response?.data || err.message);
    // Fallback lead gol
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
