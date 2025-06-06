// utils/wix-data.js
const axios = require('axios');

// Obține toate firmele fără lead
async function getFirmeFaraLead() {
  try {
    const response = await axios.get('https://www.skywardflow.com/_functions/firme-fara-lead');
    return response.data;
  } catch (error) {
    console.error('❌ Eroare în getFirmeFaraLead:', error.message);
    throw error;
  }
}

// Obține datele unei firme după ID
async function getFirmaById(firmaId) {
  try {
    const response = await axios.get(`https://www.skywardflow.com/_functions/firma?firmaId=${firmaId}`);
    return response.data;
  } catch (error) {
    console.error('❌ Eroare în getFirmaById:', error.message);
    throw error;
  }
}

// ✅ Export corect
module.exports = {
  getFirmeFaraLead,
  getFirmaById
};
