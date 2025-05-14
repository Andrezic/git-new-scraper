const puppeteer = require('puppeteer-core');
const axios = require('axios');

async function launchBrowser() {
  return puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      `--proxy-server=${process.env.DATAIMPULSE_PROXY}`
    ]
  });
}

(async () => {
  const firmaId = '7e5cf14e-9628-4c3a-9c40-578241acd0c6';
  const browser = await launchBrowser();
  const page = await browser.newPage();

  // Autentificare la proxy
  await page.authenticate({
    username: process.env.DATAIMPULSE_USER,
    password: process.env.DATAIMPULSE_PASSWORD
  });

  const url = `https://your-site.com/formular-scraper?firmaId=${firmaId}`;
  await page.goto(url, { waitUntil: 'networkidle2' });

  // Extragem toate câmpurile
  const lead = await page.evaluate(() => ({
    clientNameText: document.querySelector('#inputNumeFirma').value,
    clientEmailText: document.querySelector('#inputEmailFirma').value,
    clientTelefonText: document.querySelector('#inputTelefonFirma').value,
    inputWebsiteFirma: document.querySelector('#inputWebsiteFirma').value,
    inputServicii: document.querySelector('#inputServicii').value,
    inputAvantaje: document.querySelector('#inputAvantaje').value,
    inputPreturi: document.querySelector('#inputPreturi').value,
    inputTipClienti: document.querySelector('#inputTipClienti').value,
    inputCodCaen: document.querySelector('#inputCodCaen').value,
    inputCui: document.querySelector('#inputCui').value,
    inputNumarAngajati: document.querySelector('#inputNumarAngajati').value,
    inputTipColaborare: document.querySelector('#inputTipColaborare').value,
    inputDimensiuneClient: document.querySelector('#inputDimensiuneClient').value,
    inputKeywords: document.querySelector('#inputKeywords').value,
    inputCerinteExtra: document.querySelector('#inputCerinteExtra').value,
    inputTintireGeo: document.querySelector('#inputTintireGeo').value,
    inputLocalizare: document.querySelector('#inputLocalizare').value,
    inputDescriere: document.querySelector('#inputDescriere').value,
    firmaId: firmaId
  }));

  console.log("✅ Lead pregătit:", lead);

  try {
    const response = await axios.post(
      'http://localhost:3000/genereaza',
      { lead },
      { headers: { 'Content-Type': 'application/json' } }
    );
    console.log("📤 Răspuns Generate:", response.data);
  } catch (err) {
    console.error("❌ Eroare la trimitere:", err.message);
  } finally {
    await browser.close();
  }
})();
