const nodemailer = require('nodemailer');

/**
 * Email utility functions
 * Uses Nodemailer to send emails in production
 * In development mode, logs to console
 */

// Create a transporter based on environment
const createTransporter = () => {
  if (process.env.NODE_ENV === 'development') {
    // For development, use ethereal.email (fake SMTP service)
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: process.env.ETHEREAL_EMAIL || 'demo@ethereal.email',
        pass: process.env.ETHEREAL_PASSWORD || 'demo123'
      }
    });
  } else {
    // For production, use configured SMTP service
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });
  }
};

/**
 * Send email using Nodemailer
 * @param {Object} options - Email options
 * @returns {Promise} - Result of sending email
 */
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();
    
    // Set up email options
    const mailOptions = {
      from: `"YouFin Team" <${process.env.EMAIL_FROM || 'noreply@youfin.app'}>`,
      to: options.email,
      subject: options.subject,
      text: options.text,
      html: options.html
    };
    
    // In development, just log the email
    if (process.env.NODE_ENV === 'development') {
      console.log(`
        ======== EMAIL WOULD BE SENT ========
        To: ${options.email}
        Subject: ${options.subject}
        Content:
        ${options.text || options.html}
        =====================================
      `);
      return {
        messageId: 'dev-mode-email',
        accepted: [options.email],
        response: 'Development mode - email logged to console'
      };
    }
    
    // Send the email in production
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    // Don't throw the error, just return a failure object
    return {
      error: true,
      message: error.message,
      success: false
    };
  }
};

/**
 * Send verification email
 * @param {string} email - Recipient email
 * @param {string} token - Verification token
 */
exports.sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email/${token}`;
  
  const subject = 'Welcome to YouFin - Verify Your Email';
  
  const text = `
    Hello,
    
    Thank you for registering with YouFin! Please verify your email address by clicking the link below:
    
    ${verificationUrl}
    
    This link will expire in 24 hours.
    
    Best regards,
    The YouFin Team
  `;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #121212; color: white; border-radius: 8px;">
      <img src="${process.env.FRONTEND_URL || 'http://localhost:5173'}/logo.png" alt="YouFin Logo" style="display: block; margin: 0 auto 20px; max-width: 150px;">
      <h2 style="color: #FFDE59; text-align: center;">Welcome to YouFin!</h2>
      <p>Thank you for registering with YouFin. To complete your registration and verify your email address, please click the button below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" style="background-color: #FFDE59; color: black; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Verify Email Address</a>
      </div>
      <p>This link will expire in 24 hours.</p>
      <p>If you did not create an account, please ignore this email.</p>
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #333; text-align: center; font-size: 12px; color: #aaa;">
        <p>© ${new Date().getFullYear()} YouFin. All rights reserved.</p>
      </div>
    </div>
  `;
  
  return sendEmail({
    email,
    subject,
    text,
    html
  });
};

/**
 * Send password reset email
 * @param {string} email - Recipient email
 * @param {string} token - Reset token
 */
exports.sendResetPasswordEmail = async (email, token) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${token}`;
  
  const subject = 'YouFin - Reset Your Password';
  
  const text = `
    Hello,
    
    You have requested to reset your password. Please click the link below to set a new password:
    
    ${resetUrl}
    
    This link will expire in 1 hour.
    
    If you did not request this, please ignore this email.
    
    Best regards,
    The YouFin Team
  `;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #121212; color: white; border-radius: 8px;">
      <img src="${process.env.FRONTEND_URL || 'http://localhost:5173'}/logo.png" alt="YouFin Logo" style="display: block; margin: 0 auto 20px; max-width: 150px;">
      <h2 style="color: #FFDE59; text-align: center;">Password Reset Request</h2>
      <p>You have requested to reset your password. Please click the button below to set a new password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #FFDE59; color: black; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Reset Password</a>
      </div>
      <p>This link will expire in 1 hour.</p>
      <p>If you did not request this, please ignore this email or contact support if you have concerns.</p>
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #333; text-align: center; font-size: 12px; color: #aaa;">
        <p>© ${new Date().getFullYear()} YouFin. All rights reserved.</p>
      </div>
    </div>
  `;
  
  return sendEmail({
    email,
    subject,
    text,
    html
  });
};

/**
 * Send 2FA setup email
 * @param {string} email - Recipient email
 * @param {string} secret - 2FA secret
 * @param {string} qrCodeUrl - QR code data URL
 */
exports.send2FASetupEmail = async (email, secret, qrCodeUrl) => {
  const subject = 'YouFin - Two-Factor Authentication Setup';
  
  const text = `
    Hello,
    
    Your two-factor authentication setup is ready. 
    
    Please use the following secret key in your authenticator app:
    ${secret}
    
    For security reasons, we recommend using the QR code in the HTML version of this email.
    
    Best regards,
    The YouFin Team
  `;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #121212; color: white; border-radius: 8px;">
      <img src="${process.env.FRONTEND_URL || 'http://localhost:5173'}/logo.png" alt="YouFin Logo" style="display: block; margin: 0 auto 20px; max-width: 150px;">
      <h2 style="color: #FFDE59; text-align: center;">Two-Factor Authentication Setup</h2>
      <p>Your two-factor authentication setup is ready. Please scan the QR code below with your authenticator app:</p>
      <div style="text-align: center; margin: 30px 0; background-color: white; padding: 15px; border-radius: 4px;">
        <img src="${qrCodeUrl}" alt="2FA QR Code" style="max-width: 200px;">
      </div>
      <p>Or manually enter this code in your authenticator app:</p>
      <div style="background-color: #1E1E1E; padding: 10px; border-radius: 4px; text-align: center; font-family: monospace; margin: 15px 0; word-break: break-all;">
        <code style="color: #FFDE59;">${secret}</code>
      </div>
      <p>After scanning the QR code or entering the secret, enter the 6-digit code from your authenticator app to complete the setup.</p>
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #333; text-align: center; font-size: 12px; color: #aaa;">
        <p>© ${new Date().getFullYear()} YouFin. All rights reserved.</p>
      </div>
    </div>
  `;
  
  return sendEmail({
    email,
    subject,
    text,
    html
  });
};

/**
 * Send notification email
 * @param {string} email - Recipient email
 * @param {string} subject - Email subject
 * @param {string} message - Email message
 */
exports.sendNotificationEmail = async (email, subject, message) => {
  const text = `
    Hello,
    
    ${message}
    
    Best regards,
    The YouFin Team
  `;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #121212; color: white; border-radius: 8px;">
      <img src="${process.env.FRONTEND_URL || 'http://localhost:5173'}/logo.png" alt="YouFin Logo" style="display: block; margin: 0 auto 20px; max-width: 150px;">
      <h2 style="color: #FFDE59; text-align: center;">${subject}</h2>
      <p>${message}</p>
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #333; text-align: center; font-size: 12px; color: #aaa;">
        <p>© ${new Date().getFullYear()} YouFin. All rights reserved.</p>
      </div>
    </div>
  `;
  
  return sendEmail({
    email,
    subject,
    text,
    html
  });
}; 