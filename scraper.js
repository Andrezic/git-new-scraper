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
  const pageUrl = `https://www.skywardflow.com/formular-scraper?firmaId=${firmaId}`;
  const apiUrl  = process.env.API_BASE_URL     || 'http://localhost:3000';

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

    // Detectăm iframe-ul cu formular, dacă există
    let frame = page;
    const formFrame = page.frames().find(f => f.url().includes('formular-scraper'));
    if (formFrame) {
      frame = formFrame;
      console.log('ℹ️ Folosesc iframe-ul de formular:', formFrame.url());
    }

    // Așteptăm orice input sau textarea din DOM-ul formularului
    await frame.waitForSelector('input, textarea', { timeout: 60000 });

    // — Pas de debug: listăm toate câmpurile găsite —
    const debugFields = await frame.evaluate(() => {
      const els = Array.from(document.querySelectorAll('input, textarea'));
      return els.map(el => ({
        tag: el.tagName.toLowerCase(),
        id: el.id || null,
        name: el.name || null,
        placeholder: el.placeholder || null,
        value: el.value ? el.value.trim() : ''
      }));
    });
    console.log('🔍 Fields detected:', debugFields);

    // — Apoi construim dinamic obiectul companyData —
    const companyData = await frame.evaluate(fid => {
      const els = Array.from(document.querySelectorAll('input, textarea'));
      const data = {};
      els.forEach(el => {
        const key = el.name || el.id;
        if (key) {
          data[key] = el.value.trim();
        }
      });
      data.firmaId = fid;
      return data;
    }, firmaId);

    // Adăugăm datele clientului pentru API
    const lead = {
      ...companyData,
      clientNameText:   process.env.TEST_CLIENT_NAME   || 'Client Test Automat',
      clientEmailText:  process.env.TEST_CLIENT_EMAIL  || 'client@testmail.com',
      clientTelefonText:process.env.TEST_CLIENT_PHONE  || '0712345678'
    };

    console.log('✅ Lead final pregătit:', lead);

    // Trimitem către server
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
