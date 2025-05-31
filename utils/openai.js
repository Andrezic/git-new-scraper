const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const mdPath = path.join(__dirname, '..', 'coduri_CAEN_b2b_detaliat.md');
const coduriCaen = fs.existsSync(mdPath) ? fs.readFileSync(mdPath, 'utf8') : '';

async function genereazaLeadAI(firma) {
  const prompt = `
Tu ești Alex, cel mai bun agent AI de Business Match B2B. Scanează datele firmei de mai jos și oferă o oportunitate de colaborare B2B reală, verificată și potrivită. NU inventa leaduri dacă nu există o potrivire clară. Folosește CAEN-ul, serviciile și datele relevante. La final, generează un mesaj personalizat, în numele firmei, care va fi trimis clientului.

Date firmă:
Nume: ${firma.inputNumeFirma}
CAEN: ${firma.inputCodCaen}
CUI: ${firma.inputCui}
Email: ${firma.inputEmailFirma}
Telefon: ${firma.inputTelefonFirma}
Website: ${firma.inputWebsiteFirma}
Servicii: ${firma.inputServicii}
Avantaje: ${firma.inputAvantaje}
Prețuri: ${firma.inputPreturi}
Tip clienți: ${firma.inputTipClienti}
Dimensiune client dorit: ${firma.inputDimensiuneClient}
Cuvinte cheie: ${firma.inputKeywords}
Descriere: ${firma.inputDescriere}
Țintire geografică: ${firma.inputTintireGeo?.formatted || ''}
Localizare firmă: ${firma.inputLocalizare?.formatted || ''}

Coduri CAEN compatibile: 
${coduriCaen}

Răspunsul tău trebuie să conțină:
1. Numele firmei/clientului găsit
2. Email client
3. Telefon client (dacă este)
4. Website client
5. Mesaj personalizat în numele utilizatorului către acest client
`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.6
  });

  const output = completion.choices[0].message.content;

  // Simplu extractor pentru lead
  const lead = {
    clientNameText: '',
    clientEmailText: '',
    clientTelefonText: '',
    clientWebsiteText: '',
    mesajCatreClientText: output || ''
  };

  return lead;
}

module.exports = { genereazaLeadAI };
