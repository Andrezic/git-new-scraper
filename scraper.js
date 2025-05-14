// scraper.js
require('dotenv').config();
const puppeteer = require('puppeteer-core');
const axios = require('axios');

/**
 * Pornește Puppeteer cu proxy Dataimpulse și autentificare
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
  const firmaId = '7d8a16ea-53e8-4922-858c-ff9b291f16a6';
  const pageUrl = `https://www.skywardflow.com/formular-scraper?firmaId=${firmaId}`;
  const apiUrl = process.env.API_BASE_URL || 'http://localhost:3000';

  let browser;
  try {
    browser = await launchBrowser();
    const page = await browser.newPage();

    // Autentificare proxy
    await page.authenticate({
      username: process.env.DATAIMPULSE_USER,
      password: process.env.DATAIMPULSE_PASSWORD
    });

    console.log(`🚀 Navighez la ${pageUrl} via proxy ${process.env.DATAIMPULSE_PROXY}`);
    await page.goto(pageUrl, { waitUntil: 'networkidle2', timeout: 60000 });

    // Extragerea datelor: separate firma și client
    const lead = await page.evaluate((fid) => ({
      // Datele firmei (utilizatorului)
      firmaName:             document.querySelector('#inputNumeFirma')?.value || '',
      firmaEmail:            document.querySelector('#inputEmailFirma')?.value || '',
      firmaTelefon:          document.querySelector('#inputTelefonFirma')?.value || '',
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

    // Datele clientului (lead-ului)
      clientNameText:  document.querySelector('#clientNameText')?.value || '',
      clientEmailText: document.querySelector('#clientEmailText')?.value || '',
      clientTelefonText: document.querySelector('#clientTelefonText')?.value || '',

      firmaId:               fid
    }), firmaId);

    console.log('✅ Lead pregătit de scraper:', lead);

    // Post lead către backend
    const response = await axios.post(
      `${apiUrl}/genereaza`,
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
