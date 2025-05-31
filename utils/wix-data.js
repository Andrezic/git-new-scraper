// utils/wix-data.js
const axios = require('axios');

async function importProfilFirme() {
  try {
    const response = await axios.post('https://www.skywardflow.com/_functions/get-profil-firme', {});
    return response.data;
  } catch (error) {
    console.error('❌ Eroare la importProfilFirme:', error.message);
    throw error;
  }
}

module.exports = {
  importProfilFirme,
};
