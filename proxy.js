// proxy.js
import express from 'express';
import bodyParser from 'body-parser';
import puppeteer from 'puppeteer';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Endpoint de test
app.get('/', (req, res) => {
  res.send('✅ Skyward Flow scraper is running!');
});

// Endpoint de generare leaduri
app.post('/genereaza', async (req, res) => {
  try {
    console.log('📩 Cerere nouă pentru generare leaduri primită!');

    // Lansăm browserul
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    // Accesăm pagina publică din Wix
    await page.goto('https://skywardflow.com/date-firma', {
      waitUntil: 'networkidle2',
    });

    // Extragem datele
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

    // În acest punct, vom conecta la Wix CMS (pasul următor)

    res.status(200).json({
      message: '✅ Lead generat cu succes!',
      data,
    });
  } catch (error) {
    console.error('❌ Eroare la generare lead:', error);
    res.status(500).json({ error: error.message });
  }
});

// Pornim serverul
app.listen(PORT, () => {
  console.log(`🚀 Server live pe portul ${PORT}`);
});
