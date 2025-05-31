const axios = require('axios');

(async () => {
  try {
    const backendUrl = 'https://git-new-scraper.onrender.com';
    const url = `${backendUrl}/firme-fara-lead`;

    console.log('🔄 Cerere către:', url);
    const response = await axios.get(url);
    console.log('✅ Răspuns:', response.data);
  } catch (err) {
    console.error('❌ Cronjob general error:', err.message);
  }
})();
