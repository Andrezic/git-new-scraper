const puppeteer = require('puppeteer-core');
const axios = require('axios');

async function launchBrowser() {
  return await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
}

(async () => {
  const firmaId = '7e5cf14e-9628-4c3a-9c40-578241acd0c6';

  const lead = {
    clientNameText: "Client Test Automat",
    inputNumeFirma: "Flow Sky",
    clientEmailText: "client@testmail.com",
    mesajCatreClientText: "Cerere automată pentru test",
    firmaId: firmaId
  };

  console.log("✅ Lead pregătit:", lead);

  try {
    const response = await axios.post(
      'https://git-new-scraper.onrender.com/genereaza', // ✅ CORECT
      lead,
      { headers: { 'Content-Type': 'application/json' } }
    );

    console.log("📤 Trimis către server:", response.data);
  } catch (err) {
    console.error("❌ Eroare la trimitere:", err.message);
  }
})();
