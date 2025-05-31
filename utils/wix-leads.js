
const axios = require('axios');

async function salveazaLead(lead, firmaId) {
  try {
    const payload = {
      clientNameText: lead.clientNameText || '',
      clientEmailText: lead.clientEmailText || '',
      clientTelefonText: lead.clientTelefonText || '',
      clientWebsiteText: lead.clientWebsiteText || '',
      mesajCatreClientText: lead.mesajCatreClientText || '',
      firmaId: firmaId || '',
      status: 'nou'
    };

    const response = await axios.post(
      'https://www.skywardflow.com/_functions/salveaza-lead',
      payload,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('❌ Eroare trimitere lead la Wix:', error.message);
    throw error;
  }
}

module.exports = { salveazaLead };
