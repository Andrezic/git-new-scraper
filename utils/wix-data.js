const axios = require('axios');

async function getFirmaById(firmaId, doarFirmeFaraLead = false) {
  try {
    if (doarFirmeFaraLead) {
      const { data } = await axios.get('https://www.skywardflow.com/_functions/firme-fara-lead');
      return data;
    }

    const { data } = await axios.get(`https://www.skywardflow.com/_functions/profil-firma/${firmaId}`);
    return data;
  } catch (error) {
    console.error('❌ Eroare getFirmaById:', error.message);
    throw error;
  }
}

module.exports = { getFirmaById };
