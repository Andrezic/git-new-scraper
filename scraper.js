const puppeteer = require('puppeteer-core');
const axios = require('axios');

async function launchBrowser() {
  return await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
}

(async () => {
  const firmaId = '7e5cf14e-9628-4c3a-9c40-578241acd0c6';
  const url = `https://www.skywardflow.com/date-firma-scraper?firmaId=${firmaId}`;

  const browser = await launchBrowser();
  const page = await browser.newPage();

  try {
    console.log("🌐 Accesăm pagina:", url);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    await page.waitForTimeout(5000); // așteptăm 5 secunde să se populeze tot

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
        contactAutomat: document.querySelector('#switchContactAutomat')?.checked || false,
        firmaNume: getVal('#inputNumeFirma'),
        firmaEmail: getVal('#inputEmailFirma'),
        firmaWebsite: getVal('#inputWebsiteFirma'),
        firmaServicii: getVal('#inputServicii')
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
