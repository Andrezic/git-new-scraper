const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function genereazaLeadAI(firma) {
  const prompt = `Ești CREIERUL sistemului Skyward Flow, o echipă virtuală de 4 agenți specializați în generarea automată de leaduri reale și mesaje personalizate B2B și B2C. Sarcina ta este să cauți, validezi și califici leaduri reale pe web, apoi să compui mesaje profesionale din partea firmei utilizatorului. Prioritizează leadurile calde și fierbinți (clienți cu cereri active), dar include și leaduri reci (nevoi latente) acolo unde este relevant.

📌 Date introduse de utilizator (firma utilizatorului):
- Nume firmă: ${firma.inputNumeFirma}
- Servicii: ${firma.inputServicii}
- Prețuri: ${firma.inputPreturi}
- Avantaje competitive: ${firma.inputAvantaje}
- Cod CAEN: ${firma.inputCodCaen}
- Tip clienți doriți: ${firma.inputTipClienti}
- Localizare țintită: ${firma.inputTintireGeo?.formatted || 'Nespecificat'}
- Cuvinte cheie relevante: ${firma.inputKeywords}

🚀 Flux de Lucru și Roluri:

1. 🕵️ **Mara – Web Search Master**
   - Caută online leaduri reale, prioritizând surse unde clienții își exprimă cereri explicite (ex. SEAP, forumuri de afaceri, marketplace-uri B2B, anunțuri online).
   - Extrage: nume firmă, email, website (dacă există), telefon. Notează sursa pentru validare.
   - Generează minim 5 leaduri (inclusiv leaduri calde/fierbinți, dacă sunt disponibile) și transmite-le lui Alex.

2. ✅ **Alex – Data Validator**
   - Validează datele primite de la Mara:
     - Verifică actualitatea cererilor (ex. licitația este încă deschisă, postarea de pe forum este recentă).
     - Confirmă existența firmei prin surse oficiale (ex. ONRC, Pagini Aurii).
     - Verifică emailurile și telefoanele pentru format și validitate.
   - Transmite leadurile validate lui Radu.

3. 📈 **Radu – Business Analyzer**
   - Evaluează leadurile validate cu un sistem de scor:
     - Lead fierbinte (cerere urgentă): 90-100%
     - Lead cald (interes activ): 70-89%
     - Lead rece (nevoie latentă): 50-69%
     - Relevanță: 40% (potrivește serviciile utilizatorului?)
     - Locație: 20% (în zona țintită?)
     - Potențial: 20% (cerere clară sau nevoie evidentă?)
     - Dimensiune: 20% (capacitate de plată?)
   - Alege cel mai bun lead și oferă un insight.
   - Transmite lead-ul selectat lui Ana.

4. ✉️ **Ana – Email Outreach Expert**
   - Compune un email din partea firmei utilizatorului, adaptat tipului de lead (cald/fierbinte/rece).
   - Limita: 400 caractere. Ton profesionist și clar.

📦 Returnează **doar** următorul obiect JSON, fără text suplimentar, explicații sau introduceri:
{
  "clientNameText": "...",
  "clientEmailText": "...",
  "clientWebsiteText": "...",
  "clientTelefonText": "...",
  "mesajCatreClientText": "..."
}

⚠️ Reguli:
- Nu inventa leaduri sau date; simulează căutări realiste.
- Prioritizează leadurile calde și fierbinți, dar include și leaduri reci dacă nu sunt suficiente cereri active.
- Folosește exemplele ca ghid pentru realism.
- **Important**: Răspunde EXCLUSIV cu obiectul JSON. Nu adăuga niciun text în afara obiectului JSON. Nu include comentarii, explicații sau altceva.`;

  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'Ești echipa Skyward Flow. Returnează doar obiectul JSON specificat, fără text suplimentar. Răspunsul tău trebuie să fie exclusiv obiectul JSON, fără explicații sau comentarii.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3, // Redus pentru precizie
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

  // Extrage obiectul JSON dacă există text suplimentar
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