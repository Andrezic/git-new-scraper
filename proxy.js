const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('✅ Serverul rulează corect!');
});

app.post('/genereaza', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL lipsă în body' });
    }

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'domcontentloaded' });
    const data = await page.evaluate(() => {
      return {
        title: document.title,
        url: window.location.href,
      };
    });

    await browser.close();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Eroare la generare lead' });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server live pe portul ${port}`);
});
