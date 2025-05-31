// utils/wix-leads.js
const axios = require("axios");

async function salveazaLead(lead, firmaId) {
  try {
    const payload = {
      ...lead,
      firmaId: firmaId,
    };

    const rezultat = await axios.post("https://www.skywardflow.com/_functions/salveaza-lead", payload);
    return rezultat.data;
  } catch (e) {
    console.error("❌ Eroare la salveazaLead:", e.message);
    throw new Error("Eroare la salvarea leadului în Wix");
  }
}

module.exports = {
  salveazaLead,
};
