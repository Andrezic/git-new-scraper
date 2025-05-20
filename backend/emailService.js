// backend/emailService.js
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
require('dotenv').config();
const MAILERSEND_API_KEY = process.env.MAILERSEND_API_KEY;
const MAILERSEND_URL     = 'https://api.mailersend.com/v1/email';

async function trimiteEmailIMM({ inputNumeFirma = '', clientEmailText = '', clientNameText = '', mesajCatreClientText = '' }) {
  if (!clientEmailText) throw new Error('Lipsește email-ul destinatarului');
  const htmlBody = `
    <h2>Ai un nou Business Match! 🚀</h2>
    <p><strong>Firmă utilizator:</strong> ${inputNumeFirma}</p>
    <p><strong>Client:</strong> ${clientNameText}</p>
    <hr/>... (truncated for brevity)
