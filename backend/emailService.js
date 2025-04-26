const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const MAILERSEND_API_KEY = process.env.MAILERSEND_API_KEY;
const MAILERSEND_URL = "https://api.mailersend.com/v1/email";

async function trimiteEmailIMM({ numeFirma, emailDestinatar, clientName, clientEmail, clientRequest }) {
  const continutLeadTextSimplu = `
Salut ${numeFirma},

Ai primit un nou lead:

Nume client: ${clientName}
Email client: ${clientEmail}
Cerere client: "${clientRequest}"

Contactează clientul cât mai rapid!

---
Skyward Flow
www.skywardflow.com
`;

  const continutLeadHTML = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background: #f7f7f7; border-radius: 8px;">
  <h2 style="color: #333;">Salut <span style="color: #0077ff;">${numeFirma}</span> 👋,</h2>
  <p>Ai primit un nou lead prin <strong>Skyward Flow</strong>:</p>
  <table style="width: 100%; margin-top: 20px; background: #ffffff; border: 1px solid #dddddd; border-radius: 6px;">
    <tr><td style="padding: 10px; border-bottom: 1px solid #dddddd;"><strong>👤 Nume client:</strong> ${clientName}</td></tr>
    <tr><td style="padding: 10px; border-bottom: 1px solid #dddddd;"><strong>📧 Email client:</strong> ${clientEmail}</td></tr>
    <tr><td style="padding: 10px;"><strong>📝 Cerere client:</strong><br/>"${clientRequest}"</td></tr>
  </table>
  <p style="margin-top: 20px;">📩 <strong>Te încurajăm să contactezi clientul cât mai rapid</strong> pentru a crește șansele de colaborare.</p>
  <hr style="margin: 30px 0;">
  <p style="font-size: 14px; color: #999;">Skyward Flow - Business Match AI<br/>www.skywardflow.com</p>
</div>
`;

  try {
    const response = await fetch(MAILERSEND_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MAILERSEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: {
          email: "noreply@skywardflow.com",
          name: "Skyward Flow"
        },
        to: [{
          email: emailDestinatar,
          name: numeFirma
        }],
        subject: `✅ Ai primit un nou lead prin Skyward Flow 🚀`,
        text: continutLeadTextSimplu,
        html: continutLeadHTML
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("❌ Eroare MailerSend:", errorBody);
      throw new Error(`MailerSend API error: ${response.status}`);
    }

    console.log("✅ Email trimis cu succes prin MailerSend!");
    return { success: true };
  } catch (error) {
    console.error("❌ Eroare trimitere email:", error.message);
    return { success: false, error: error.message };
  }
}

module.exports = {
  trimiteEmailIMM
};
