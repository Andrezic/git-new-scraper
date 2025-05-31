require('dotenv').config();
const axios = require('axios');
const { exec } = require('child_process');

(async () => {
  try {
    const apiUrl = `${process.env.API_BASE_URL}/firme-fara-lead`;
    console.log("🔄 Cerere către:", apiUrl);

    const response = await axios.get(apiUrl);
    const firme = response.data.firme || [];

    if (firme.length === 0) {
      console.log("⏸️ Nicio firmă nouă de procesat.");
      return;
    }

    for (const firma of firme) {
      const firmaId = firma._id;
      if (!firmaId) continue;

      console.log(`🚀 Pornesc scraper pentru firma: ${firma.inputNumeFirma} (${firmaId})`);

      exec(`node scraper.js ${firmaId}`, (error, stdout, stderr) => {
        if (error) {
          console.error(`❌ Eroare scraper pentru ${firmaId}:`, stderr || error.message);
        } else {
          console.log(`✅ Scraper OK pentru ${firmaId}:\n${stdout}`);
        }
      });
    }
  } catch (err) {
    console.error("❌ Cronjob general error:", err.message);
  }
})();
