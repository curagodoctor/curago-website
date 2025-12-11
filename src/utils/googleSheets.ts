// Google Sheets API Helper
// Sends assessment results to Google Apps Script Web App

// ============================================================
// CONFIGURATION
// ============================================================
// Your Google Apps Script Web App URL
const DIRECT_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzm96I8BCUDFBeCWbGHYqLzbeHQ-KetMDXb7Mpku7BOqrtJ8jRJAa94uw83DPFee6fK/exec';

// In development (localhost), use Vite proxy to bypass CORS
// In production, use direct URL (CORS is handled by Apps Script deployment)
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const GOOGLE_APPS_SCRIPT_URL = isDevelopment ? '/api/google-sheets' : DIRECT_SCRIPT_URL;

console.log('📊 Google Sheets API:', {
  environment: isDevelopment ? 'Development' : 'Production',
  endpoint: GOOGLE_APPS_SCRIPT_URL,
  mode: isDevelopment ? 'Vite Proxy' : 'Direct'
});

interface AuraResultData {
  testType: 'aura_index';
  name: string;
  email: string;
  phoneNumber: string;
  scores: {
    overall: number;
    awareness: number;
    understanding: number;
    regulation: number;
    alignment: number;
  };
  label: string;
  strengths: string[];
  growth: string[];
  riskFlags: string[];
  eventId: string;
}

interface AtmResultData {
  testType: 'atm_tool';
  name: string;
  email: string;
  phoneNumber: string;
  pattern: string;
  confidence: number;
  explanation: string;
  neurological: string;
  impact: string[];
  microActionTitle: string;
  microActionDescription: string;
  eventId: string;
}

/**
 * Send AURA assessment results to Google Sheets and trigger email
 */
export async function sendAuraResultsToGoogleSheets(data: AuraResultData): Promise<boolean> {
  console.log('📤 Sending AURA results to Google Sheets...', {
    name: data.name,
    email: data.email,
    testType: data.testType
  });

  try {
    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      redirect: 'follow', // Follow redirects from Google Apps Script
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ HTTP error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      console.log('✅ AURA results sent to Google Sheets and email sent');
      return true;
    } else {
      console.error('❌ Google Sheets API error:', result.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Failed to send AURA results to Google Sheets:', error);
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.error('💡 This is likely a CORS error. Check:');
      console.error('   1. Apps Script deployment "Who has access" is set to "Anyone"');
      console.error('   2. You are using the latest deployment URL');
      console.error('   3. The doOptions function is handling preflight requests');
    }
    return false;
  }
}

/**
 * Send ATM assessment results to Google Sheets and trigger email
 */
export async function sendAtmResultsToGoogleSheets(data: AtmResultData): Promise<boolean> {
  console.log('📤 Sending ATM results to Google Sheets...', {
    name: data.name,
    email: data.email,
    testType: data.testType
  });

  try {
    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      redirect: 'follow', // Follow redirects from Google Apps Script
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ HTTP error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      console.log('✅ ATM results sent to Google Sheets and email sent');
      return true;
    } else {
      console.error('❌ Google Sheets API error:', result.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Failed to send ATM results to Google Sheets:', error);
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.error('💡 This is likely a CORS error. Check:');
      console.error('   1. Apps Script deployment "Who has access" is set to "Anyone"');
      console.error('   2. You are using the latest deployment URL');
      console.error('   3. The doOptions function is handling preflight requests');
    }
    return false;
  }
}
