import express from 'express';
import bodyParser from 'body-parser';
import puppeteer from 'puppeteer';
import 'dotenv/config';

const app = express();
const port = 3000;

app.use(bodyParser.json());

// Route principal
app.post('/send-lead', async (req, res) => {
  const leadData = req.body;

  console.log('📥 Lead primit de la scraper:', leadData);

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Accesează direct pagina Wix publică unde salvezi leadurile
    await page.goto(process.env.WIX_FORM_URL, { waitUntil: 'networkidle2' });

    // Completează formularul cu datele primite
    await page.type('#clientNameText', leadData.numeClient || 'Nume test');
    await page.type('#clientEmailText', leadData.emailClient || 'email@test.com');
    await page.type('#clientRequestText', leadData.cerereClient || 'Cerere test');
    await page.type('#dataText', new Date().toISOString());

    // Trimite formularul
    await Promise.all([
      page.click('#submitButton'), // ✅ Asigură-te că ID-ul butonului este corect în site-ul tău!
      page.waitForNavigation({ waitUntil: 'networkidle2' })
    ]);

    await browser.close();

    console.log('✅ Lead salvat cu succes în Wix!');
    res.status(200).send({ success: true, message: 'Lead salvat cu succes în Wix!' });
  } catch (error) {
    console.error('❌ Eroare la salvarea leadului în Wix:', error);
    res.status(500).send({ success: false, message: 'Eroare la salvarea leadului în Wix.', error });
  }
});

// Start server
app.listen(port, () => {
  console.log(`✅ Server Hetzner live pe portul ${port}`);
});
