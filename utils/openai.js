const fs = require('fs');
const path = require('path');
const { default: OpenAI } = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const mdPath = path.join(__dirname, '..', 'coduri_CAEN_b2b_detaliat.md');
console.log('[🧠 AI] Încarc codurile CAEN din:', mdPath);

const coduriCaenContent = fs.readFileSync(mdPath, 'utf-8');

async function genereazaTextLead(firma) {
  console.log('[🧠 AI] Firma primită pentru generare lead:\n', firma);

  const {
    inputNumeFirma,
    inputServicii,
    inputPreturi,
    inputAvantaje,
    inputCodCaen,
    inputTipClienti,
    inputLocalizare,
    inputWebsiteFirma,
    inputCui,
    inputDimensiuneClient,
    inputTipColaborare,
    inputKeywords,
    inputCerinteExtra,
    inputDescriere
  } = firma;

  const finalSystemPrompt = `
Tu ești un sistem AI avansat format din 4 agenți colaborativi. Scopul tău este să generezi un lead real și calificat pentru firma de mai jos, iar dacă nu există niciun lead valid, explici clar de ce, fără a inventa date. Fără excepție.

🔍 **Datele firmei care caută clienți B2B**:
- Nume firmă: ${inputNumeFirma}
- Servicii: ${inputServicii}
- Prețuri: ${inputPreturi}
- Avantaje competitive: ${inputAvantaje}
- Cod CAEN: ${inputCodCaen}
- Tip clienți targetați: ${inputTipClienti}
- Localizare: ${JSON.stringify(inputLocalizare)}
- Website: ${inputWebsiteFirma}
- CUI: ${inputCui}
- Dimensiunea clientului ideal: ${inputDimensiuneClient}
- Tip colaborare dorit: ${inputTipColaborare}
- Cuvinte cheie importante: ${inputKeywords}
- Cerințe extra: ${inputCerinteExtra}
- Descriere firmă: ${inputDescriere}

📄 **Lista completă de compatibilități CAEN (pentru Mara):**
${coduriCaenContent}

🎯 Obiectivul tău este să găsești o firmă reală, compatibilă, validată, și să compui un mesaj de contact în numele firmei de mai sus.

---

👩‍💻 *Mara – Agent de căutare*  
Găsește o firmă B2B reală, cu website activ, contact valid și activitate compatibilă cu profilul firmei utilizatorului. Folosește codul CAEN, industria, localizarea și criteriile oferite. Respinge orice rezultat cu site inexistent, în construcție sau lipsă date de contact.

🧑‍💼 *Alex – Validator tehnic*  
Verifică dacă firma găsită de Mara are website activ, email/telefon valid, pagină funcțională. Dacă firma nu trece validarea, întoarce controlul la Mara pentru o altă alegere.

📊 *Radu – Analist strategic*  
Evaluează dacă această firmă este un match B2B potrivit. Dacă nu este, explică exact de ce și ce ar trebui ajustat. Dacă este potrivită, aprobă pentru trimiterea mesajului.

✍️ *Ana – Copywriter AI*  
Scrie un email profesional, prietenos și clar în numele firmei utilizatorului (${inputNumeFirma}), nu în numele Skyward Flow. Include:
- Salut personalizat
- Prezentarea firmei și avantajele
- Ce oferim concret
- De ce acest client este potrivit
- Call to action clar
- Semnătură personalizată cu ${inputNumeFirma}

⚠️ Dacă NU există niciun lead real valid, răspunde doar cu motivul (ex: lipsă date, lipsă firme compatibile) și NU inventa un lead.

---

✅ Outputul final trebuie să conțină:
- Nume client
- Email client
- Website client
- Telefon (dacă există)
- Mesajul compus de Ana (gata de trimis)
`;

  console.log('[🧠 AI] Trimit promptul către GPT-4o...');

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: finalSystemPrompt },
      { role: 'user', content: 'Găsește un lead real valid și redactează mesajul final conform instrucțiunilor de mai sus.' }
    ],
    temperature: 0.6
  });

  const result = completion.choices[0].message.content;
  console.log('[🧠 AI] Răspuns GPT-4o primit:\n', result);

  return result;
}

module.exports = { genereazaTextLead };
