require('dotenv').config();
const express = require('express');
const axios = require('axios');
const { launchBrowser } = require('./utils/puppeteer');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 10000;

app.post('/genereaza', async (req, res) => {
  try {
    const browser = await launchBrowser();
    const page = await browser.newPage();
    await page.goto('https://www.skywardflow.com/date-firma');

    const leadData = await page.evaluate(() => {
      const getText = (selector) => document.querySelector(selector)?.innerText.trim() || '';
      return {
        numeClient: getText('#numeFirma'),
        emailClient: getText('#emailFirma'),
        cerereClient: getText('#servicii'),
        dataGenerarii: new Date().toISOString(),
        status: 'Nou',
        firmaId: getText('#numeFirma')
      };
    });

    console.log('✅ Lead extras:', leadData);

    await axios.post(
      'https://www.skywardflow.com/_functions/scraper-api',
      leadData,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: process.env.WIX_API_KEY
        }
      }
    );

    console.log('✅ Lead trimis cu succes către Wix CMS');
    await browser.close();
    res.json({ success: true, message: 'Lead generat și trimis cu succes!' });
  } catch (error) {
    console.error('❌ Eroare în procesul de scraping sau trimitere:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Serverul rulează pe portul ${PORT}`);
});
