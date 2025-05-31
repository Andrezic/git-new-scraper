// utils/wix-data.js
const axios = require('axios');

async function getFirmaById(firmaId) {
  const response = await axios.post('https://www.skywardflow.com/_functions-dev/get-profil-firme', {
    firmaId
  }, {
    headers: {
      Authorization: process.env.WIX_API_KEY,
      'Content-Type': 'application/json'
    }
  });

  return response.data;
}


module.exports = { getFirmaById };
