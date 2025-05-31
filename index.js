require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { genereazaLeadAI } = require('./utils/openai');
const { salveazaLead } = require('./utils/wix-leads');
const { getFirmaById } = require('./utils/wix-data');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

app.post('/genereaza', async (req, res) => {
  try {
    const firma = req.body.firma;
    console.log("📥 Firma primită:", firma);

    // 🔍 Extragem ID-ul din orice formă (firma._id sau firma.firmaId)
    const firmaId = firma?._id || firma?.firmaId;

    if (!firma || !firmaId) {
      console.log("❌ Firma invalidă sau firmaId lipsă");
      return res.status(400).json({ error: "Lipseste firmaId" });
    }

    // 🔄 Generează lead
    const rezultat = await genereazaLead(firma);

    if (!rezultat || rezultat.error) {
      console.error("❌ Eroare la generare lead AI:", rezultat.error || "Fără răspuns");
      return res.status(500).json({ error: rezultat.error || "Eroare AI" });
    }

    // 💾 Salvează lead
    const leadSalvat = await salveazaLead(rezultat, firmaId);

    console.log("✅ Lead generat și salvat:", leadSalvat);
    return res.status(200).json({ success: true, lead: leadSalvat });

  } catch (e) {
    console.error("❌ Eroare server la /genereaza:", e);
    return res.status(500).json({ error: "Eroare server la generare lead" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Serverul rulează pe portul ${PORT}`);
});
