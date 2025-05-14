// utils/openai.js
const axios = require('axios');
require('dotenv').config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = 'gpt-4o';

async function genereazaTextLead(lead) {
  // Construim prompt-ul cu toate câmpurile relevante
  const prompt = `Ai primit aceste date din formular:
- Cod CAEN: ${lead.inputCodCaen}
- CUI: ${lead.inputCui}
- Nr. angajați: ${lead.numarAngajati}
- Tip colaborare: ${lead.inputTipColaborare}
- Dimensiune client: ${lead.inputDimensiuneClient}
- Keywords: ${lead.inputKeywords}
- Cerințe extra: ${lead.inputCerinteExtra}
- Țintire geo: ${lead.inputTintireGeo}
- Localizare: ${lead.inputLocalizare}
- Descriere: ${lead.inputDescriere}
… (alte câmpuri relevante) …
Pe baza lor, redactează un email B2B profesional.
`;

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

    const mesaj = response.data.choices[0].message.content.trim();
    console.log("🤖 Mesaj generat de AI:", mesaj);
    return mesaj;
  } catch (error) {
    console.error("❌ Eroare OpenAI:", error.response?.data || error.message);
    return "Nu s-a putut genera mesajul automat.";
  }
}

module.exports = { genereazaTextLead };
