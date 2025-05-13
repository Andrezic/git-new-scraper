// backend/emailService.js

const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

const MAILERSEND_API_KEY = process.env.MAILERSEND_API_KEY;
const MAILERSEND_URL     = "https://api.mailersend.com/v1/email";

/**
 * Trimite un email prin MailerSend folosind template
 * @param {{ NumeFirma: string, EmailDestinatar: string, EmailFirma: string, mesajCatreClient: string }} params
 */
async function trimiteEmailIMM({
  NumeFirma,
  EmailDestinatar,
  EmailFirma,
  mesajCatreClient
}) {
  try {
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
      variables: [
        {
          email: EmailDestinatar,
          substitutions: [
            { var: "NumeFirma",        value: NumeFirma },
            { var: "EmailFirma",       value: EmailFirma },
            { var: "mesajCatreClient", value: mesajCatreClient },
            { var: "account_name",     value: "Skyward Flow" }
          ]
        }
      ]
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
      const errorBody = await response.text();
      console.error("❌ Eroare MailerSend:", errorBody);
      throw new Error(`MailerSend API error: ${response.status}`);
    }

    console.log("✅ Email trimis cu succes prin Template MailerSend!");
    return { success: true };
  } catch (error) {
    console.error("❌ Eroare trimitere email:", error.message);
    return { success: false, error: error.message };
  }
}

module.exports = {
  trimiteEmailIMM
};
