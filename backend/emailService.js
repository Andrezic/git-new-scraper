// backend/emailService.js

// Dynamic import pentru node-fetch (compatibil cu Node.js <18)
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

// Cheia API MailerSend, setată în fișierul .env
const MAILERSEND_API_KEY = process.env.MAILERSEND_API_KEY;
const MAILERSEND_URL     = 'https://api.mailersend.com/v1/email';

/**
 * Trimite un email prin MailerSend
 * @param {{
 *   numeFirma: string,
 *   emailDestinatar: string,
 *   clientName: string,
 *   clientRequest: string
 * }} params
 */
async function trimiteEmailIMM({
  numeFirma = '',
  emailDestinatar = '',
  clientName = '',
  clientRequest = ''
}) {
  // Validare minimală
  if (!emailDestinatar) {
    throw new Error('Lipsește email-ul destinatarului');
  }

  // Construim corpul email-ului în HTML
  const htmlBody = `
    <h2>Ai un nou Business Match! 🚀</h2>
    <p><strong>Firmă:</strong> ${numeFirma}</p>
    <p><strong>Client:</strong> ${clientName}</p>
    <hr/>
    <p>${clientRequest.replace(/\n/g, '<br/>')}</p>
  `;

  const payload = {
    from: {
      email: 'noreply@skywardflow.com',
      name:  'Skyward Flow'
    },
    to: [
      {
        email: emailDestinatar,
        name:  clientName
      }
    ],
    subject: 'Ai un nou Business Match! 🚀',
    html:    htmlBody
  };

  const response = await fetch(MAILERSEND_URL, {
    method:  'POST',
    headers: {
      Authorization: `Bearer ${MAILERSEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Eroare MailerSend:', errorText);
    throw new Error(`MailerSend API error: ${response.status}`);
  }

  console.log('✅ Email trimis cu succes prin MailerSend!');
  return { success: true };
}

module.exports = {
  trimiteEmailIMM
};
