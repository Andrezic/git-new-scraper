// proxy.js
import express from 'express';
import bodyParser from 'body-parser';
import puppeteer from 'puppeteer';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Endpoint de test să verificăm dacă serverul e live
app.get('/', (req, res) => {
  res.send('✅ Skyward Flow scraper is running!');
});

// Endpoint de generare leaduri (endpoint-ul nostru de scraping)
app.post('/genereaza', async (req, res) => {
  try {
    console.log('📩 Cerere nouă pentru generare leaduri primită!');

    // Inițializare browser
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    // Accesăm pagina profilului tău public din Wix
    await page.goto('https://skywardflow.com/date-firma', {
      waitUntil: 'networkidle2',
    });

    // Extragere date din pagina publică
    const data = await page.evaluate(() => {
      const firma = document.querySelector('#inputNumeFirma')?.value || '';
      const email = document.querySelector('#inputEmailFirma')?.value || '';
      const telefon = document.querySelector('#inputTelefonFirma')?.value || '';
      const website = document.querySelector('#inputWebsiteFirma')?.value || '';
      const servicii = document.querySelector('#inputServicii')?.value || '';
      const avantaje = document.querySelector('#inputAvantaje')?.value || '';
      const preturi = document.querySelector('#inputPreturi')?.value || '';
      const tipClienti = document.querySelector('#inputTipClienti')?.value || '';

      return {
        firma,
        email,
        telefon,
        website,
        servicii,
        avantaje,
        preturi,
        tipClienti,
      };
    });

    console.log('📦 Date extrase:', data);

    await browser.close();

    // TODO: aici trimiți datele către API-ul Wix CMS (facem împreună la următorul pas)

    res.status(200).json({
      message: '✅ Lead generat cu succes!',
      data,
    });
  } catch (error) {
    console.error('❌ Eroare la generare lead:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server live pe portul ${PORT}`);
});
