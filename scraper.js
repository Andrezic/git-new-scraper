// scraper.js
require('dotenv').config();
const puppeteer = require('puppeteer-core');
const axios = require('axios');
const apiUrl = process.env.API_BASE_URL || 'http://localhost:3000';

await axios.post(`${apiUrl}/genereaza`, { lead }, …);

/**
 * Pornim Puppeteer cu proxy Dataimpulse și autentificare separată.
 */
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
  const url = `https://www.skywardflow.com/formular-scraper?firmaId=${firmaId}`;

  let browser;
  try {
    browser = await launchBrowser();
    const page = await browser.newPage();

    // Autentificare pentru proxy Dataimpulse
    await page.authenticate({
      username: process.env.DATAIMPULSE_USER,
      password: process.env.DATAIMPULSE_PASSWORD
    });

    console.log(`🚀 Navighez la ${url} via proxy ${process.env.DATAIMPULSE_PROXY}`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    // Extragem toate câmpurile din pagină
    const lead = await page.evaluate((firmaId) => ({
      clientNameText:        document.querySelector('#inputNumeFirma')?.value || '',
      clientEmailText:       document.querySelector('#inputEmailFirma')?.value || '',
      clientTelefonText:     document.querySelector('#inputTelefonFirma')?.value || '',
      inputWebsiteFirma:     document.querySelector('#inputWebsiteFirma')?.value || '',
      inputServicii:         document.querySelector('#inputServicii')?.value || '',
      inputAvantaje:         document.querySelector('#inputAvantaje')?.value || '',
      inputPreturi:          document.querySelector('#inputPreturi')?.value || '',
      inputTipClienti:       document.querySelector('#inputTipClienti')?.value || '',
      inputCodCaen:          document.querySelector('#inputCodCaen')?.value || '',
      inputCui:              document.querySelector('#inputCui')?.value || '',
      numarAngajati:         document.querySelector('#inputNumarAngajati')?.value || '',
      inputTipColaborare:    document.querySelector('#inputTipColaborare')?.value || '',
      inputDimensiuneClient: document.querySelector('#inputDimensiuneClient')?.value || '',
      inputKeywords:         document.querySelector('#inputKeywords')?.value || '',
      inputCerinteExtra:     document.querySelector('#inputCerinteExtra')?.value || '',
      inputTintireGeo:       document.querySelector('#inputTintireGeo')?.value || '',
      inputLocalizare:       document.querySelector('#inputLocalizare')?.value || '',
      inputDescriere:        document.querySelector('#inputDescriere')?.value || '',
      firmaId                
    }));

    console.log('✅ Lead pregătit de scraper:', lead);

    // Trimitem datele la backend pentru generare email
    const response = await axios.post(
      'http://localhost:3000/genereaza',
      { lead },
      { headers: { 'Content-Type': 'application/json' } }
    );

    console.log('📤 Răspuns de la /genereaza:', response.data);
  } catch (err) {
    console.error('❌ Eroare în scraper:', err.message || err);
  } finally {
    if (browser) await browser.close();
  }
})();
