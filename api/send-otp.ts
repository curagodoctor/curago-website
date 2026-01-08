// Vercel Serverless Function - Send OTP
// Generates and sends OTP to user's WhatsApp only

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateOTP, storeOTP } from './utils/otp';
import { sendOTPViaWhatsApp } from './utils/whatsapp';

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
    const { email, whatsapp, name } = req.body;

    // Validate input
    if (!email || !whatsapp) {
      return res.status(400).json({
        success: false,
        message: 'Email and WhatsApp number are required',
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
        message: 'Invalid WhatsApp number. Must be 10 digits.',
      });
    }

    // Generate OTP
    const otp = generateOTP();
    console.log(`Generated OTP for ${email}: ${otp}`); // For development - remove in production

    // Store OTP
    storeOTP(email, whatsapp, otp);

    // Send OTP via WhatsApp API directly
    try {
      const whatsappSent = await sendOTPViaWhatsApp({
        whatsapp: whatsapp,
        otp,
        name: name || 'User',
      });

      console.log(`OTP sending result - WhatsApp: ${whatsappSent}`);

      // Check if WhatsApp was sent
      if (!whatsappSent) {
        return res.status(500).json({
          success: false,
          message: 'Failed to send OTP to WhatsApp. Please check your number and try again.',
        });
      }
    } catch (sendError) {
      console.error('Failed to send OTP:', sendError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP. Please try again.',
      });
    }

    // Return success response with CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully to your WhatsApp',
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while sending OTP. Please try again.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
