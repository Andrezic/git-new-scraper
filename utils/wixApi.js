const axios = require('axios');

async function trimiteLeadLaWix(leadData) {
  try {
    const response = await axios.post('https://www.wixapis.com/wix-data/v2/collections/Leaduri/items', {
      data: {
        clientNameText: leadData.clientNameText,
        clientEmailText: leadData.clientEmailText,
        clientRequestText: leadData.clientRequestText,
        dataText: leadData.dataText || new Date().toISOString(),
        status: "Nou",
        firmaId: leadData.firmaId
      }
    }, {
      headers: {
        Authorization: process.env.WIX_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    console.log("✅ Lead trimis cu succes la Wix:", response.data);
  } catch (error) {
    console.error("❌ Eroare la trimiterea lead-ului către Wix:", error.response ? error.response.data : error.message);
  }
}

module.exports = { trimiteLeadLaWix };
