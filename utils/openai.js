const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { OpenAI } = require('openai');
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Citim promptul de sistem + fișierul cu codurile CAEN
const sistemPrompt = fs.readFileSync(path.join(__dirname, 'prompt-system.txt'), 'utf8');
const coduriCaen = fs.readFileSync(path.join(__dirname, '../coduri_CAEN_b2b_detaliat.md'), 'utf8');

// ✅ Funcție principală exportată corect
async function genereazaLeadAI(firma) {
const mesajUtilizator = `
Te rog răspunde pe exact 5 linii, fiecare pe rând:

1. Numele clientului compatibil
2. Emailul clientului
3. Telefon client (dacă există)
4. Website client (dacă există)
5. Mesajul care va fi trimis de firmă către client

Date firmă:
Nume firmă: ${firma.inputNumeFirma}
Website: ${firma.inputWebsiteFirma}
Email: ${firma.inputEmailFirma}
Telefon: ${firma.inputTelefonFirma}
Servicii: ${firma.inputServicii}
Avantaje: ${firma.inputAvantaje}
Prețuri: ${firma.inputPreturi}
Tip client dorit: ${firma.inputTipClienti}
Cod CAEN: ${firma.inputCodCaen}

Coduri CAEN disponibile:
${coduriCaen}
`;

  const raspuns = await openai.chat.completions.create({
    model: 'gpt-4o',
    temperature: 0.4,
    messages: [
      { role: 'system', content: sistemPrompt },
      { role: 'user', content: mesajUtilizator }
    ]
  });

  const rezultat = raspuns.choices?.[0]?.message?.content || '';
  const linii = rezultat.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  const clientNameText = linii[0] || '';
  const clientEmailText = linii[1] || '';
  const clientTelefonText = linii[2] || '';
  const clientWebsiteText = linii[3] || '';
  const mesajCatreClientText = linii.slice(4).join('\n');

  return {
    clientNameText,
    clientEmailText,
    clientTelefonText,
    clientWebsiteText,
    mesajCatreClientText
  };
}

module.exports = { genereazaLeadAI };
