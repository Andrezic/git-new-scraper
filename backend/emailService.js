const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const MAILERSEND_API_KEY = process.env.MAILERSEND_API_KEY;
const MAILERSEND_URL = "https://api.mailersend.com/v1/email";

async function trimiteEmailIMM({ numeFirma, inputEmailDestinatar, inputNumeFirma, mesajCatreClientText }) {
  try {
    const payload = {
      from: {
        email: "noreply@skywardflow.com",
        name: "Skyward Flow"
      },
      to: [
        {
          email: inputEmailDestinatar,
          name: inputEmailFirma
        }
      ],
      subject: "Ai un nou Business Match! 🚀",
      
      variables: [
        {
          email: emailDestinatar,
          substitutions: [
            { var: "inputNumeFirma", value: inputNumeFirma },
            { var: "inputEmailFirma", value: inputEmailFirma },
            { var: "mesajCatreClientText", value: mesajCatreClientText },
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
