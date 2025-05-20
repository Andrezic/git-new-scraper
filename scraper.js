// scraper.js
require('dotenv').config();
const puppeteer = require('puppeteer-core');
const axios     = require('axios');

async function launchBrowser() {
  const executablePath = process.env.CHROME_PATH;
  if (!executablePath) {
    throw new Error('Trebuie să setezi CHROME_PATH în .env');
  }
  return puppeteer.launch({
    executablePath,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      `--proxy-server=${process.env.DATAIMPULSE_PROXY}`
    ]
  });
}

function mapRawToCompanyData(raw) {
  return {
    inputCodCaen:          raw['cod-caen principal']             || '',
    inputCui:              raw['cui/nr.-registru']               || '',
    inputNumarAngajati:    raw['numar-angajati']                 || '',
    inputNumeFirma:        raw['nume-firmă']                     || '',
    inputServicii:         raw['produse/servicii-oferite']       || '',
    inputPreturi:          raw['prețuri']                        || '',
    inputAvantaje:         raw['avantaje-competitive']           || '',
    inputTelefonFirma:     raw['telefon-firmă']                  || '',
    inputEmailFirma:       raw['email']                          || '',
    inputWebsiteFirma:     raw['website-firmă']                  || '',
    inputTipClienti:       raw['tipul-de clienti dorit']         || '',
    inputDimensiuneClient: raw['dimensiune-client']              || '',
    inputKeywords:         raw['cuvinte-cheie']                  || '',
    inputCerinteExtra:     raw['cerinte-extra']                  || '',
    inputLocalizare:       raw['input_comp-makx1n4r6']           || '',
    inputDescriere:        raw['descriere-suplimentară (opțional)'] || '',
    inputTintireGeo:       raw['input_comp-makx1n586']           || '',
    firmaId:               raw.firmaId
  };
}

(async () => {
  const firmaId = process.env.FIRMA_ID;
  if (!firmaId) {
    console.error('Trebuie să setezi FIRMA_ID în .env');
    process.exit(1);
  }
  const apiUrl = process.env.API_BASE_URL;
  if (!apiUrl) {
    console.error('Trebuie să setezi API_BASE_URL în .env');
    process.exit(1);
  }

  let browser;
  try {
    browser = await launchBrowser();
    const page = await browser.newPage();

    console.log(`🚀 Navighez la https://www.skywardflow.com/formular-scraper?firmaId=${firmaId}`);
    await page.goto(`https://www.skywardflow.com/formular-scraper?firmaId=${firmaId}`, {
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    await page.waitForTimeout(3000);

    // Detectăm iframe, dacă există
    let frame = page;
    const formFrame = page.frames().find(f => f.url().includes('formular-scraper'));
    if (formFrame) {
      frame = formFrame;
      console.log('ℹ️ Folosesc iframe de formular:', formFrame.url());
    }

    // Așteptăm elementele input/textarea
    await frame.waitForSelector('input, textarea', { timeout: 60000 });

    // Colectăm date brute
    const rawData = await frame.evaluate(fid => {
      const out = {};
      document.querySelectorAll('input, textarea').forEach(el => {
        const key = el.name || el.id;
        if (key) out[key] = el.value.trim();
      });
      out.firmaId = fid;
      return out;
    }, firmaId);

    console.log('🔍 Raw fields:', rawData);
    const companyData = mapRawToCompanyData(rawData);

    // Adăugăm datele de test
    const lead = {
      ...companyData,
      clientNameText:    process.env.TEST_CLIENT_NAME  || 'Client Test Automat',
      clientEmailText:   process.env.TEST_CLIENT_EMAIL || 'client@testmail.com',
      clientTelefonText: process.env.TEST_CLIENT_PHONE || '0712345678'
    };
    console.log('✅ Lead final pregătit:', lead);

    // Trimitem către backend
    const response = await axios.post(
      `${apiUrl}/genereaza`,
      lead,
      { headers: { 'Content-Type': 'application/json' } }
    );
    console.log('📤 Răspuns backend:', response.data);

  } catch (err) {
    console.error('❌ Eroare în scraper:', err.message || err);
  } finally {
    if (browser) await browser.close();
  }
})();
