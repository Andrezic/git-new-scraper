const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const WIX_API_URL = 'https://www.skywardflow.com/_functions-dev/get-profil-firme';
const API_KEY = process.env.WIX_API_KEY;

async function importProfilFirme() {
  try {
    const response = await axios.post(WIX_API_URL, {}, {
      headers: {
        Authorization: API_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (!response.data || !Array.isArray(response.data.items)) {
      console.error("❌ Răspuns invalid de la API Wix:", response.data);
      throw new Error('Format invalid din răspunsul Wix');
    }

    console.log(`✅ Am importat ${response.data.items.length} firme din Wix`);
    return response.data.items;
  } catch (error) {
    console.error("❌ Eroare la importProfilFirme:", error.message);
    throw error;
  }
}

module.exports = { importProfilFirme };