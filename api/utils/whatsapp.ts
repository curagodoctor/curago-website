// WhatsApp Utility Functions
// Wylto WhatsApp API integration for OTP sending

type SendOTPParams = {
  whatsapp: string;
  otp: string;
  name: string;
};

// Wylto WhatsApp API Configuration
const WYLTO_API_URL = process.env.WYLTO_API_URL || 'https://server.wylto.com/api/v1/wa/send';
const WYLTO_API_KEY = process.env.WYLTO_API_KEY || '';

/**
 * Send OTP via Wylto WhatsApp API using official OTP template
 * Uses Wylto's otp_template with AUTHENTICATION category
 */
export async function sendOTPViaWhatsApp({ whatsapp, otp, name }: SendOTPParams): Promise<boolean> {
  try {
    if (!WYLTO_API_KEY) {
      console.error('Wylto API key not configured');
      throw new Error('Wylto API not configured');
    }

    // Format phone number: 91XXXXXXXXXX (no + sign)
    const phoneNumber = whatsapp.replace(/^(\+91)?/, '');
    const fullNumber = `91${phoneNumber}`;

    // Wylto OTP template request
    // Template: otp_template (AUTHENTICATION category)
    // Body parameters: 4 instances of the OTP code
    // Button: URL button with OTP code
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
              {
                type: 'text',
                text: otp
              },
              {
                type: 'text',
                text: otp
              },
              {
                type: 'text',
                text: otp
              },
              {
                type: 'text',
                text: otp
              }
            ],
            buttons: [
              {
                type: 'url',
                payload: otp
              }
            ],
            category: 'AUTHENTICATION'
          }
        }
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`WhatsApp OTP sent successfully to ${fullNumber}`, data);
      return true;
    } else {
      console.error('Wylto API error:', data);
      return false;
    }
  } catch (error) {
    console.error('Error sending WhatsApp OTP:', error);
    return false;
  }
}
