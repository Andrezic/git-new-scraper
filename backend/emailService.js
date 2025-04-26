const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const MAILERSEND_API_KEY = process.env.MAILERSEND_API_KEY;
const MAILERSEND_URL = "https://api.mailersend.com/v1/email";

async function trimiteEmailIMM({ numeFirma, emailDestinatar, clientName, clientRequest }) {
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
        to: [
          {
            email: emailDestinatar,
            name: numeFirma
          }
        ],
        template_id: "0r83ql3mj2zgzw1j",
        subject: "✅ Skyward Flow: Ai un nou Business Match pentru firma ta! 🚀",
        variables: [
          {
            email: emailDestinatar,
            substitutions: {
              numeFirma: numeFirma,
              clientName: clientName,
              account_name: "Skyward Flow",
              clientRequest: clientRequest
            }
          }
        ]
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("❌ Eroare MailerSend:", errorBody);
      throw new Error(`MailerSend API error: ${response.status}`);
    }

    console.log("✅ Email trimis cu succes prin MailerSend Template cu to și subject!");
    return { success: true };
  } catch (error) {
    console.error("❌ Eroare trimitere email:", error.message);
    return { success: false, error: error.message };
  }
}

module.exports = {
  trimiteEmailIMM
};
