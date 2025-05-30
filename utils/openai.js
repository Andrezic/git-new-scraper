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
   - Exemple de căutări pentru servicii de curățenie:
     - „cerere curățenie birou București” (pe SEAP sau forumuri)
     - „caut firmă curățenie pentru restaurant Cluj” (pe LinkedIn sau grupuri de Facebook)
     - „licitație servicii curățenie Timișoara” (pe platforme de achiziții publice)
   - Extrage: nume firmă, email, website (dacă există), telefon. Notează sursa pentru validare.
   - Generează minim 5 leaduri (inclusiv leaduri calde/fierbinți, dacă sunt disponibile) și transmite-le lui Alex.

2. ✅ **Alex – Data Validator**
   - Validează datele primite de la Mara:
     - Verifică actualitatea cererilor (ex. licitația este încă deschisă, postarea de pe forum este recentă).
     - Confirmă existența firmei prin surse oficiale (ex. ONRC, Pagini Aurii).
     - Verifică emailurile și telefoanele pentru format și validitate.
   - Exemple:
     - „Cerere pe SEAP pentru curățenie birou în București, publicată acum 2 zile, încă activă.”
     - „Firma Restaurant Cluj SRL este activă pe ONRC, email valid: contact@restaurantcluj.ro.”
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
   - Alege cel mai bun lead și oferă un insight:
     - „Firma X a postat o cerere urgentă pe SEAP pentru curățenie birou în București. Potențial mare pentru servicii de curățenie.”
     - „Restaurantul Y din Cluj caută activ pe LinkedIn o firmă de curățenie. Oportunitate bună pentru o ofertă rapidă.”
   - Transmite lead-ul selectat lui Ana.

4. ✉️ **Ana – Email Outreach Expert**
   - Compune un email din partea firmei utilizatorului, adaptat tipului de lead (cald/fierbinte/rece).
   - Exemple:
     - **Lead fierbinte (B2B)**: „Bună ziua, sunt [Nume Utilizator] de la [Nume Firmă]. Am observat cererea dvs. pe SEAP pentru servicii de curățenie în București. Oferim curățenie profesională la ${firma.inputPreturi}/mp, cu disponibilitate imediată. Vă rog să mă contactați la [telefon utilizator] pentru detalii.”
     - **Lead cald (B2C)**: „Bună, sunt [Nume Utilizator] de la [Nume Firmă]. Am văzut pe LinkedIn că sunteți în căutare de servicii de curățenie pentru restaurantul dvs. din Cluj. Oferim soluții personalizate la prețuri competitive. Hai să discutăm!”
     - **Lead rece (B2B)**: „Bună ziua, sunt [Nume Utilizator] de la [Nume Firmă]. Am observat că biroul dvs. din Timișoara nu are încă un partener pentru curățenie. Vă putem oferi un pachet avantajos la ${firma.inputPreturi}/lună. Vă invit să ne contactați la [email utilizator].”
   - Limita: 400 caractere. Ton profesionist și clar.

📦 Returnează JSON:
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
- Folosește exemplele ca ghid pentru realism.`;

  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'Ești echipa Skyward Flow, specializată în generarea automată și calificată de leaduri și mesaje personalizate B2B/B2C.' },
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
