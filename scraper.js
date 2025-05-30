
require('dotenv').config();
const puppeteer = require('puppeteer-core');
const chromium = require('chromium');
const axios = require('axios');

async function launchBrowser() {
  const executablePath = chromium.path;
  const proxy = process.env.DATAIMPULSE_PROXY;
  if (!proxy) throw new Error('DATAIMPULSE_PROXY lipsă în .env');

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

(async () => {
  const firmaId = process.argv[2];
  const apiUrl  = process.env.API_BASE_URL;
  if (!firmaId || !apiUrl) {
    console.error('❌ Lipsă firmaId sau API_BASE_URL');
    process.exit(1);
  }

  let browser;
  try {
    browser = await launchBrowser();
    const page = await browser.newPage();

    await page.authenticate({
      username: process.env.DATAIMPULSE_USER,
      password: process.env.DATAIMPULSE_PASSWORD
    });

    const { data } = await axios.get(`${apiUrl}/firmabyid/${firmaId}`);
    const firma = data.firma;
    if (!firma) throw new Error('Firma nu a fost găsită în CMS Wix.');

    const keyword = encodeURIComponent(firma.inputServicii || firma.inputCodCaen || 'servicii');
    const url = `https://www.firme-on-line.ro/cauta/${keyword}`;
    console.log(`🔎 Caut pe ${url}`);

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    await page.waitForSelector('.detalii_firma');

    const lead = await page.evaluate(() => {
      const container = document.querySelector('.detalii_firma');
      if (!container) return null;

      const getText = (selector) => {
        const el = container.querySelector(selector);
        return el ? el.innerText.trim() : '';
      };
      const getHref = (selector) => {
        const el = container.querySelector(selector);
        return el ? el.href.trim() : '';
      };

      return {
        clientNameText: getText('h2 a'),
        clientEmailText: getText('.email a'),
        clientTelefonText: getText('.telefon'),
        clientWebsiteText: getHref('.website a')
      };
    });

    if (!lead || !lead.clientEmailText || !lead.clientNameText) {
      console.warn('⚠️ Nu s-a găsit niciun lead valid.');
      return;
    }

    console.log('✅ Lead real găsit:', lead);

    const payload = {
      firmaUtilizator: firma,
      leadPropus: lead
    };

    const response = await axios.post(`${apiUrl}/genereaza`, payload, {
      headers: { 'Content-Type': 'application/json' }
    });

    console.log('📤 Răspuns backend:', response.data);

  } catch (err) {
    console.error('❌ Eroare scraper:', err.message || err);
  } finally {
    if (browser) await browser.close();
  }
})();
