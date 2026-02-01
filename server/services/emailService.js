const nodemailer = require('nodemailer');

// Baca credential dari .env
// Pastikan .env sudah diisi — lihat instruksi setup di bawah
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // TLS (bukan SSL) pada port 587
  auth: {
    user: process.env.EMAIL_USER,  // ridorifkihakim@gmail.com
    pass: process.env.EMAIL_PASS   // App Password dari Google (bukan password akun)
  }
});

/**
 * Kirim email contact form ke pemilik site
 * @param {Object} params
 * @param {string} params.name     - Nama pengirim
 * @param {string} params.email    - Email pengirim (dipakai sebagai Reply-To)
 * @param {string} params.subject  - Subject dari form
 * @param {string} params.message  - Pesan dari form
 */
const sendEmail = async ({ name, email, subject, message }) => {
  const mailOptions = {
    from: `"${name}" <${process.env.EMAIL_USER}>`,   // Sender harus = EMAIL_USER untuk Gmail
    replyTo: `"${name}" <${email}>`,                  // Reply langsung ke visitor
    to: process.env.EMAIL_USER,                       // Penerima = pemilik site
    subject: `[Portfolio Contact] ${subject}`,        // Prefix biar mudah disaring di inbox
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            background-color: #f0f2f5;
            margin: 0;
            padding: 20px;
            color: #333;
          }
          .email-wrapper {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 12px rgba(0,0,0,0.08);
          }
          .email-header {
            background: linear-gradient(135deg, #1a1a2e, #16213e);
            padding: 32px 28px;
            text-align: center;
          }
          .email-header h1 {
            margin: 0;
            color: #ffa500;
            font-size: 22px;
            font-weight: 600;
            letter-spacing: 0.5px;
          }
          .email-header p {
            margin: 8px 0 0;
            color: #aaa;
            font-size: 13px;
          }
          .email-body {
            padding: 28px;
          }
          .info-row {
            display: flex;
            align-items: flex-start;
            margin-bottom: 18px;
            padding-bottom: 18px;
            border-bottom: 1px solid #eee;
          }
          .info-row:last-of-type {
            border-bottom: none;
          }
          .info-label {
            width: 90px;
            min-width: 90px;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            color: #ffa500;
            letter-spacing: 0.8px;
            padding-top: 2px;
          }
          .info-value {
            font-size: 14px;
            color: #333;
            line-height: 1.6;
          }
          .info-value a {
            color: #4a90d9;
            text-decoration: none;
          }
          .info-value a:hover {
            text-decoration: underline;
          }
          .message-box {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 18px;
            margin-top: 4px;
          }
          .message-box p {
            margin: 0;
            font-size: 14px;
            line-height: 1.7;
            color: #444;
            white-space: pre-wrap;
          }
          .email-footer {
            background: #f0f2f5;
            padding: 18px 28px;
            text-align: center;
            font-size: 12px;
            color: #999;
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="email-header">
            <h1>📬 New Contact Message</h1>
            <p>From your portfolio website</p>
          </div>

          <div class="email-body">
            <div class="info-row">
              <div class="info-label">Name</div>
              <div class="info-value">${name}</div>
            </div>

            <div class="info-row">
              <div class="info-label">Email</div>
              <div class="info-value"><a href="mailto:${email}">${email}</a></div>
            </div>

            <div class="info-row">
              <div class="info-label">Subject</div>
              <div class="info-value">${subject}</div>
            </div>

            <div class="info-row">
              <div class="info-label">Message</div>
              <div class="info-value">
                <div class="message-box">
                  <p>${message}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="email-footer">
            Sent via Portfolio Contact Form &bull; ${new Date().toLocaleString('en-ID', { timeZone: 'Asia/Jakarta' })}
          </div>
        </div>
      </body>
      </html>
    `
  };

  // Kirim — akan throw error kalau SMTP gagal
  const info = await transporter.sendMail(mailOptions);
  console.log('Email sent successfully. Message ID:', info.messageId);
  return info;
};

module.exports = { sendEmail };