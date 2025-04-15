const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const port = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('🌐 Skyward Scraper API Live');
});

app.post('/genereaza', async (req, res) => {
  console.log("📥 Request primit:", req.body);

  const {
    clientNameText,
    clientEmailText,
    clientRequestText,
    dataText,
    firmaId
  } = req.body;

  if (!clientNameText || !clientEmailText || !clientRequestText || !firmaId) {
    console.error("❌ Lipsesc câmpuri necesare!");
    return res.status(400).json({ error: "Lipsește unul sau mai multe câmpuri necesare." });
  }

  try {
    const response = await axios.post('https://www.skywardflow.com/_functions/post-lead', {
      clientNameText,
      clientEmailText,
      clientRequestText,
      dataText: dataText || new Date().toISOString(),
      status: "Nou",
      firmaId
    });

    console.log("✅ Răspuns Wix:", response.data);
    res.status(200).json({
      success: true,
      message: 'Lead trimis cu succes la Wix CMS!',
      wixResponse: response.data
    });
  } catch (error) {
    console.error("❌ Eroare la trimiterea lead-ului către Wix:", {
      message: error.message,
      response: error.response?.data || "",
      status: error.response?.status || 500
    });
    res.status(500).json({
      error: "Eroare la trimiterea leadului.",
      details: error.response?.data || error.message
    });
  }
});

app.listen(port, () => {
  console.log(`✅ Serverul rulează pe portul ${port}`);
});
