// backend/emailService.js
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
require('dotenv').config();
const MAILERSEND_API_KEY = process.env.MAILERSEND_API_KEY;
const MAILERSEND_URL     = 'https://api.mailersend.com/v1/email';

async function trimiteEmailIMM({
  inputNumeFirma = '',
  clientEmailText = '',
  clientNameText = '',
  mesajCatreClientText = ''
}) {
  if (!clientEmailText) {
    throw new Error('Lipsește email-ul destinatarului');
  }

  const htmlBody = `
    <h2>Ai un nou Business Match! 🚀</h2>
    <p><strong>Firmă utilizator:</strong> ${inputNumeFirma}</p>
    <p><strong>Client:</strong> ${clientNameText}</p>
    <hr/>
    <p>${mesajCatreClientText.replace(/\n/g, '<br/>')}</p>
  `;

  const payload = {
    from: { email: 'noreply@skywardflow.com', name: 'Skyward Flow' },
    to: [ { email: clientEmailText, name: clientNameText } ],
    subject: 'Ai un nou Business Match! 🚀',
    html:    htmlBody
  };

  const response = await fetch(MAILERSEND_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${MAILERSEND_API_KEY}`, 'Content-Type': 'application/json' },
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

module.exports = { trimiteEmailIMM };