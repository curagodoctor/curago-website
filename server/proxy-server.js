// Simple Express Proxy Server for Google Apps Script
// This runs on your Hostinger VPS to bypass CORS issues

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Your Google Apps Script Web App URL
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzm96I8BCUDFBeCWbGHYqLzbeHQ-KetMDXb7Mpku7BOqrtJ8jRJAa94uw83DPFee6fK/exec';

// Enable CORS for all origins (you can restrict this to your domain)
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Proxy server is running' });
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
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();

    console.log('✅ Response from Google Apps Script:', {
      status: response.status,
      success: data.success
    });

    // Return the response with CORS headers (already handled by cors middleware)
    res.status(response.ok ? 200 : 500).json(data);

  } catch (error) {
    console.error('❌ Proxy error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Unknown error'
    });
  }
});

// Handle OPTIONS requests (CORS preflight)
app.options('/api/google-sheets', cors());

app.listen(PORT, () => {
  console.log(`🚀 Proxy server running on port ${PORT}`);
  console.log(`📍 Proxying to: ${GOOGLE_APPS_SCRIPT_URL}`);
  console.log(`🔗 Endpoint: http://localhost:${PORT}/api/google-sheets`);
});
