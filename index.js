const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const puppeteer = require('puppeteer');
const axios = require('axios');
const { Configuration, OpenAIApi } = require('openai');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAIApi(new Configuration({
  apiKey: process.env.OPENAI_API_KEY
}));

async function scrapeData(url) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2' });

  const data = await page.evaluate(() => {
    const getText = (selector) => {
      const el = document.querySelector(selector);
      return el ? el.innerText.trim() : '';
    };

    return {
      numeFirma: getText('#inputNumeFirma'),
      emailFirma: getText('#inputEmailFirma'),
      telefonFirma: getText('#inputTelefonFirma'),
      websiteFirma: getText('#inputWebsiteFirma'),
      servicii: getText('#inputServicii'),
      avantaje: getText('#inputAvantaje'),
      preturi: getText('#inputPreturi'),
      tipClienti: getText('#inputTipClienti')
    };
  });

  await browser.close();
  return data;
}

async function generateLead(firmaData) {
  const prompt = `Generează un lead de client pentru următoarea firmă: 
  Nume: ${firmaData.numeFirma}
  Servicii: ${firmaData.servicii}
  Avantaje: ${firmaData.avantaje}
  Preturi: ${firmaData.preturi}
  Tip client ideal: ${firmaData.tipClienti}`;

  const response = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }]
  });

  return response.data.choices[0].message.content.trim();
}

async function sendToWix(leadData) {
  const response = await axios.post(process.env.WIX_API_URL, {
    lead: leadData
  }, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': process.env.WIX_API_KEY
    }
  });

  return response.data;
}

app.post('/genereaza', async (req, res) => {
  try {
    const { url } = req.body;

    const firmaData = await scrapeData(url);
    const lead = await generateLead(firmaData);
    const wixResponse = await sendToWix(lead);

    res.json({ success: true, lead, wixResponse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Skyward Scraper activ pe portul ${PORT}`);
});
