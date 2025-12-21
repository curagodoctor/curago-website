// Simple Express Proxy Server for Google Apps Script
// This runs on your Hostinger VPS to bypass CORS issues

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Your Google Apps Script Web App URL
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwAlttxxgXZTAe7DrnTzoEoXoqAQbvLemRpCEhvE_EIhrXr2xc7SLZ6MTE0pXkWPSDs/exec';

// Razorpay credentials from environment variables
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

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

app.listen(PORT, () => {
  console.log(`🚀 Proxy server running on port ${PORT}`);
  console.log(`📍 Proxying to: ${GOOGLE_APPS_SCRIPT_URL}`);
  console.log(`🔗 Google Sheets endpoint: http://localhost:${PORT}/api/google-sheets`);
  console.log(`💳 Payment verification endpoint: http://localhost:${PORT}/api/verify-payment`);
});
