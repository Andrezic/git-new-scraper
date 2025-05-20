// scraper.js
require('dotenv').config();
const puppeteer = require('puppeteer-core');
const axios     = require('axios');

async function launchBrowser() {
  const executablePath = process.env.CHROME_PATH;
  if (!executablePath) throw new Error('Setează CHROME_PATH în .env');

  const proxy = process.env.DATAIMPULSE_PROXY; // “host:port”
  if (!proxy) throw new Error('Setează DATAIMPULSE_PROXY în .env');

  return puppeteer.launch({
    executablePath,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      `--proxy-server=${proxy}`
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
  const apiUrl  = process.env.API_BASE_URL;
  if (!firmaId || !apiUrl) {
    console.error('Trebuie să setezi FIRMA_ID și API_BASE_URL în .env');
    process.exit(1);
  }

  let browser;
  try {
    browser = await launchBrowser();
    const page = await browser.newPage();

    // Autentificare proxy HTTP Basic
    await page.authenticate({
      username: process.env.DATAIMPULSE_USER,
      password: process.env.DATAIMPULSE_PASSWORD
    });

    const url = `https://www.skywardflow.com/formular-scraper?firmaId=${firmaId}`;
    console.log('🚀 Navighez la', url);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    // Așteptăm formularul
    await page.waitForTimeout(3000);
    let frame = page.frames().find(f => f.url().includes('formular-scraper')) || page;

    await frame.waitForSelector('input, textarea', { timeout: 60000 });

    const rawData = await frame.evaluate(fId => {
      const out = {};
      document.querySelectorAll('input, textarea').forEach(el => {
        const key = el.name || el.id;
        if (key) out[key] = el.value.trim();
      });
      out.firmaId = fId;
      return out;
    }, firmaId);

    console.log('🔍 Raw fields:', rawData);
    const companyData = mapRawToCompanyData(rawData);

    // Adăugăm date de test (sau înlocuieşte cu lead real)
    const lead = {
      ...companyData,
      clientNameText:    process.env.TEST_CLIENT_NAME  || 'Client Test Automat',
      clientEmailText:   process.env.TEST_CLIENT_EMAIL || 'client@testmail.com',
      clientTelefonText: process.env.TEST_CLIENT_PHONE || '0712345678'
    };

    console.log('✅ Lead pregătit:', lead);
    const resp = await axios.post(
      `${apiUrl}/genereaza`,
      lead,
      { headers: { 'Content-Type': 'application/json' } }
    );
    console.log('📤 Răspuns backend:', resp.data);

  } catch (err) {
    console.error('❌ Eroare în scraper:', err.message || err);
  } finally {
    if (browser) await browser.close();
  }
})();
