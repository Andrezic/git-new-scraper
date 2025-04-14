const express = require('express');
const { trimiteLeadLaWix } = require('./utils/wixApi');
const app = express();
app.use(express.json());
const port = process.env.PORT || 10000;

app.use(express.json());

app.post('/genereaza', async (req, res) => {
  try {
    const { numeClient, emailClient, cerereClient, firmaId } = req.body;

    if (!numeClient || !emailClient || !cerereClient || !firmaId) {
      return res.status(400).json({ error: 'Lipsește unul sau mai multe câmpuri necesare.' });
    }

    // Trimitem lead-ul către Wix API
    await trimiteLeadLaWix({
      numeClient,
      emailClient,
      cerereClient,
      firmaId
    });

    res.status(200).json({ success: true, message: 'Lead trimis cu succes la Wix CMS!' });
  } catch (error) {
    console.error('❌ Eroare în endpoint-ul /genereaza:', error);
    res.status(500).json({ error: 'Eroare internă de server.' });
  }
});

app.listen(port, () => {
  console.log(`Serverul rulează pe portul ${port}`);
});
