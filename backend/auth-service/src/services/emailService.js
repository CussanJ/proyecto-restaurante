const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verifica la conexión con Gmail al iniciar
transporter.verify((error) => {
  if (error) {
    console.error('❌ Error conexión email:', error.message);
  } else {
    console.log('✅ Servidor de correo listo');
  }
});

const enviarEmailRecuperacion = async (destinatario, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/admin/reset-password/${token}`;

  await transporter.sendMail({
    from: `"La Terraza del Mar" <${process.env.EMAIL_USER}>`,
    to: destinatario,
    subject: 'Recuperación de contraseña — La Terraza del Mar',
    html: `
      <!DOCTYPE html>
      <html lang="es">
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="margin:0;padding:0;background-color:#0A0A0A;font-family:Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0A0A0A;padding:40px 0;">
          <tr><td align="center">
            <table width="520" cellpadding="0" cellspacing="0" style="background-color:#1c1b1b;border:1px solid #353534;border-radius:12px;overflow:hidden;">

              <!-- Encabezado -->
              <tr>
                <td style="background-color:#201f1f;padding:28px 32px;border-bottom:1px solid #353534;">
                  <p style="margin:0;font-size:22px;font-weight:900;color:#f27a18;letter-spacing:-0.5px;">La Terraza del Mar</p>
                  <p style="margin:6px 0 0;font-size:12px;color:#a68b7d;">Panel de Administración</p>
                </td>
              </tr>

              <!-- Cuerpo -->
              <tr>
                <td style="padding:32px;">
                  <h2 style="margin:0 0 12px;font-size:20px;color:#e5e2e1;">Recuperación de contraseña</h2>
                  <p style="margin:0 0 16px;font-size:14px;color:#dec1b0;line-height:22px;">
                    Hemos recibido una solicitud para restablecer la contraseña de tu cuenta de administrador.
                  </p>
                  <p style="margin:0 0 24px;font-size:14px;color:#dec1b0;line-height:22px;">
                    Haz clic en el botón para crear una nueva contraseña. Este enlace expirará en
                    <strong style="color:#f27a18;">1 hora</strong>.
                  </p>
                  <div style="text-align:center;margin:28px 0;">
                    <a href="${resetUrl}" style="display:inline-block;background-color:#f27a18;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:8px;font-weight:700;font-size:15px;">
                      Restablecer contraseña
                    </a>
                  </div>
                  <div style="background-color:#201f1f;border:1px solid #353534;border-radius:8px;padding:14px 18px;margin-top:20px;">
                    <p style="margin:0;font-size:12px;color:#a68b7d;line-height:18px;">
                      Si no solicitaste este cambio, ignora este correo. Tu contraseña actual seguirá siendo la misma.
                    </p>
                  </div>
                  <p style="margin:20px 0 0;font-size:12px;color:#574236;">
                    Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
                    <span style="color:#f27a18;">${resetUrl}</span>
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding:20px 32px;border-top:1px solid #353534;text-align:center;">
                  <p style="margin:0;font-size:11px;color:#a68b7d;">© 2024 La Terraza del Mar. Todos los derechos reservados.</p>
                </td>
              </tr>

            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `,
  });
};

module.exports = { enviarEmailRecuperacion };
