// backend/emailService.js

// Dacă folosești Node.js 18+, poți importa direct:
// import fetch from 'node-fetch';
// În caz contrar, păstrează dynamic import-ul:
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

const MAILERSEND_API_KEY = process.env.MAILERSEND_API_KEY;
const MAILERSEND_URL     = "https://api.mailersend.com/v1/email";

/**
 * Trimite un email prin MailerSend
 * @param {{
 *   NumeFirma: string,
 *   EmailDestinatar: string,
 *   EmailFirma: string,
 *   mesajCatreClient: string
 * }} params
 */
async function trimiteEmailIMM({
  NumeFirma,
  EmailDestinatar,
  EmailFirma,
  mesajCatreClient
}) {
  // Validare minimală
  if (!EmailDestinatar) {
    throw new Error("Lipsește email-ul destinatarului");
  }

  // Construim un corp HTML simplu pentru email
  const htmlBody = `
    <h2>Ai un nou Business Match! 🚀</h2>
    <p><strong>Firmă:</strong> ${NumeFirma || ""}</p>
    <p><strong>Email firmă:</strong> ${EmailFirma || ""}</p>
    <hr/>
    <p>${(mesajCatreClient || "").replace(/\n/g, "<br/>")}</p>
  `;

  const payload = {
    from: {
      email: "noreply@skywardflow.com",
      name:  "Skyward Flow"
    },
    to: [
      {
        email: EmailDestinatar,
        name:  NumeFirma || ""
      }
    ],
    subject: "Ai un nou Business Match! 🚀",
    html:    htmlBody
  };

  const response = await fetch(MAILERSEND_URL, {
    method:  "POST",
    headers: {
      Authorization: `Bearer ${MAILERSEND_API_KEY}`,
      "Content-Type":  "application/json"
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
}

module.exports = {
  trimiteEmailIMM
};
