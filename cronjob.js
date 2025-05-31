require('dotenv').config();
const axios = require('axios');
const { exec } = require('child_process');

(async () => {
  try {
    const response = await axios.get(`${process.env.API_BASE_URL}/firme-fara-lead`);
    const firme = response.data.firme || [];

    for (const firma of firme) {
      const firmaId = firma._id;
      console.log(`⏳ Rulez scraper pentru firma fără lead: ${firmaId}`);
      exec(`node scraper.js ${firmaId}`, (err, stdout, stderr) => {
        if (err) return console.error(`❌ Scraper EROARE ${firmaId}:`, stderr);
        console.log(`✅ Scraper OK pentru ${firmaId}`);
      });
    }
  } catch (err) {
    console.error('❌ Cronjob general error:', err.message);
  }
})();
