// Vercel Serverless Function - Verify OTP
// Verifies the OTP entered by the user

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyOTP } from './utils/otp';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Max-Age', '86400');
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const { email, whatsapp, otp } = req.body;

    // Validate input
    if (!email || !whatsapp || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email, WhatsApp number, and OTP are required',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address',
      });
    }

    // Validate WhatsApp number (10 digits)
    const whatsappRegex = /^\d{10}$/;
    if (!whatsappRegex.test(whatsapp)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid WhatsApp number',
      });
    }

    // Validate OTP format (6 digits)
    const otpRegex = /^\d{6}$/;
    if (!otpRegex.test(otp)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP format. Must be 6 digits.',
      });
    }

    // Verify OTP
    const result = verifyOTP(email, whatsapp, otp);

    // Return response with CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (result.valid) {
      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

  } catch (error) {
    console.error('Verify OTP error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while verifying OTP. Please try again.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
