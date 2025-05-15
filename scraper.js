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

// Funcție de mapare a cheilor din formular către ce-asteaptă backend-ul
function mapRawToCompanyData(raw) {
  return {
    inputCodCaen:         raw['cod-caen principal']            || '',
    inputCui:             raw['cui/nr.-registru']              || '',
    inputNumarAngajati:   raw['numar-angajati']                || '',
    inputNumeFirma:       raw['nume-firmă']                    || '',
    inputServicii:        raw['produse/servicii-oferite']      || '',
    inputPreturi:         raw['prețuri']                       || '',
    inputAvantaje:        raw['avantaje-competitive']          || '',
    inputTelefonFirma:    raw['telefon-firmă']                 || '',
    inputEmailFirma:      raw['email']                         || '',
    inputWebsiteFirma:    raw['website-firmă']                 || '',
    inputTipClienti:      raw['tipul-de clienti dorit']        || '',
    inputDimensiuneClient:raw['dimensiune-client']             || '',
    inputKeywords:        raw['cuvinte-cheie']                 || '',
    inputCerinteExtra:    raw['cerinte-extra']                 || '',
    inputLocalizare:      raw['input_comp-makx1n4r6']          || '',
    inputDescriere:       raw['descriere-suplimentară (opțional)'] || '',
    inputTintireGeo:      raw['input_comp-makx1n586']          || '',
    firmaId:              raw.firmaId
  };
}

;(async () => {
  const firmaId = process.env.FIRMA_ID ||
    '7d8a16ea-53e8-4922-858c-ff9b291f16a6';
  const pageUrl = `https://www.skywardflow.com/formular-scraper?firmaId=${firmaId}`;
  const apiUrl  = process.env.API_BASE_URL || 'http://localhost:3000';

  let browser;
  try {
    browser = await launchBrowser();
    const page = await browser.newPage();
    await page.authenticate({
      username: process.env.DATAIMPULSE_USER,
      password: process.env.DATAIMPULSE_PASSWORD
    });

    console.log(`🚀 Navighez la ${pageUrl}`);
    await page.goto(pageUrl, { waitUntil: 'networkidle2', timeout: 60000 });
    await page.waitForTimeout(3000);

    // Detectăm iframe-ul (dacă e)
    let frame = page;
    const formFrame = page.frames().find(f => f.url().includes('formular-scraper'));
    if (formFrame) {
      frame = formFrame;
      console.log('ℹ️ Folosesc iframe-ul de formular:', formFrame.url());
    }

    // Așteptăm cel puțin un input/textarea
    await frame.waitForSelector('input, textarea', { timeout: 60000 });

    // Colectăm toată informația brută
    const rawData = await frame.evaluate(fid => {
      const els = Array.from(document.querySelectorAll('input, textarea'));
      const out = {};
      els.forEach(el => {
        const key = el.name || el.id;
        if (key) out[key] = el.value.trim();
      });
      out.firmaId = fid;
      return out;
    }, firmaId);

    console.log('🔍 Raw fields:', rawData);

    // Mapăm la forma backend-ului
    const companyData = mapRawToCompanyData(rawData);

    // Adăugăm câmpurile de client
    const lead = {
      ...companyData,
      clientNameText:   process.env.TEST_CLIENT_NAME   || 'Client Test Automat',
      clientEmailText:  process.env.TEST_CLIENT_EMAIL  || 'client@testmail.com',
      clientTelefonText:process.env.TEST_CLIENT_PHONE  || '0712345678'
    };

    console.log('✅ Lead final pregătit:', lead);

    // Trimitem către backend
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
