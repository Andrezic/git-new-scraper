// scraper.js
require('dotenv').config();
const puppeteer = require('puppeteer-core');
const axios = require('axios');

/**
 * Pornește Chromium prin Dataimpulse cu autentificare proxy
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
  const firmaId   = process.env.FIRMA_ID || '7d8a16ea-53e8-4922-858c-ff9b291f16a6';
  const pageUrl   = `https://www.skywardflow.com/formular-scraper?firmaId=${firmaId}`;
  const apiUrl    = process.env.API_BASE_URL || 'http://localhost:3000';

  let browser;
  try {
    browser = await launchBrowser();
    const page = await browser.newPage();

    // Autentificare pe proxy
    await page.authenticate({
      username: process.env.DATAIMPULSE_USER,
      password: process.env.DATAIMPULSE_PASSWORD
    });

    console.log(`🚀 Navighez la ${pageUrl}`);
    await page.goto(pageUrl, { waitUntil: 'networkidle2', timeout: 60000 });

    // Încearcă să extragi datele clientului pentru lead
    let lead = await page.evaluate((fid) => ({
      clientNameText:     document.querySelector('#clientNameText')?.value || '',
      clientEmailText:    document.querySelector('#clientEmailText')?.value || '',
      clientTelefonText:  document.querySelector('#clientTelefonText')?.value || '',
      inputNumeFirma:     document.querySelector('#inputNumeFirma')?.value || '',
      inputEmailFirma:    document.querySelector('#inputEmailFirma')?.value || '',
      inputTelefonFirma:  document.querySelector('#inputTelefonFirma')?.value || '',
      inputWebsiteFirma:  document.querySelector('#inputWebsiteFirma')?.value || '',
      inputServicii:      document.querySelector('#inputServicii')?.value || '',
      inputAvantaje:      document.querySelector('#inputAvantaje')?.value || '',
      inputPreturi:       document.querySelector('#inputPreturi')?.value || '',
      inputTipClienti:    document.querySelector('#inputTipClienti')?.value || '',
      inputCodCaen:       document.querySelector('#inputCodCaen')?.value || '',
      inputCui:           document.querySelector('#inputCui')?.value || '',
      numarAngajati:      document.querySelector('#inputNumarAngajati')?.value || '',
      inputTipColaborare: document.querySelector('#inputTipColaborare')?.value || '',
      inputDimensiuneClient: document.querySelector('#inputDimensiuneClient')?.value || '',
      inputKeywords:      document.querySelector('#inputKeywords')?.value || '',
      inputCerinteExtra:  document.querySelector('#inputCerinteExtra')?.value || '',
      inputTintireGeo:    document.querySelector('#inputTintireGeo')?.value || '',
      inputLocalizare:    document.querySelector('#inputLocalizare')?.value || '',
      inputDescriere:     document.querySelector('#inputDescriere')?.value || '',
      firmaId:            fid
    }), firmaId);

    // Dacă nu s-au extras date valide, folosește un lead de test pentru a verifica pipeline-ul
    if (!lead.clientNameText || !lead.clientEmailText) {
      console.warn('⚠️ Date client lipsă, fallback la lead demo');
      lead = {
        clientNameText:        'Client Test Automat',
        clientEmailText:       'client@testmail.com',
        clientTelefonText:     '0712345678',
        inputNumeFirma:        'Flow Sky SRL',
        inputEmailFirma:       process.env.DEFAULT_EMAIL_FIRMA,
        inputTelefonFirma:     process.env.DEFAULT_TELEFON_FIRMA || '',
        inputWebsiteFirma:     '',
        inputServicii:         '',
        inputAvantaje:         '',
        inputPreturi:          '',
        inputTipClienti:       '',
        inputCodCaen:          '',
        inputCui:              '',
        numarAngajati:         '',
        inputTipColaborare:    '',
        inputDimensiuneClient: '',
        inputKeywords:         '',
        inputCerinteExtra:     '',
        inputTintireGeo:       '',
        inputLocalizare:       '',
        inputDescriere:        '',
        firmaId
      };
    }

    console.log('✅ Lead final pregătit:', lead);

    // Trimite lead către backend
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
