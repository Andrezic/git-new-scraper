// utils/openai.js
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = 'gpt-4'; // Poți schimba în gpt-3.5-turbo dacă vrei să economisești

export async function genereazaTextLead(profilFirma) {
  if (!OPENAI_API_KEY) {
    console.error("❌ Lipsă OPENAI_API_KEY în .env");
    return "Mesaj generat de rezervă – lipsă API KEY.";
  }

  const prompt = `
Tu ești un agent AI care ajută o firmă să își găsească clienți.
Folosind informațiile de mai jos despre firmă, generează un mesaj profesional și convingător, personalizat pentru a atrage un client potențial. Scrie la persoana întâi plural.

✅ Informații firmă:
Nume: ${profilFirma.inputNumeFirma}
Servicii: ${profilFirma.inputServicii}
Prețuri: ${profilFirma.inputPreturi}
Avantaje: ${profilFirma.inputAvantaje}
Tip clienți: ${profilFirma.inputTipClienti}
Website: ${profilFirma.inputWebsiteFirma}

🎯 Output așteptat:
Un mesaj scurt, clar, relevant, de 3-5 fraze, în stil profesional și convingător. Nu repeta informațiile brute, rescrie-le elegant pentru un potențial client.
  `.trim();

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
