// scraper.js

require('dotenv').config();
const puppeteer = require('puppeteer-core');
const axios     = require('axios');

/**
 * Lancează un browser headless prin Dataimpulse cu proxy și autentificare.
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

;(async () => {
  const firmaId = process.env.FIRMA_ID || '7d8a16ea-53e8-4922-858c-ff9b291f16a6';
  const pageUrl = `https://www.skywardflow.com/formular-scraper?firmaId=${firmaId}`;
  const apiUrl  = process.env.API_BASE_URL   || 'http://localhost:3000';

  let browser;
  try {
    browser = await launchBrowser();
    const page = await browser.newPage();

    // Autentificare la proxy-ul Dataimpulse
    await page.authenticate({
      username: process.env.DATAIMPULSE_USER,
      password: process.env.DATAIMPULSE_PASSWORD
    });

    console.log(`🚀 Navighez la ${pageUrl}`);
    await page.goto(pageUrl, { waitUntil: 'networkidle2', timeout: 60000 });

    // Așteptăm scripturile Wix să încarce DOM-ul
    await page.waitForTimeout(3000);

    // Detectăm un iframe cu formularul (dacă există)
    let frame = page;
    const formFrame = page.frames().find(f => f.url().includes('formular-scraper'));
    if (formFrame) {
      frame = formFrame;
      console.log('ℹ️ Folosesc iframe-ul de formular:', formFrame.url());
    }

    // Așteptăm apariția oricărui input sau textarea
    await frame.waitForSelector('input, textarea', { timeout: 60000 });

    // Extragem valorile celor câmpuri cunoscute, după id sau name
    const companyData = await frame.evaluate(fid => {
      const keys = [
        'inputNumeFirma',
        'inputEmailFirma',
        'inputTelefonFirma',
        'inputWebsiteFirma',
        'inputServicii',
        'inputAvantaje',
        'inputPreturi',
        'inputTipClienti',
        'inputCodCaen',
        'inputCui',
        'inputNumarAngajati',
        'inputTipColaborare',
        'inputDimensiuneClient',
        'inputKeywords',
        'inputCerinteExtra',
        'inputTintireGeo',
        'inputLocalizare',
        'inputDescriere',
      ];
      const result = {};
      keys.forEach(key => {
        const el = document.querySelector(`#${key}`) || document.querySelector(`[name="${key}"]`);
        result[key] = el?.value?.trim() || '';
      });
      result.firmaId = fid;
      return result;
    }, firmaId);

    // Adăugăm câmpurile clientului pentru backend
    const lead = {
      ...companyData,
      clientNameText:   process.env.TEST_CLIENT_NAME  || 'Client Test Automat',
      clientEmailText:  process.env.TEST_CLIENT_EMAIL || 'client@testmail.com',
      clientTelefonText:process.env.TEST_CLIENT_PHONE || '0712345678'
    };

    console.log('✅ Lead final pregătit:', lead);

    // Trimitem către backend pentru generare + trimitere email
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
