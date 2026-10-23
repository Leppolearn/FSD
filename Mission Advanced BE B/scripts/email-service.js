import nodemailer from 'nodemailer';

/**
 * Langkah Keenam: Implementasi Send Email via Nodemailer
 * Fungsi sendmail untuk mengirim token verifikasi ke email pengguna baru
 */
export function createEmailService(options = {}) {
  // Transporter Nodemailer (bisa dikonfigurasi via .env)
  const host = process.env.SMTP_HOST || options.host;
  const port = Number(process.env.SMTP_PORT || options.port || 587);
  const user = process.env.SMTP_USER || options.user;
  const pass = process.env.SMTP_PASS || options.pass;
  const from = process.env.SMTP_FROM || options.from || '"CHILL Movie App" <no-reply@chill.com>';

  let transporter;

  if (host && user) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  } else {
    // Transporter fallback / mock untuk pengujian lokal tanpa koneksi SMTP eksternal
    transporter = {
      async sendMail(mailOptions) {
        console.log(`\n📧 [Nodemailer Simulasi] Mengirim email verifikasi ke: ${mailOptions.to}`);
        console.log(`   Subjek: ${mailOptions.subject}`);
        console.log(`   Link Verifikasi: ${mailOptions.text || mailOptions.html}\n`);
        return { messageId: `mock-${Date.now()}` };
      },
    };
  }

  return {
    /**
     * Langkah Keenam poin 6: Function sendmail
     * Mengirim token verifikasi via nodemailer
     */
    async sendMail({ to, token, fullname = 'Pengguna' }) {
      const appUrl = process.env.APP_URL || 'http://localhost:5000';
      const verifyUrl = `${appUrl}/api/v1/auth/verifikasi-email?token=${token}`;

      const mailOptions = {
        from,
        to,
        subject: 'Verifikasi Akun CHILL Movie App',
        text: `Halo ${fullname},\n\nTerima kasih telah mendaftar di CHILL Movie App. Silakan verifikasi akun Anda melalui tautan berikut:\n${verifyUrl}\n\nToken Anda: ${token}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2>Selamat Datang di CHILL Movie App!</h2>
            <p>Halo <b>${fullname}</b>,</p>
            <p>Terima kasih telah mendaftar. Silakan klik tombol di bawah ini untuk memverifikasi akun Anda:</p>
            <p>
              <a href="${verifyUrl}" style="background-color: #e50914; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Verifikasi Email Sekarang</a>
            </p>
            <p>Atau gunakan kode token berikut: <code>${token}</code></p>
          </div>
        `,
      };

      try {
        const info = await transporter.sendMail(mailOptions);
        return { success: true, messageId: info.messageId, token };
      } catch (error) {
        console.warn('⚠️ Gagal mengirim email (lanjut tanpa blokir):', error.message);
        return { success: false, error: error.message, token };
      }
    },
  };
}

export const emailService = createEmailService();
