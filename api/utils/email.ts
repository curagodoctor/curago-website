// Email Utility Functions
// Uses Google Apps Script to send emails (same as payment confirmations)

type SendEmailParams = {
  to: string;
  otp: string;
  name: string;
  whatsapp: string;
};

const GOOGLE_APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL || '';

/**
 * Send OTP via WhatsApp using Google Apps Script
 * Email parameter is still required for user identification but OTP is only sent via WhatsApp
 * This uses the same Google Apps Script that sends payment confirmation emails
 */
export async function sendOTPViaGoogleScript({ to, otp, name, whatsapp }: SendEmailParams): Promise<{ emailSent: boolean; whatsappSent: boolean }> {
  try {
    if (!GOOGLE_APPS_SCRIPT_URL) {
      throw new Error('GOOGLE_APPS_SCRIPT_URL not configured');
    }

    // Call Google Apps Script
    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'send_otp',
        email: to,
        whatsapp: whatsapp,
        otp: otp,
        name: name,
      }),
    });

    const data = await response.json();

    if (data.success) {
      console.log(`OTP sent successfully - WhatsApp: ${data.whatsappSent}`);
      return {
        emailSent: data.emailSent || false,
        whatsappSent: data.whatsappSent || false,
      };
    } else {
      throw new Error(data.message || 'Failed to send OTP via WhatsApp');
    }
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw new Error('Failed to send OTP');
  }
}

// Note: WhatsApp sending is now handled by Google Apps Script
// See docs/GOOGLE-APPS-SCRIPT-OTP.js for implementation
