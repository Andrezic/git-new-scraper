// utils/wixApi.js
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

export async function trimiteLeadLaWix(lead) {
  console.log("📡 Trimitem leadul la Wix:", lead);

  const wixApiKey = process.env.WIX_API_KEY;
  const siteId = process.env.WIX_SITE_ID;

  if (!wixApiKey || !siteId) {
    console.error("❌ Lipsesc variabilele din .env: WIX_API_KEY sau WIX_SITE_ID");
    return { success: false, message: "Missing env vars" };
  }

  try {
    const response = await axios.post(
      `https://www.skywardflow.com/_functions-dev/receiveLeadFromScraper`,
      lead,
      {
        headers: {
          Authorization: wixApiKey,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("✅ Răspuns de la Wix:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Eroare la trimiterea leadului:", error.response?.data || error.message);
    return { success: false, message: "Eroare la trimiterea leadului." };
  }
}
