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
📦 Firma: ${firma.inputNumeFirma}
🌐 Website: ${firma.inputWebsiteFirma}
📧 Email: ${firma.inputEmailFirma}
📞 Telefon: ${firma.inputTelefonFirma}
🛠️ Servicii: ${firma.inputServicii}
💡 Avantaje: ${firma.inputAvantaje}
💰 Preturi: ${firma.inputPreturi}
🧩 Tip client dorit: ${firma.inputTipClienti}
🏢 Dimensiune client: ${firma.inputDimensiuneClient}
📍 Zona target: ${firma.inputTintireGeo?.formatted || ''}
🗺️ Localizare firma: ${firma.inputLocalizare?.formatted || ''}
🔍 Cuvinte cheie: ${firma.inputKeywords}
📜 Descriere: ${firma.inputDescriere}
📗 Cod CAEN: ${firma.inputCodCaen}
🧠 Context coduri CAEN:
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
  const [clientNameText, clientEmailText, clientTelefonText, clientWebsiteText, mesajCatreClientText] = rezultat.split('\n').map(line => line.trim());

  return {
    clientNameText,
    clientEmailText,
    clientTelefonText,
    clientWebsiteText,
    mesajCatreClientText
  };
}

module.exports = { genereazaLeadAI };
