const axios = require('axios');
const express = require('express');
const app = express();
app.use(express.json());
const port = process.env.PORT || 10000;

app.post('/genereaza', async (req, res) => {
  try {
    const { clientNameText, clientEmailText, clientRequestText, dataText, firmaId } = req.body;

    if (!clientNameText || !clientEmailText || !clientRequestText || !firmaId) {
      return res.status(400).json({ error: 'Lipsește unul sau mai multe câmpuri necesare.' });
    }

    const response = await axios.post('https://www.skywardflow.com/_functions/receiveLeadFromScraper', {
      clientNameText,
      clientEmailText,
      clientRequestText,
      dataText: dataText || new Date().toISOString(),
      status: "Nou",
      firmaId
    });

    console.log("✅ Lead trimis la Wix JSW API:", response.data);
    res.status(200).json({ success: true, message: 'Lead trimis cu succes la Wix CMS!' });
  } catch (error) {
    console.error("❌ Eroare la trimiterea leadului către JSW API:", error.response?.data || error.message);
    res.status(500).json({ error: 'Eroare la trimiterea leadului.' });
  }
});

app.listen(port, () => {
  console.log(`Serverul rulează pe portul ${port}`);
});
