// proxy.js
import express from 'express';
import bodyParser from 'body-parser';
import puppeteer from 'puppeteer';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('✅ Skyward Flow scraper is running!');
});

app.post('/genereaza', async (req, res) => {
  try {
    console.log('📩 Cerere nouă pentru generare leaduri primită!');

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    await page.goto('https://skywardflow.com/date-firma', {
      waitUntil: 'networkidle2',
    });

    const data = await page.evaluate(() => {
      return {
        firma: document.querySelector('#inputNumeFirma')?.value || '',
        email: document.querySelector('#inputEmailFirma')?.value || '',
        telefon: document.querySelector('#inputTelefonFirma')?.value || '',
        website: document.querySelector('#inputWebsiteFirma')?.value || '',
        servicii: document.querySelector('#inputServicii')?.value || '',
        avantaje: document.querySelector('#inputAvantaje')?.value || '',
        preturi: document.querySelector('#inputPreturi')?.value || '',
        tipClienti: document.querySelector('#inputTipClienti')?.value || '',
      };
    });

    console.log('📦 Date extrase:', data);

    await browser.close();

    res.status(200).json({
      message: '✅ Lead generat cu succes!',
      data,
    });
  } catch (error) {
    console.error('❌ Eroare la generare lead:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server live pe portul ${PORT}`);
});
