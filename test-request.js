const axios = require("axios");

async function testGenereaza() {
  try {
    const lead = {
      clientNameText: "TEST LOCAL",
      clientEmailText: "local@test.com",
      clientRequestText: "Test local",
      firmaId: "7e5cf14e-9628-4c3a-9c40-578241acd0c6"
    };

    const response = await axios.post(
      "https://www.skywardflow.com/_functions/genereaza",
      lead,
      { headers: { "Content-Type": "application/json" } }
    );

    console.log("✅ Wix response:", response.status, response.data);
  } catch (err) {
    console.error("❌ Eroare la test local:", err.message);
  }
}

testGenereaza();
