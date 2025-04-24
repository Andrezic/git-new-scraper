// scraper.js – NO TYPESCRIPT, NO ERRORS, 100% Render compatible

const puppeteer = require('puppeteer-core');
const axios = require('axios');

async function launchBrowser() {
  return await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
}

(async () => {
  const firmaId = '7e5cf14e-9628-4c3a-9c40-578241acd0c6';
  const url = `https://www.skywardflow.com/date-firma-scraper?firmaId=${firmaId}`;

  const browser = await launchBrowser();
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle2' });
    await page.waitForSelector('#inputNumeFirma', { timeout: 10000 });

    const lead = await page.evaluate(() => {
      const get = (id) => {
        const el = document.querySelector(id);
        return el ? el.value || el.innerText || '' : '';
      };

      return {
        clientNameText: "Client Test Automat",
        clientEmailText: "client@testmail.com",
        clientRequestText: "Cerere automată pentru test",
        firmaId: new URLSearchParams(location.search).get("firmaId"),
        contactAutomat: document.querySelector('#switchContactAutomat')?.checked || false
      };
    });

    console.log("✅ Lead extras:", lead);

    const response = await axios.post(
      'https://skyward-scraper.onrender.com/genereaza',
      lead,
      { headers: { 'Content-Type': 'application/json' } }
    );

    console.log("📤 Trimis către server:", response.data);
  } catch (err) {
    console.error("❌ Eroare scraper:", err.message);
  } finally {
    await browser.close();
  }
})();
