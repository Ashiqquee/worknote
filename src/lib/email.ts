import nodemailer from 'nodemailer';
import { VerificationToken } from '@/models/VerificationToken';
import { encrypt } from './encryption';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function createVerificationToken(email: string, type: 'verification' | 'reset') {
  const token = await generateOTP();
  const encryptedToken = encrypt(token);
  
  // Delete any existing tokens for this email and type
  await VerificationToken.deleteMany({ email, type });
  
  // Create new token that expires in 10 minutes
  const verificationToken = await VerificationToken.create({
    email,
    token: encryptedToken,
    type,
    expires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
  });

  return token;
}

export async function sendVerificationEmail(email: string, token: string) {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Verify Your Work Notes Account',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification</title>
          <style>
            body { 
              font-family: Arial, sans-serif;
              line-height: 1.6;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              padding: 20px;
              background: white;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              padding: 20px 0;
              border-bottom: 2px solid #f0f0f0;
            }
            .header h1 {
              color: #4f46e5;
              margin: 0;
              font-size: 24px;
            }
            .content {
              padding: 20px 0;
              text-align: center;
            }
            .verification-code {
              background: #f0f0f0;
              padding: 15px;
              border-radius: 4px;
              font-size: 24px;
              letter-spacing: 2px;
              color: #4f46e5;
              margin: 20px 0;
              font-family: monospace;
            }
            .footer {
              text-align: center;
              color: #666;
              font-size: 12px;
              padding-top: 20px;
              border-top: 1px solid #f0f0f0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Work Notes</h1>
            </div>
            <div class="content">
              <h2>Verify Your Email Address</h2>
              <p>Thanks for signing up! Please use the verification code below to complete your registration:</p>
              <div class="verification-code">
                ${token}
              </div>
              <p><strong>This code will expire in 10 minutes.</strong></p>
              <p>If you didn't request this verification, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>This is an automated message, please do not reply to this email.</p>
              <p>&copy; ${new Date().getFullYear()} Work Notes. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Reset Your Work Notes Password',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
          <style>
            body { 
              font-family: Arial, sans-serif;
              line-height: 1.6;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              padding: 20px;
              background: white;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              padding: 20px 0;
              border-bottom: 2px solid #f0f0f0;
            }
            .header h1 {
              color: #4f46e5;
              margin: 0;
              font-size: 24px;
            }
            .content {
              padding: 20px 0;
              text-align: center;
            }
            .reset-code {
              background: #f0f0f0;
              padding: 15px;
              border-radius: 4px;
              font-size: 24px;
              letter-spacing: 2px;
              color: #4f46e5;
              margin: 20px 0;
              font-family: monospace;
            }
            .warning {
              color: #dc2626;
              font-size: 14px;
              margin: 20px 0;
              padding: 10px;
              background: #fee2e2;
              border-radius: 4px;
            }
            .footer {
              text-align: center;
              color: #666;
              font-size: 12px;
              padding-top: 20px;
              border-top: 1px solid #f0f0f0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Work Notes</h1>
            </div>
            <div class="content">
              <h2>Password Reset Request</h2>
              <p>We received a request to reset your password. Use the code below to set a new password:</p>
              <div class="reset-code">
                ${token}
              </div>
              <p><strong>This code will expire in 10 minutes.</strong></p>
              <div class="warning">
                If you didn't request this password reset, please ignore this email or contact support if you're concerned about your account's security.
              </div>
            </div>
            <div class="footer">
              <p>This is an automated message, please do not reply to this email.</p>
              <p>&copy; ${new Date().getFullYear()} Work Notes. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
}
