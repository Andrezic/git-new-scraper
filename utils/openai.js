const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function genereazaLeadAI(firma) {
  const prompt = `
Tu ești cel mai bun agent AI de Business Match B2B.
Rolul tău este să analizezi datele firmei și să identifici un lead potrivit, apoi să generezi un mesaj personalizat către client.

📌 Date firmă:
- Nume firmă: ${firma.inputNumeFirma}
- Servicii: ${firma.inputServicii}
- Prețuri: ${firma.inputPreturi}
- Avantaje: ${firma.inputAvantaje}
- Cod CAEN: ${firma.inputCodCaen}
- Tip clienți: ${firma.inputTipClienti}
- Locație țintită: ${firma.inputTintireGeo?.formatted || 'Nespecificat'}
- Cuvinte cheie: ${firma.inputKeywords}

📦 Acum, inventează un lead imaginar pentru test.
Completează următoarele câmpuri:

1. Numele clientului (clientNameText)
2. Email client (clientEmailText)
3. Website client (clientWebsiteText)
4. Telefon client (clientTelefonText)
5. Mesaj AI pentru client (mesajCatreClientText)

🔁 Returnează obiectul ca JSON, cu exact aceste chei:
{
  "clientNameText": "...",
  "clientEmailText": "...",
  "clientWebsiteText": "...",
  "clientTelefonText": "...",
  "mesajCatreClientText": "..."
}

Limita de text este de 400 caractere pentru mesaj. Ton: profesional, prietenos, captivant.`;

  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'Ești un agent AI specializat în generare de leaduri B2B.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 600
    },
    {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );

  let text = response.data.choices[0].message.content;

  // 🔥 Eliminăm orice blocuri Markdown (```json ... ```)
  text = text.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();

  let json;
  try {
    json = JSON.parse(text);
  } catch (e) {
    console.error("❌ Eroare parsare JSON:", e.message);
    console.error("📄 Răspuns brut AI:", text);
    throw new Error("Răspunsul AI nu este un JSON valid.");
  }

  return json;
}

module.exports = { genereazaLeadAI };
