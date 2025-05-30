
const fs = require('fs');
const path = require('path');
const { default: OpenAI } = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const mdPath = path.join(__dirname, '..', 'coduri_CAEN_b2b_detaliat.md');
const coduriCaenContent = fs.readFileSync(mdPath, 'utf-8');

async function genereazaLeadAI({ firmaUtilizator, leadPropus }) {
  console.log('[🧠 AI] Firma utilizator:', firmaUtilizator.inputNumeFirma);
  console.log('[🧠 AI] Lead propus:', leadPropus.clientNameText);

  const prompt = `
Tu ești un sistem AI avansat format din 4 agenți colaborativi. Scopul tău este să validezi leadul propus mai jos pentru firma care caută parteneri B2B. Nu ai voie să inventezi. Dacă leadul nu este valid sau nu este potrivit, explică motivul. Dacă este potrivit, redactează mesajul de contact conform regulilor.

🔍 Firma utilizator:
- Nume: ${firmaUtilizator.inputNumeFirma}
- Servicii: ${firmaUtilizator.inputServicii}
- Prețuri: ${firmaUtilizator.inputPreturi}
- Avantaje: ${firmaUtilizator.inputAvantaje}
- Cod CAEN: ${firmaUtilizator.inputCodCaen}
- Localizare: ${JSON.stringify(firmaUtilizator.inputLocalizare)}
- Tip clienți: ${firmaUtilizator.inputTipClienti}
- Website: ${firmaUtilizator.inputWebsiteFirma}
- CUI: ${firmaUtilizator.inputCui}

📄 Lista CAEN compatibilități:
${coduriCaenContent}

🏢 Lead propus:
- Nume client: ${leadPropus.clientNameText}
- Email: ${leadPropus.clientEmailText}
- Website: ${leadPropus.clientWebsiteText}
- Telefon: ${leadPropus.clientTelefonText}

👩‍💻 *Mara* validează dacă firma e reală, cu site activ.
🧑‍💼 *Alex* verifică dacă datele sunt valide și active.
📊 *Radu* analizează dacă e un match potrivit pentru utilizator.
✍️ *Ana* scrie un email de contact în numele ${firmaUtilizator.inputNumeFirma}, nu Skyward Flow. Include:
- Salut personalizat
- Ce oferim
- De ce clientul este potrivit
- Call to action clar
- Semnătură cu ${firmaUtilizator.inputNumeFirma}

⚠️ Dacă leadul nu este valid, răspunde doar cu explicația. Nu inventa niciun lead!

✅ Outputul final trebuie să conțină:
- clientNameText
- clientEmailText
- clientWebsiteText
- clientTelefonText
- mesajCatreClientText

⚠️ Dacă leadul este valid, răspunde EXCLUSIV în format JSON:
{
  "clientNameText": "...",
  "clientEmailText": "...",
  "clientWebsiteText": "...",
  "clientTelefonText": "...",
  "mesajCatreClientText": "..."
}

Dacă leadul NU este valid, răspunde cu:
{ "error": "Motivul concret pentru care nu e valid." }
`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: prompt },
      { role: 'user', content: 'Evaluează leadul propus și redactează mesajul dacă este valid.' }
    ],
    temperature: 0.6
  });

  return completion.choices[0].message.content;
}

module.exports = { genereazaLeadAI };
