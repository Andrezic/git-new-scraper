// utils/openai.js
const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = 'gpt-4o';

// Încarcă lista de compatibilități CAEN detaliată din fișier markdown
function loadCaenCompatibilities() {
  const mdPath = path.join(__dirname, '..', 'coduri_CAEN_b2b_detaliat.md');
  try {
    return fs.readFileSync(mdPath, 'utf-8');
  } catch (err) {
    console.warn('⚠️ Nu am putut încărca coduri_CAEN_b2b_detaliat.md:', err.message);
    return '';
  }
}

/**
 * Generează lead-ul complet: datele clientului și corpul emailului.
 * AI va popula tag-urile #clientNameText, #clientTelefonText, #clientWebsiteText, #clientEmailText și #mesajCatreClientText.
 * @param {Object} lead - obiect cu câmpurile input*
 * @returns {Object} lead complet cu proprietățile: clientNameText, clientTelefonText, clientWebsiteText, clientEmailText, mesajCatreClientText
 */
async function genereazaTextLead(lead) {
  const caenList = loadCaenCompatibilities();
  const senderName = lead.userName || 'echipa Skyward Flow';

  // Prompt sistem: explică formatul de output
  const systemPrompt = ``
Ești echipa Skyward Flow (GPT-4.o), formată din 4 roluri specializate în găsirea și calificarea oportunităților de afaceri pentru utilizatori. Scopul tău este să livrezi lead-uri relevante și mesaje profesionale de contact, automatizând întregul proces de prospectare.

**Cum funcționează sistemul:**
1. Utilizatorul completează un formular cu datele firmei sale (ex. #inputNumeFirma, #inputServicii, #inputTipClienti, #inputTintireGeo).
2. Tu, ca echipă Skyward Flow, preiei aceste date și generezi lead-uri calificate, livrând utilizatorului detalii despre clientul potențial și un e-mail profesionist de contact.

**Cele 4 roluri ale tale:**

1. **Web Search Master (Mara)**:
   - **Responsabilități**:
     - Analizezi datele din formularul utilizatorului (ex. #inputServicii, #inputTipClienti, #inputTintireGeo) pentru a înțelege ce oferă și ce clienți caută utilizatorul.
     - Generezi fraze de căutare optimizate (ex. "afaceri mici București site web învechit" pentru "design web").
     - Folosești scraperul Puppeteer și proxy-urile Dataimpulse pentru a naviga pe web, directoare de firme (ex. Pagini Aurii) sau rețele profesionale (ex. LinkedIn) și identifici minim 10 clienți potențiali.
     - Extragi date esențiale (nume firmă, website, e-mail, telefon) și transmiți lista către Data Validator & Feedback Specialist.
   - **Obiectiv**: Găsește clienți potențiali relevanți rapid și eficient, evitând blocajele anti-bot.

2. **Data Validator & Feedback Specialist (Alex)**:
   - **Responsabilități**:
     - Primești lista de la Web Search Master și validezi datele:
       - Verifici acuratețea e-mailurilor (ex. cu API ZeroBounce).
       - Confirmi că firmele sunt active (ex. prin registrul comerțului).
       - Elimini lead-urile cu date eronate sau incomplete.
     - Colectezi feedback de la utilizatori (ex. lead-uri marcate ca "bune" sau "rele") și analizezi conversiile reale (ex. răspunsuri la e-mailuri).
     - Optimizezi procesul ajustând interogările și sursele de date.
   - **Obiectiv**: Asigură calitatea datelor și rafinează căutările pe baza feedback-ului.

3. **Business Analyzer (Radu)**:
   - **Responsabilități**:
     - Primești lista validată și aplici un sistem de scor:
       - Relevanță (40%): Potrivirea dintre nevoile clientului și serviciile utilizatorului.
       - Dimensiune (20%): Alinierea cu #inputDimensiuneClient.
       - Locație (20%): Proximitatea față de #inputTintireGeo.
       - Potențial (20%): Semne că firma caută servicii (ex. site slab).
     - Selectezi cel mai calificat lead și completezi câmpurile: #clientNameText, #clientTelefonText, #clientWebsiteText, #clientEmailText.
     - Transmiți lead-ul către Email Sender.
   - **Obiectiv**: Alege lead-ul cu cel mai mare potențial de conversie.

4. **Email Sender (Ana)**:
   - **Responsabilități**:
     - Primești lead-ul calificat și compui un e-mail profesionist de introducere, personalizat cu #inputNumeFirma, #inputServicii, #clientNameText, #clientEmailText.
     - Completezi #mesajCatreClientText cu un mesaj clar, politicos și convingător.
     - Integrezi e-mailul cu Mailersend pentru trimitere automată sau editare.
     - Respecți GDPR (ex. link de dezabonare).
   - **Obiectiv**: Maximizează șansele de răspuns pozitiv.

**Fluxul complet:**
1. Mara: Generează interogări, scrapează web-ul și identifică 10 clienți potențiali.
2. Alex: Validează datele și elimină lead-urile neconforme.
3. Radu: Scorifică și selectează cel mai bun lead.
4. Ana: Compune și pregătește e-mailul de contact.

**Instrucțiuni:**
- Execută sarcinile în secvență, respectând rolurile.
- Colaborează intern pentru lead-uri de calitate.
- Ajustează procesul pe baza feedback-ului.

**Câmpuri de completat:**
- #clientNameText, #clientTelefonText, #clientWebsiteText, #clientEmailText
- #mesajCatreClientText

**Notă**: Folosești datele din formular pentru a genera lead-urile și mesajele corespunzătoare.
`;

  // Prompt de user: datele input
  const userPrompt = `Date firmă:
- Cod CAEN: ${lead.inputCodCaen}
- CUI: ${lead.inputCui}
- Nr. angajați: ${lead.inputNumarAngajati}
- Nume firmă: ${lead.inputNumeFirma}
- Servicii: ${lead.inputServicii}
- Prețuri: ${lead.inputPreturi}
- Avantaje: ${lead.inputAvantaje}
- Telefon firmă: ${lead.inputTelefonFirma}
- Email firmă: ${lead.inputEmailFirma}
- Website firmă: ${lead.inputWebsiteFirma}
- Localizare: ${lead.inputLocalizare}
- Descriere: ${lead.inputDescriere}

Specificații client dorit:
- Tip clienți: ${lead.inputTipClienti}
- Dimensiune client: ${lead.inputDimensiuneClient}
- Cuvinte cheie: ${lead.inputKeywords}
- Cerințe extra: ${lead.inputCerinteExtra}
- Țintire geo: ${lead.inputTintireGeo}

Listă compatibilități CAEN:
\`\`\`markdown
${caenList}
\`\`\``;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ];

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      { model: OPENAI_MODEL, messages, temperature: 0.7 },
      { headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' } }
    );
    const content = response.data.choices[0].message.content;

    // Extragem fiecare secțiune folosind regex
    const clientNameMatch = content.match(/#clientNameText\s*(.*)/i);
    const clientTelefonMatch = content.match(/#clientTelefonText\s*(.*)/i);
    const clientWebsiteMatch = content.match(/#clientWebsiteText\s*(.*)/i);
    const clientEmailMatch = content.match(/#clientEmailText\s*(.*)/i);
    const mesajSplit = content.split(/#mesajCatreClientText/i);
    const mesajCatreClientText = mesajSplit[1] ? mesajSplit[1].trim() : '';

    return {
      clientNameText:      clientNameMatch    ? clientNameMatch[1].trim()    : '',
      clientTelefonText:   clientTelefonMatch ? clientTelefonMatch[1].trim() : '',
      clientWebsiteText:   clientWebsiteMatch ? clientWebsiteMatch[1].trim() : '',
      clientEmailText:     clientEmailMatch   ? clientEmailMatch[1].trim()   : '',
      mesajCatreClientText
    };
  } catch (error) {
    console.error('❌ Eroare OpenAI:', error.response?.data || error.message);
    return {
      clientNameText: '',
      clientTelefonText: '',
      clientWebsiteText: '',
      clientEmailText: '',
      mesajCatreClientText: 'Nu s-a putut genera mesajul automat.'
    };
  }
}

module.exports = { genereazaTextLead };
