// utils/openai.js
const axios = require('axios');
require('dotenv').config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = 'gpt-4o';

async function genereazaTextLead(lead) {
  // Construim prompt-ul cu toate câmpurile relevante
  const prompt = `Ai primit următoarele date extrase din formularul completat de IMM-ul care caută parteneri B2B (folosind ID-urile exacte ale câmpurilor din formular):

- Cod CAEN principal: [inputCodCaen]
- CUI/Nr. registru: [inputCui]
- Număr angajați: [numarAngajati]
- Nume firmă: [inputNumeFirma]
- Produse/Servicii oferite: [inputServicii]
- Prețuri: [inputPreturi]
- Avantaje competitive: [inputAvantaje]
- Tipul colaborării dorite: [inputTipColaborare]
- Dimensiunea clientului dorit: [inputDimensiuneClient]
- Cuvinte cheie relevante: [inputKeywords]
- Cerințe extra: [inputCerinteExtra]
- Țintire geografică: [inputTintireGeo]

Pe baza acestor date specifice, formulează interogări inteligente și precise pentru a găsi companii potrivite, folosind:

1. Interogări structurate pentru site-uri cu baze de date (ex: listafirme.ro, firme-on-line.ro), incluzând obligatoriu cod CAEN ([inputCodCaen]), localizarea ([inputTintireGeo]) și dimensiunea ([numarAngajati] sau [inputDimensiuneClient]).

2. Interogări Google avansate care combină explicit:
   - Produsele/serviciile ([inputServicii]).
   - Cuvinte cheie ([inputKeywords]) și tip colaborare ([inputTipColaborare]).
   - Zona geografică specificată ([inputTintireGeo]).

Oferă între 3-5 variante distincte de interogări clare, gata pentru scraping și căutare inteligentă.

Ai următoarele date despre firma IMM care caută parteneri, extrase din formular (cu ID-uri exacte):

- Nume firmă: [inputNumeFirma]
- Produse/Servicii oferite: [inputServicii]
- Avantaje competitive: [inputAvantaje]
- Tipul colaborării dorite: [inputTipColaborare]

Ai extras următorul conținut de pe site-ul companiei candidate:

[conținut extras de scraper]

Analizează acest conținut și verifică atent:

1. Compatibilitatea serviciilor firmei candidate cu serviciile IMM-ului ([inputServicii]). Confirmă explicit dacă există complementaritate evidentă și oportunități reale de colaborare.

2. Prezența termenilor-cheie pentru parteneriat, cum ar fi „colaborare”, „parteneri”, „distribuitori”, „rețea parteneri”.

3. Informații utile pentru personalizarea comunicării:
   - Motto-ul firmei, valori sau sloganuri relevante.
   - Proiecte recente, certificări sau realizări notabile.
   - Nume persoană de contact, dacă e specificat explicit pe site.

4. Calitatea și actualitatea site-ului:
   - Notează clar dacă site-ul nu oferă suficiente informații sau pare abandonat.

La final, concluzionează clar:
- **CONFIRMAT:** Firma este potrivită (include motive clare).
- **NECONFIRMAT:** Firma nu corespunde cerințelor (include motive clare).


Redactează un email de inițiere a colaborării B2B, folosind datele dinamice extrase din formularul IMM-ului și informațiile despre partenerul confirmat anterior:

👉 Date IMM (extrase din formular):
- Nume firmă: [inputNumeFirma]
- Produse/Servicii oferite: [inputServicii]
- Avantaje competitive: [inputAvantaje]
- Tip colaborare dorită: [inputTipColaborare]
- Prețuri (dacă sunt relevante pentru context): [inputPreturi]
- Website firmă: [inputWebsiteFirma]
- Localizare (opțional): [inputLocalizare]
- Descriere suplimentară (opțională): [inputDescriere]

👉 Date Partener (validate anterior):
- Nume firmă parteneră: [nume firma partenerului]
- Domeniu activitate: [domeniu partener]
- Produse/Servicii partener: [servicii partener]
- Detaliu notabil despre partener: [motto/proiect recent/certificare]
- Nume persoană de contact (opțional): [persoana contact]

✏️ Cerințe email:

- **Adresare:** Folosește numele persoanei de contact dacă există, altfel folosește salut generic („Stimată echipă [nume firmă parteneră]”).
- **Introducere:** Prezintă scurt și clar IMM-ul ([inputNumeFirma]), serviciile oferite ([inputServicii]) și avantajele competitive ([inputAvantaje]).
- **Motivul abordării:** Explică complementaritatea clară dintre IMM ([inputServicii]) și partener ([servicii partener]). Menționează detaliul notabil despre partener (motto, proiect etc.) într-un mod pozitiv și apreciativ.
- **Propunere concretă:** Detaliază beneficiile clare ale colaborării pentru ambele părți, inclusiv cum IMM-ul poate ajuta partenerul (accentuează avantajul competitiv al IMM-ului).
- **Ton și stil:** Politicos, profesionist, călduros, personalizat, fără clișee.
- **Apel la acțiune:** Invită explicit la o discuție detaliată sau întâlnire directă, oferind clar modalități de contact (email IMM: [inputEmailFirma], telefon IMM: [inputTelefonFirma]).

Redactează emailul complet și clar structurat (salut → prezentare IMM → motiv și apreciere partener → propunere concretă → apel la acțiune → semnătură clară: nume, funcție reprezentant, date de contact IMM).`;

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
