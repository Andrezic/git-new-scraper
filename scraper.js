const puppeteer = require('puppeteer-core');
const axios = require('axios');

async function launchBrowser() {
  return await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: false, // ❗ NU mai e headless, ca să forțăm DOM real
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
}

(async () => {
  const firmaId = '7e5cf14e-9628-4c3a-9c40-578241acd0c6';
  const url = `https://www.skywardflow.com/date-firma-scraper?firmaId=${firmaId}`;

  const browser = await launchBrowser();
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // ❗ Screenshot înainte de selector, ca să vedem exact DOM-ul
    await page.screenshot({ path: 'check-before-wait.png', fullPage: true });

    await page.waitForSelector('#inputNumeFirma', { timeout: 20000 });

    const lead = await page.evaluate(() => {
      const getVal = (id) => {
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
    console.error("❌ Eroare în scraping sau trimitere:", err.message);
  } finally {
    await browser.close();
  }
})();
