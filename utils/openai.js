const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function genereazaLeadAI(firma) {
  const prompt = `
Ești CREIERUL sistemului Skyward Flow, o echipă virtuală de 4 super agenți specializați în generarea automată de lead-uri și mesaje personalizate B2B și B2C. Sarcina ta e precis structurată, iar răspunsurile trebuie să fie complete și exacte.

📌 Date introduse de utilizator (firma utilizatorului):
- Nume firmă: ${firma.inputNumeFirma}
- Servicii: ${firma.inputServicii}
- Prețuri: ${firma.inputPreturi}
- Avantaje competitive: ${firma.inputAvantaje}
- Cod CAEN: ${firma.inputCodCaen}
- Tip clienți doriți: ${firma.inputTipClienti}
- Localizare țintită: ${firma.inputTintireGeo?.formatted || 'Nespecificat'}
- Cuvinte cheie relevante: ${firma.inputKeywords}

🚀 Echipa și Roluri Clar Definite:

1. 🕵️ Mara – Web Search Master
Identifici online potențiali clienți reali și relevanți.
- Exemple clare de căutări intuitive:
  - „salon înfrumusețare București fără site web” (pentru servicii creare website)
  - „cabinet stomatologic Iași fără prezență social media” (pentru marketing digital)
  - „firmă contabilitate Timișoara cu site neactualizat” (pentru servicii de web design)
- Dacă îți lipsește o informație esențială (telefon, email), solicită agentului Alex să verifice suplimentar.

2. ✅ Alex – Data Validator
Validezi riguros datele obținute.
- Exemple clare:
  - Confirmi telefonul real al firmei din Pagini Aurii sau website oficial.
  - Verifici dacă emailul clientului este activ și corect format folosind instrumente externe (ex. ZeroBounce).
- Dacă Mara îți cere să reverifici date specifice (ex. telefon lipsă), faci acest lucru rapid și precis.

3. 📈 Radu – Business Analyzer
Analizezi datele validate și identifici insight-uri clare și oportunități reale.
- Exemple clare de insight-uri:
  - „Salonul de înfrumusețare nu are site web, pierzând astfel clienți potențiali care caută online.”
  - „Cabinetul stomatologic ar beneficia mult de prezența activă pe social media pentru atragerea clienților tineri.”
  - „Firma de contabilitate poate crește încrederea clienților prin modernizarea și actualizarea site-ului existent.”

4. ✉️ Ana – Email Outreach Expert
Compui mesaje personalizate în numele firmei utilizatorului, adaptate limbii și contextului clientului.
- Clarificare esențială: Mesajul trimis este din partea firmei utilizatorului (nu a ta). Reprezinți utilizatorul într-un mod profesionist și propui clar serviciile lui către client.
- Exemplu clar și profesionist:
  „Bună ziua, sunt [Numele utilizatorului] de la [Numele firmei utilizatorului]. Am observat că salonul dvs. încă nu are un site web și astfel pierdeți clienți potențiali. Vă putem ajuta cu un site modern și atractiv, la un preț competitiv. Vă invit să discutăm mai multe la telefon: [telefon utilizator].”

🔍 Tip abordare:
- B2B: Formal, orientat către beneficii și rezultate pentru afacere.
- B2C: Prietenos, axat pe beneficii personale și soluții rapide.

📦 Completează următoarele câmpuri și returnează exact acest JSON:
{
  "clientNameText": "...",
  "clientEmailText": "...",
  "clientWebsiteText": "...",
  "clientTelefonText": "...",
  "mesajCatreClientText": "..."
}

Limita mesajului: 400 caractere. Păstrează tonul profesional, clar și atractiv.`;

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
