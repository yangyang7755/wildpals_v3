import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

// TODO: Move these to environment variables
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const EMAIL_USER = process.env.EMAIL_USER || "your-email@gmail.com";
const EMAIL_PASS = process.env.EMAIL_PASS || "your-app-password";
const APP_URL = process.env.APP_URL || "http://localhost:8080";

// Create email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

// In-memory storage for demo (use database in production)
const pendingUsers = new Map<string, any>();
const verifiedUsers = new Map<string, any>();

export const sendVerificationEmail: RequestHandler = async (req, res) => {
  try {
    const { email, fullName, password } = req.body;

    if (!email || !fullName || !password) {
      return res.status(400).json({ 
        error: "Missing required fields" 
      });
    }

    // Check if email already exists
    if (verifiedUsers.has(email)) {
      return res.status(400).json({ 
        error: "Email already registered" 
      });
    }

    // Generate verification token (expires in 24 hours)
    const verificationToken = jwt.sign(
      { email, fullName, password },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Store pending user
    pendingUsers.set(email, {
      email,
      fullName,
      password, // In production, hash this!
      verificationToken,
      createdAt: new Date(),
    });

    // Create verification link
    const verificationLink = `${APP_URL}/api/auth/verify-email?token=${verificationToken}`;

    // Email template
    const mailOptions = {
      from: `"Wildpals" <${EMAIL_USER}>`,
      to: email,
      subject: 'Verify your Wildpals account',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4A7C59; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background-color: #4A7C59; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏔️ Welcome to Wildpals!</h1>
            </div>
            <div class="content">
              <h2>Hi ${fullName},</h2>
              <p>Thanks for signing up! We're excited to have you join our community of outdoor enthusiasts.</p>
              <p>Please verify your email address by clicking the button below:</p>
              <div style="text-align: center;">
                <a href="${verificationLink}" class="button">Verify Email Address</a>
              </div>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #4A7C59;">${verificationLink}</p>
              <p><strong>This link will expire in 24 hours.</strong></p>
              <p>If you didn't create an account with Wildpals, you can safely ignore this email.</p>
            </div>
            <div class="footer">
              <p>© 2025 Wildpals. All rights reserved.</p>
              <p>Find your adventure partners</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.json({ 
      success: true,
      message: "Verification email sent successfully",
      email 
    });

  } catch (error: any) {
    console.error('Error sending verification email:', error);
    console.error('Error details:', error.message);
    console.error('Error code:', error.code);
    res.status(500).json({ 
      error: "Failed to send verification email",
      details: error.message 
    });
  }
};

export const verifyEmail: RequestHandler = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invalid Link</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .error { color: #d32f2f; }
          </style>
        </head>
        <body>
          <h1 class="error">❌ Invalid Verification Link</h1>
          <p>This verification link is invalid or malformed.</p>
        </body>
        </html>
      `);
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const { email, fullName, password } = decoded;

    // Check if user is still pending
    if (!pendingUsers.has(email)) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Already Verified</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .success { color: #4A7C59; }
          </style>
        </head>
        <body>
          <h1 class="success">✅ Email Already Verified</h1>
          <p>Your email has already been verified. You can now log in to the app.</p>
        </body>
        </html>
      `);
    }

    // Move user from pending to verified
    verifiedUsers.set(email, {
      id: Date.now().toString(),
      email,
      fullName,
      password, // In production, this should already be hashed
      emailVerified: true,
      hasCompletedProfile: false,
      createdAt: new Date(),
    });

    pendingUsers.delete(email);

    // Success page
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Email Verified</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            text-align: center; 
            padding: 50px;
            background: linear-gradient(135deg, #4A7C59 0%, #6B9E7A 100%);
            color: white;
          }
          .container {
            background: white;
            color: #333;
            padding: 40px;
            border-radius: 12px;
            max-width: 500px;
            margin: 0 auto;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .success { color: #4A7C59; font-size: 48px; }
          .button {
            display: inline-block;
            background-color: #4A7C59;
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 8px;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="success">✅</div>
          <h1>Email Verified!</h1>
          <p>Your email has been successfully verified.</p>
          <p>You can now return to the app and complete your profile setup.</p>
          <a href="wildpals://verified" class="button">Open Wildpals App</a>
        </div>
      </body>
      </html>
    `);

  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Link Expired</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .error { color: #d32f2f; }
          </style>
        </head>
        <body>
          <h1 class="error">⏰ Link Expired</h1>
          <p>This verification link has expired. Please request a new one from the app.</p>
        </body>
        </html>
      `);
    }

    console.error('Error verifying email:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Verification Failed</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
          .error { color: #d32f2f; }
        </style>
      </head>
      <body>
        <h1 class="error">❌ Verification Failed</h1>
        <p>An error occurred while verifying your email. Please try again.</p>
      </body>
      </html>
    `);
  }
};

export const checkVerificationStatus: RequestHandler = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: "Email is required" });
    }

    const verified = verifiedUsers.has(email);
    
    res.json({ 
      verified,
      user: verified ? verifiedUsers.get(email) : null
    });

  } catch (error) {
    console.error('Error checking verification status:', error);
    res.status(500).json({ error: "Failed to check verification status" });
  }
};

export const resendVerificationEmail: RequestHandler = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const pendingUser = pendingUsers.get(email);
    
    if (!pendingUser) {
      return res.status(404).json({ 
        error: "No pending verification found for this email" 
      });
    }

    // Generate new token
    const verificationToken = jwt.sign(
      { 
        email: pendingUser.email, 
        fullName: pendingUser.fullName,
        password: pendingUser.password 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Update stored token
    pendingUser.verificationToken = verificationToken;
    pendingUsers.set(email, pendingUser);

    // Create verification link
    const verificationLink = `${APP_URL}/api/auth/verify-email?token=${verificationToken}`;

    // Send email
    const mailOptions = {
      from: `"Wildpals" <${EMAIL_USER}>`,
      to: email,
      subject: 'Verify your Wildpals account',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4A7C59; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background-color: #4A7C59; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏔️ Verify Your Email</h1>
            </div>
            <div class="content">
              <h2>Hi ${pendingUser.fullName},</h2>
              <p>Here's your new verification link:</p>
              <div style="text-align: center;">
                <a href="${verificationLink}" class="button">Verify Email Address</a>
              </div>
              <p><strong>This link will expire in 24 hours.</strong></p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({ 
      success: true,
      message: "Verification email resent successfully" 
    });

  } catch (error) {
    console.error('Error resending verification email:', error);
    res.status(500).json({ 
      error: "Failed to resend verification email" 
    });
  }
};
