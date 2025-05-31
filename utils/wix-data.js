const axios = require('axios');

async function getFirmeFaraLead() {
  try {
    const response = await axios.get('https://www.skywardflow.com/_functions/firme-fara-lead');
    return response.data.firme || [];
  } catch (err) {
    console.error('❌ Eroare la getFirmeFaraLead:', err.message);
    return [];
  }
}

module.exports = { getFirmeFaraLead };
