require('dotenv').config();
const axios = require('axios');
const agent = require('./utils/proxy');

// Exemplu endpoint de test pentru verificare IP prin proxy
const TEST_URL = 'https://api.ipify.org?format=json';

// Sau, când ești gata, endpoint-ul real Wix API
// const TEST_URL = 'https://www.wixapis.com/some-endpoint';

async function makeRequest() {
  try {
    const response = await axios.get(TEST_URL, {
      httpsAgent: agent,
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    console.log('Response:', response.data);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

makeRequest();
