const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const MAILERSEND_API_KEY = process.env.MAILERSEND_API_KEY;
const MAILERSEND_URL = "https://api.mailersend.com/v1/email";

async function trimiteEmailIMM({ numeFirma, emailDestinatar, clientName, clientRequest }) {
  try {
    const payload = {
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
      subject: "Ai un nou Business Match! 🚀",
      template_id: "351ndgwkqzrgzqx8", // <-- aici între ghilimele!
      variables: [
        {
          email: emailDestinatar,
          substitutions: [
            { var: "numeFirma", value: numeFirma },
            { var: "clientName", value: clientName },
            { var: "clientRequest", value: clientRequest },
            { var: "account_name", value: "Skyward Flow" }
          ]
        }
      ]
    };

    const response = await fetch(MAILERSEND_URL, {
      method: "POST",
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
