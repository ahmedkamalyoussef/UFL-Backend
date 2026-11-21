"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const nodemailer = require("nodemailer");
const env_1 = require("../config/env");

class EmailService {
    static getTransporter() {
        if (!this.transporter) {
            const host = env_1.env.EMAIL_HOST || 'smtp.gmail.com';
            const port = typeof env_1.env.EMAIL_PORT === 'number' ? env_1.env.EMAIL_PORT : parseInt(env_1.env.EMAIL_PORT, 10) || 465;
            const secure = env_1.env.EMAIL_SECURE === true || env_1.env.EMAIL_SECURE === 'true' || port === 465;
            const user = env_1.env.EMAIL_USER;
            const pass = env_1.env.EMAIL_PASS;

            this.transporter = nodemailer.createTransport({
                host,
                port,
                secure,
                auth: {
                    user,
                    pass,
                },
            });
        }
        return this.transporter;
    }

    static async sendPasswordResetOtp(toEmail, otp) {
        const sender = env_1.env.EMAIL_USER || 'no-reply@futballa.com';
        const transporter = this.getTransporter();

        const htmlContent = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>رمز إعادة تعيين كلمة المرور</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #0d1117;
      color: #ffffff;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 520px;
      margin: 0 auto;
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 8px 24px rgba(0,0,0,0.5);
    }
    .header {
      background: linear-gradient(135deg, #131313 0%, #1f2937 100%);
      padding: 30px 20px;
      text-align: center;
      border-bottom: 2px solid #00ff41;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      color: #00ff41;
      letter-spacing: 2px;
      font-weight: 900;
    }
    .content {
      padding: 30px 24px;
      text-align: center;
    }
    .content p {
      color: #c9d1d9;
      font-size: 15px;
      line-height: 1.6;
      margin: 12px 0;
    }
    .otp-box {
      margin: 28px auto;
      padding: 16px 24px;
      background: #0d1117;
      border: 2px dashed #00ff41;
      border-radius: 12px;
      display: inline-block;
    }
    .otp-code {
      font-size: 36px;
      font-weight: 900;
      letter-spacing: 8px;
      color: #00ff41;
      font-family: monospace, Courier, sans-serif;
      margin: 0;
    }
    .badge {
      display: inline-block;
      background: rgba(255, 215, 0, 0.15);
      color: #ffd700;
      border: 1px solid #ffd700;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: bold;
      margin-top: 10px;
    }
    .footer {
      background: #0d1117;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #8b949e;
      border-top: 1px solid #21262d;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>FUTBALLA</h1>
    </div>
    <div class="content">
      <h2 style="color: #ffffff; margin-top: 0;">إعادة تعيين كلمة المرور</h2>
      <p>تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك في تطبيق Futballa.</p>
      <p>استخدم رمز التحقق التالي لإتمام العملية:</p>
      
      <div class="otp-box">
        <div class="otp-code">${otp}</div>
      </div>
      
      <div>
        <span class="badge">صلاحية الرمز: 15 دقيقة فقط</span>
      </div>

      <p style="font-size: 13px; color: #8b949e; margin-top: 24px;">
        إذا لم تكن قد طلبت إعادة تعيين كلمة المرور، يرجى تجاهل هذه الرسالة فلن يتم تغيير أي شيء في حسابك.
      </p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Futballa Platform. جميع الحقوق محفوظة.
    </div>
  </div>
</body>
</html>
        `;

        try {
            const info = await transporter.sendMail({
                from: `"Futballa Support" <${sender}>`,
                to: toEmail,
                subject: 'رمز إعادة تعيين كلمة المرور - Futballa',
                text: `رمز إعادة تعيين كلمة المرور الخاص بك في تطبيق Futballa هو: ${otp} (صالح لمدة 15 دقيقة).`,
                html: htmlContent,
            });
            console.log(`[EmailService] Password reset email sent successfully to ${toEmail}: ${info.messageId}`);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error(`[EmailService] Error sending email to ${toEmail}:`, error);
            throw {
                code: 'EMAIL_SEND_FAILED',
                message: 'Failed to send verification email. Please verify email credentials or try again later.',
                statusCode: 500,
                details: error.message,
            };
        }
    }
}

EmailService.transporter = null;
exports.EmailService = EmailService;
