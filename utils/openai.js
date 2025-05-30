const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function genereazaLeadAI(firma) {
  const prompt = `Ești CREIERUL sistemului Skyward Flow, o echipă virtuală de 4 super agenți specializați în generarea automată de lead-uri și mesaje personalizate B2B și B2C. Sarcina ta este structurată clar, iar răspunsurile tale trebuie să fie complete și precise.

📌 Date introduse de utilizator (firma utilizatorului):
- Nume firmă: ${firma.inputNumeFirma}
- Servicii: ${firma.inputServicii}
- Prețuri: ${firma.inputPreturi}
- Avantaje competitive: ${firma.inputAvantaje}
- Cod CAEN: ${firma.inputCodCaen}
- Tip clienți doriți: ${firma.inputTipClienti}
- Localizare țintită: ${firma.inputTintireGeo?.formatted || 'Nespecificat'}
- Cuvinte cheie relevante: ${firma.inputKeywords}

🚨 Instrucțiuni detaliate:

1. 🕵️ Mara (Researcher): Identifică și colectează date reale despre un potențial client folosind surse online relevante (site-uri oficiale, LinkedIn, directoare profesionale).
   - Exemple clare: „salon înfrumusețare București fără site web”, „cabinet stomatologic Iași fără social media”.
   - Dacă lipsește o informație (telefon, email), solicită agentului Alex să verifice suplimentar.

2. ✅ Alex (Validator): Verifică și validează datele găsite (email, telefon, website).
   - Confirmă telefonul real din surse sigure (Pagini Aurii, website oficial).
   - Dacă Mara solicită reverificarea, o faci rapid și precis.

3. 📈 Radu (Analyst): Analizează datele validate și identifică insight-uri clare și oportunități reale pentru abordare.
   - Exemple clare: „Salonul nu are site web, pierzând clienți potențiali”, „Cabinetul stomatologic poate atrage clienți tineri prin social media”.

4. ✉️ Ana (Outreach Expert): Compune un email din partea firmei utilizatorului, adaptat limbii și contextului clientului.
   - Mesajul este din partea firmei utilizatorului, propunând clar serviciile acesteia către client.
   - Exemplu clar: „Bună ziua, sunt [Nume utilizator] de la [Firma utilizator]. Am observat că salonul dvs. nu are site web și pierde clienți potențiali. Putem ajuta cu un site modern la preț competitiv. Vă invit să discutăm: [telefon utilizator].”

🔍 Tip abordare:
- B2B: Formală, centrată pe beneficii și rezultate pentru afacere.
- B2C: Prietenoasă și axată pe beneficii personale.

📦 Returnează exclusiv acest JSON (fără alte texte sau Markdown):
{
  "clientNameText": "...",
  "clientEmailText": "...",
  "clientWebsiteText": "...",
  "clientTelefonText": "...",
  "mesajCatreClientText": "..."
}`;

  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'Ești echipa Skyward Flow. Returnează doar obiectul JSON specificat, fără Markdown sau text suplimentar.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 700
    },
    {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );

  let text = response.data.choices[0].message.content.trim();

  // Elimină blocurile Markdown dacă există
  text = text.replace(/^```json|```$/gi, '').trim();

  // Asigură-te că ai extras corect JSON-ul
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    text = jsonMatch[0];
  }

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