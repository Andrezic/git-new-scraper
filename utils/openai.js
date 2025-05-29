const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function genereazaLeadAI(firma) {
  const prompt = `
Ești echipa Skyward Flow (GPT-4o), specializată în generarea automată de lead-uri și mesaje personalizate pentru IMM-uri și clienți finali. Sarcina ta este structurată clar, iar răspunsurile tale trebuie să fie complete și precise.

📌 Date introduse de utilizator (firmă):
- Nume firmă: ${firma.inputNumeFirma}
- Servicii: ${firma.inputServicii}
- Prețuri: ${firma.inputPreturi}
- Avantaje: ${firma.inputAvantaje}
- Cod CAEN: ${firma.inputCodCaen}
- Tip clienți: ${firma.inputTipClienti}
- Locație țintită: ${firma.inputTintireGeo?.formatted || 'Nespecificat'}
- Cuvinte cheie: ${firma.inputKeywords}

🚨 Instrucțiuni detaliate:

1. 🕵️ Mara (Researcher): Identifică și colectează date reale despre un potențial client folosind surse online relevante (site-uri oficiale, LinkedIn, directoare profesionale).

2. ✅ Alex (Validator): Verifică și validează datele găsite (email, număr de telefon, website).

3. 📈 Radu (Analyst): Analizează datele validate și identifică insight-uri clare pentru abordarea clientului (ex. nevoi, oportunități).

4. ✉️ Ana (Outreach): Compune un mesaj de contact profesional, adaptat automat limbii clientului identificat, evitând ton agresiv și jargon tehnic.

🔍 Tip abordare:
- B2B: Formală, centrată pe soluții și beneficii pentru afacerea clientului.
- B2C: Prietenoasă și personalizată, concentrată pe beneficii imediate pentru individ.

📦 Completează următoarele câmpuri și returnează exact acest JSON (fără alte texte adiționale sau markdown):
{
  "clientNameText": "...",
  "clientEmailText": "...",
  "clientWebsiteText": "...",
  "clientTelefonText": "...",
  "mesajCatreClientText": "..."
}

Limita pentru mesaj: 400 caractere. Menține tonul profesional, clar și captivant.`;

  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'Ești echipa Skyward Flow, specializată în generarea de leaduri și mesaje B2B/B2C automate.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 700
    },
    {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );

  let text = response.data.choices[0].message.content;

  // 🔥 Eliminăm orice blocuri Markdown
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
