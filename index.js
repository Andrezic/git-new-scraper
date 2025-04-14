// index.js
const express = require('express');
const puppeteer = require('puppeteer-core');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post('/genereaza', async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      executablePath: '/usr/bin/chromium-browser',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.goto('https://example.com'); // Înlocuiește cu URL-ul tău

    // Simulează scraping
    const data = await page.evaluate(() => {
      return {
        title: document.title,
      };
    });

    await browser.close();
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Eroare scraping:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Serverul rulează pe portul ${port}`);
});
