import nodemailer from "nodemailer";
import User from "@/models/userModel";
import bcryptjs from "bcryptjs";

export default async function sendEmail({ email, emailType, userId }: any) {
  try {
    let hashedToken = await bcryptjs.hash(userId.toString(), 10);

    let hashedEmail = await bcryptjs.hash(email, 10);

    hashedToken = hashedToken.replace(/[^a-zA-Z0-9]/g, "");
    hashedEmail = hashedEmail.replace(/[^a-zA-Z0-9]/g, "");

    if (emailType === "VERIFY") {
      await User.findByIdAndUpdate(userId, {
        verifyToken: hashedToken,
        verifyTokenExpiry: Date.now() + 3600000,
        hashedEmail: hashedEmail,
      });
    } else if (emailType === "RESET") {
      await User.findByIdAndUpdate(userId, {
        forgotPasswordToken: hashedToken,
        forgotPasswordTokenExpiry: Date.now() + 3600000,
        hashedEmail: hashedEmail,
      });
    }

    const transport = nodemailer.createTransport({
      host: "smtp-relay.sendinblue.com",
      port: 587,
      auth: {
        user: process.env.BREVO_USER,
        pass: process.env.BREVO_API_KEY,
      },
    });

    const verificationLink = `${process.env.DOMAIN}/auth/${
      emailType === "VERIFY" ? "verifyemail" : "resetpassword"
    }/?token=${encodeURIComponent(hashedToken)}&id=${encodeURIComponent(
      hashedEmail
    )}`;

    const mailOptions = {
      from: "tarun79767@gmail.com",
      to: email,
      subject:
        emailType === "VERIFY" ? "Verify your email" : "Reset your password",
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${
    emailType === "VERIFY" ? "Email Verification" : "Password Reset"
  }</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f8fafc;
      margin: 0;
      padding: 0;
      color: #1f2937;
    }
    .email-container {
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 10px;
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
      overflow: hidden;
      border: 1px solid #e2e8f0;
    }
    .header {
      background-color: #0077b6;
      color: #ffffff;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .content {
      padding: 30px 40px;
      text-align: left;
    }
    .content h2 {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 15px;
      color: #1e293b;
    }
    .content p {
      font-size: 15px;
      line-height: 1.6;
      color: #374151;
      margin-bottom: 20px;
    }
    .button-container {
      text-align: center;
      margin: 30px 0;
    }
    .button {
      background-color: #0077b6;
      color: #ffffff !important;
      text-decoration: none;
      padding: 12px 30px;
      border-radius: 6px;
      font-size: 15px;
      font-weight: 600;
      display: inline-block;
      transition: background-color 0.3s ease;
    }
    .button:hover {
      background-color: #005f8d;
    }
    .link {
      color: #0077b6;
      word-break: break-word;
      text-decoration: none;
      font-weight: 500;
    }
    .footer {
      background-color: #f1f5f9;
      text-align: center;
      padding: 18px;
      font-size: 13px;
      color: #6b7280;
    }
    .footer a {
      color: #0077b6;
      text-decoration: none;
      font-weight: 500;
    }
    .footer a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>SmartZaiko</h1>
    </div>
    <div class="content">
      <h2>${
        emailType === "VERIFY"
          ? "Confirm Your Email Address"
          : "Password Reset Request"
      }</h2>
      <p>Hello,</p>
      <p>${
        emailType === "VERIFY"
          ? "Thank you for signing up with SmartZaiko. Please confirm your email address to activate your account."
          : "You recently requested to reset your password for your SmartZaiko account. Click the button below to proceed."
      }</p>
      <div class="button-container">
        <a href="${verificationLink}" class="button" target="_blank">
          ${emailType === "VERIFY" ? "Verify Email" : "Reset Password"}
        </a>
      </div>
      <p>If the button above doesn't work, copy and paste this link into your browser:</p>
      <p><a href="${verificationLink}" class="link" target="_blank">${verificationLink}</a></p>
    </div>
    <div class="footer">
      <p>&copy; 2025 SmartZaiko. All rights reserved.</p>
      <p>
        <a href="https://smartzaiko.vercel.app" target="_blank">Visit SmartZaiko</a>
      </p>
    </div>
  </div>
</body>
</html>
`,
    };

    const mailResponse = await transport.sendMail(mailOptions);
    return mailResponse;
  } catch (error: any) {
    throw new Error(error.message);
  }
}
