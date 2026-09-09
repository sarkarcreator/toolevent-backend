import nodemailer from 'nodemailer';

const smtpHost = process.env.SMTP_HOST || 'smtp.hostinger.com';
const smtpPort = Number(process.env.SMTP_PORT || 465);
const smtpUser = process.env.SMTP_USER || '';
const smtpPass = process.env.SMTP_PASS || '';
const mailFrom = process.env.MAIL_FROM || smtpUser || 'care@toolbox.events';

export function isEmailConfigured() {
  return Boolean(smtpUser && smtpPass);
}

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined,
});

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  if (!isEmailConfigured()) {
    throw new Error('SMTP email service is not configured.');
  }

  await transporter.sendMail({
    from: mailFrom,
    to,
    subject: 'Reset your Toolbox.Events password',
    text: `We received a request to reset your Toolbox.Events password.\n\nReset your password here:\n${resetUrl}\n\nThis link expires in 30 minutes. If you did not request this, you can safely ignore this email.`,
    html: `<!doctype html><html><body style="margin:0;background:#f7f8fa;font-family:Arial,sans-serif;color:#17191f"><div style="max-width:560px;margin:40px auto;background:#fff;border:1px solid #e7e9ee;border-radius:18px;padding:36px"><h1 style="margin:0 0 10px;font-size:26px">Reset your password</h1><p style="color:#667085;line-height:1.6">We received a request to reset your Toolbox.Events password.</p><p style="margin:28px 0"><a href="${resetUrl}" style="display:inline-block;background:#ff5a36;color:#fff;text-decoration:none;padding:13px 20px;border-radius:10px;font-weight:700">Reset Password</a></p><p style="color:#667085;font-size:13px;line-height:1.6">This link expires in 30 minutes. If you did not request this, you can safely ignore this email.</p><p style="margin-top:28px;font-weight:700">Toolbox.Events</p></div></body></html>`,
  });
}
