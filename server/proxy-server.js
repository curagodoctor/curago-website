// Simple Express Proxy Server for Google Apps Script
// This runs on your Hostinger VPS to bypass CORS issues

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Your Google Apps Script Web App URL
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxU7vjSvZprWQmtmR8g490nQpYQkJm04cZHpiTkD_bHU4hYbGaYUXEiV1MT85Tetbgh/exec';

// Razorpay credentials from environment variables
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

// Wylto WhatsApp API credentials from environment variables
const WYLTO_API_URL = process.env.WYLTO_API_URL || 'https://server.wylto.com/api/v1/wa/send';
const WYLTO_API_KEY = process.env.WYLTO_API_KEY;

// Enable CORS for all origins (you can restrict this to your domain)
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Proxy server is running' });
});

// Test Google Apps Script endpoint
app.get('/api/google-sheets', async (req, res) => {
  try {
    console.log('📥 Testing Google Apps Script with GET request');

    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'GET',
      redirect: 'follow',
    });

    const text = await response.text();

    console.log('📄 GET Response:', {
      status: response.status,
      statusText: response.statusText,
      contentType: response.headers.get('content-type'),
      url: response.url, // Final URL after redirects
      textPreview: text.substring(0, 200)
    });

    try {
      const data = JSON.parse(text);
      res.json(data);
    } catch (e) {
      res.json({
        success: false,
        error: 'Non-JSON response',
        htmlPreview: text.substring(0, 500)
      });
    }

  } catch (error) {
    console.error('❌ GET test error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Proxy endpoint for Google Sheets
app.post('/api/google-sheets', async (req, res) => {
  try {
    console.log('📥 Received request:', {
      body: req.body,
      timestamp: new Date().toISOString()
    });

    // Forward the request to Google Apps Script
    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(req.body),
      redirect: 'follow', // Follow redirects from Google Apps Script
      follow: 20, // Maximum redirects to follow
    });

    // Get the response text first to handle both JSON and HTML errors
    const text = await response.text();

    console.log('📄 Response from Google Apps Script:', {
      status: response.status,
      statusText: response.statusText,
      contentType: response.headers.get('content-type'),
      textLength: text.length,
      textPreview: text.substring(0, 200)
    });

    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(text);

      console.log('✅ Parsed JSON response:', {
        success: data.success
      });

      // Return the response with CORS headers (already handled by cors middleware)
      res.status(response.ok ? 200 : 500).json(data);

    } catch (jsonError) {
      // Response is not JSON (probably HTML error page)
      console.error('❌ Google Apps Script returned non-JSON response (HTML error page)');
      console.error('Response text:', text);

      res.status(500).json({
        success: false,
        error: 'Google Apps Script error',
        details: 'The Apps Script returned an HTML error page instead of JSON. This usually means there is an error in the Apps Script code. Check the Apps Script execution logs.',
        htmlPreview: text.substring(0, 500)
      });
    }

  } catch (error) {
    console.error('❌ Proxy error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Unknown error',
      type: error.name
    });
  }
});

// Handle OPTIONS requests (CORS preflight)
app.options('/api/google-sheets', cors());

// Payment verification endpoint
app.post('/api/verify-payment', async (req, res) => {
  try {
    const { payment_id } = req.body;

    console.log('💳 Verifying payment:', payment_id);

    if (!payment_id) {
      return res.status(400).json({
        success: false,
        error: 'Payment ID is required'
      });
    }

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      console.error('❌ Razorpay credentials not configured');
      return res.status(500).json({
        success: false,
        error: 'Payment verification service not configured'
      });
    }

    // Create base64 encoded credentials for Razorpay API
    const credentials = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');

    // Call Razorpay API to fetch payment details
    const response = await fetch(`https://api.razorpay.com/v1/payments/${payment_id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Razorpay API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });

      return res.status(response.status).json({
        success: false,
        error: 'Failed to verify payment',
        details: errorText
      });
    }

    const paymentData = await response.json();

    console.log('✅ Payment verification successful:', {
      id: paymentData.id,
      status: paymentData.status,
      amount: paymentData.amount,
      currency: paymentData.currency
    });

    // Check if payment is successful
    const isValid = paymentData.status === 'captured' || paymentData.status === 'authorized';

    res.json({
      success: true,
      valid: isValid,
      payment: {
        id: paymentData.id,
        status: paymentData.status,
        amount: paymentData.amount / 100, // Convert paise to rupees
        currency: paymentData.currency,
        method: paymentData.method,
        email: paymentData.email,
        contact: paymentData.contact,
        created_at: paymentData.created_at
      }
    });

  } catch (error) {
    console.error('❌ Payment verification error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Payment verification failed'
    });
  }
});

// Handle OPTIONS requests (CORS preflight) for payment verification
app.options('/api/verify-payment', cors());

// ========================
// OTP ENDPOINTS
// ========================

// In-memory OTP storage (for production, use Redis or database)
const otpStore = new Map();
const OTP_EXPIRY_TIME = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 3;

// Generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Create storage key
function createKey(email, whatsapp) {
  return `${email}-${whatsapp}`;
}

// Send OTP via Wylto WhatsApp API
async function sendOTPViaWhatsApp({ whatsapp, otp, name }) {
  try {
    if (!WYLTO_API_KEY) {
      console.error('Wylto API key not configured');
      throw new Error('Wylto API not configured');
    }

    // Format phone number: 91XXXXXXXXXX
    const phoneNumber = whatsapp.replace(/^(\+91)?/, '');
    const fullNumber = `91${phoneNumber}`;

    console.log(`📱 Sending OTP to WhatsApp: ${fullNumber}`);

    const response = await fetch(`${WYLTO_API_URL}?sync=true`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WYLTO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: fullNumber,
        message: {
          type: 'template',
          template: {
            templateName: 'otp_template',
            language: 'en_US',
            body: [
              { type: 'text', text: otp },
              { type: 'text', text: otp },
              { type: 'text', text: otp },
              { type: 'text', text: otp }
            ],
            buttons: [
              { type: 'url', payload: otp }
            ],
            category: 'AUTHENTICATION'
          }
        }
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`✅ WhatsApp OTP sent successfully to ${fullNumber}`);
      return true;
    } else {
      console.error('❌ Wylto API error:', data);
      return false;
    }
  } catch (error) {
    console.error('❌ Error sending WhatsApp OTP:', error);
    return false;
  }
}

// Send OTP endpoint
app.post('/api/send-otp', async (req, res) => {
  try {
    const { email, whatsapp, name } = req.body;

    console.log('📨 Send OTP request:', { email, whatsapp, name });

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
    console.log(`🔐 Generated OTP for ${email}: ${otp}`);

    // Store OTP
    const key = createKey(email, whatsapp);
    otpStore.set(key, {
      otp,
      email,
      whatsapp,
      expiresAt: Date.now() + OTP_EXPIRY_TIME,
      attempts: 0,
    });

    // Send OTP via WhatsApp
    const whatsappSent = await sendOTPViaWhatsApp({
      whatsapp,
      otp,
      name: name || 'User',
    });

    if (!whatsappSent) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP to WhatsApp. Please check your number and try again.',
      });
    }

    res.json({
      success: true,
      message: 'OTP sent successfully to your WhatsApp',
    });

  } catch (error) {
    console.error('❌ Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while sending OTP. Please try again.',
      error: error.message,
    });
  }
});

// Verify OTP endpoint
app.post('/api/verify-otp', async (req, res) => {
  try {
    const { email, whatsapp, otp } = req.body;

    console.log('🔍 Verify OTP request:', { email, whatsapp, otp });

    // Validate input
    if (!email || !whatsapp || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email, WhatsApp number, and OTP are required',
      });
    }

    const key = createKey(email, whatsapp);
    const otpData = otpStore.get(key);

    // Check if OTP exists
    if (!otpData) {
      return res.status(400).json({
        success: false,
        message: 'OTP not found. Please request a new one.',
      });
    }

    // Check if OTP is expired
    if (Date.now() > otpData.expiresAt) {
      otpStore.delete(key);
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.',
      });
    }

    // Check if max attempts exceeded
    if (otpData.attempts >= MAX_ATTEMPTS) {
      otpStore.delete(key);
      return res.status(400).json({
        success: false,
        message: 'Maximum attempts exceeded. Please request a new OTP.',
      });
    }

    // Increment attempts
    otpData.attempts++;

    // Verify OTP
    if (otpData.otp === otp) {
      otpStore.delete(key); // Clear OTP after successful verification
      console.log(`✅ OTP verified successfully for ${email}`);
      return res.json({
        success: true,
        message: 'OTP verified successfully.',
      });
    }

    // Update attempts
    otpStore.set(key, otpData);

    console.log(`❌ Invalid OTP attempt for ${email}. Attempts: ${otpData.attempts}`);
    res.status(400).json({
      success: false,
      message: `Invalid OTP. ${MAX_ATTEMPTS - otpData.attempts} attempts remaining.`,
    });

  } catch (error) {
    console.error('❌ Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while verifying OTP. Please try again.',
      error: error.message,
    });
  }
});

// Handle OPTIONS requests (CORS preflight) for OTP endpoints
app.options('/api/send-otp', cors());
app.options('/api/verify-otp', cors());

// Cleanup expired OTPs every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of otpStore.entries()) {
    if (now > data.expiresAt) {
      otpStore.delete(key);
      console.log(`🧹 Cleaned up expired OTP for: ${key}`);
    }
  }
}, 5 * 60 * 1000);

app.listen(PORT, () => {
  console.log(`🚀 Proxy server running on port ${PORT}`);
  console.log(`📍 Proxying to: ${GOOGLE_APPS_SCRIPT_URL}`);
  console.log(`🔗 Google Sheets endpoint: http://localhost:${PORT}/api/google-sheets`);
  console.log(`💳 Payment verification endpoint: http://localhost:${PORT}/api/verify-payment`);
  console.log(`📱 OTP endpoints: http://localhost:${PORT}/api/send-otp & /api/verify-otp`);
  console.log(`🔑 Wylto API configured: ${WYLTO_API_KEY ? 'Yes' : 'No'}`);
});
