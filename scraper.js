// scraper.js
require('dotenv').config();
const puppeteer = require('puppeteer-core');
const axios     = require('axios');

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

;(async () => {
  const firmaId = process.env.FIRMA_ID || '7d8a16ea-53e8-4922-858c-ff9b291f16a6';
  const pageUrl  = `https://www.skywardflow.com/formular-scraper?firmaId=${firmaId}`;
  const apiUrl   = process.env.API_BASE_URL   || 'http://localhost:3000';

  let browser;
  try {
    browser = await launchBrowser();
    const page = await browser.newPage();

    // Proxy auth
    await page.authenticate({
      username: process.env.DATAIMPULSE_USER,
      password: process.env.DATAIMPULSE_PASSWORD
    });

    console.log(`🚀 Navighez la ${pageUrl}`);
    await page.goto(pageUrl, { waitUntil: 'networkidle2', timeout: 60000 });

    // Așteptăm puțin scripturile Wix
    await page.waitForTimeout(3000);

    // Căutăm un iframe care conține formularul
    let frame = page;
    const formFrame = page.frames().find(f => f.url().includes('formular-scraper'));
    if (formFrame) {
      frame = formFrame;
      console.log('ℹ️ Folosesc iframe-ul de formular:', formFrame.url());
    } else {
      console.warn('⚠️ Nu am găsit iframe cu formular – folosesc documentul principal.');
    }

    // Așteaptă apariția primului input, după id sau name
    await frame.waitForSelector(
      '#inputNumeFirma, [name="inputNumeFirma"]',
      { timeout: 60000 }
    );

    // Funcție helper pentru a extrage valoarea după id sau name
    const companyData = await frame.evaluate((fid) => {
      function getVal(key) {
        const byId   = document.querySelector(`#${key}`);
        const byName = document.querySelector(`[name="${key}"]`);
        return (byId || byName)?.value?.trim() || '';
      }
      return {
        inputNumeFirma:        getVal('inputNumeFirma'),
        inputEmailFirma:       getVal('inputEmailFirma'),
        inputTelefonFirma:     getVal('inputTelefonFirma'),
        inputWebsiteFirma:     getVal('inputWebsiteFirma'),
        inputServicii:         getVal('inputServicii'),
        inputAvantaje:         getVal('inputAvantaje'),
        inputPreturi:          getVal('inputPreturi'),
        inputTipClienti:       getVal('inputTipClienti'),
        inputCodCaen:          getVal('inputCodCaen'),
        inputCui:              getVal('inputCui'),
        inputNumarAngajati:    getVal('inputNumarAngajati'),
        inputTipColaborare:    getVal('inputTipColaborare'),
        inputDimensiuneClient: getVal('inputDimensiuneClient'),
        inputKeywords:         getVal('inputKeywords'),
        inputCerinteExtra:     getVal('inputCerinteExtra'),
        inputTintireGeo:       getVal('inputTintireGeo'),
        inputLocalizare:       getVal('inputLocalizare'),
        inputDescriere:        getVal('inputDescriere'),
        firmaId:               fid
      };
    }, firmaId);

    // Adăugăm manual câmpurile clientului
    const lead = {
      ...companyData,
      clientNameText:  process.env.TEST_CLIENT_NAME  || 'Client Test Automat',
      clientEmailText: process.env.TEST_CLIENT_EMAIL || 'client@testmail.com',
      clientTelefonText: process.env.TEST_CLIENT_PHONE || '0712345678'
    };

    console.log('✅ Lead final pregătit:', lead);

    // Trimitem la backend
    const response = await axios.post(
      `${apiUrl}/genereaza`,
      lead,
      { headers: { 'Content-Type': 'application/json' } }
    );
    console.log('📤 Răspuns de la /genereaza:', response.data);

  } catch (err) {
    console.error('❌ Eroare în scraper:', err.message || err);
  } finally {
    if (browser) await browser.close();
  }
})();
