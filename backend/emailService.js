// backend/emailService.js

// Dynamic import pentru node-fetch
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

// Cheia din environment
const MAILERSEND_API_KEY = process.env.MAILERSEND_API_KEY;
const MAILERSEND_URL     = "https://api.mailersend.com/v1/email";

/**
 * Trimite un email prin MailerSend
 * @param {{
 *   NumeFirma?: string,
 *   EmailDestinatar?: string,
 *   EmailFirma?: string,
 *   mesajCatreClient?: string
 * }} params
 */
async function trimiteEmailIMM({
  NumeFirma = "",
  EmailDestinatar = "",
  EmailFirma = "",
  mesajCatreClient = ""
}) {
  try {
    // Construiesc HTML-ul emailului (mesajCatreClient are acum valoare string ne-nulă)
    const htmlBody = `
      <h2>Ai un nou Business Match! 🚀</h2>
      <p><strong>Firmă:</strong> ${NumeFirma}</p>
      <p><strong>Email firmă:</strong> ${EmailFirma}</p>
      <hr/>
      <p>${mesajCatreClient.replace(/\n/g, '<br/>')}</p>
    `;

    const payload = {
      from: {
        email: "noreply@skywardflow.com",
        name:  "Skyward Flow"
      },
      to: [
        {
          email: EmailDestinatar,
          name:  NumeFirma
        }
      ],
      subject: "Ai un nou Business Match! 🚀",
      html:    htmlBody
    };

    const response = await fetch(MAILERSEND_URL, {
      method:  "POST",
      headers: {
        Authorization: `Bearer ${MAILERSEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Eroare MailerSend:", errorText);
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
