// OTP Utility Functions
// In-memory storage for OTPs (for production, use Redis or a database)

interface OTPData {
  otp: string;
  email: string;
  whatsapp: string;
  expiresAt: number;
  attempts: number;
}

// In-memory storage (will be cleared on server restart)
const otpStore = new Map<string, OTPData>();

// Constants
const OTP_EXPIRY_TIME = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 3;
const OTP_LENGTH = 6;

/**
 * Generate a random 6-digit OTP
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Create a unique key for OTP storage
 */
function createKey(email: string, whatsapp: string): string {
  return `${email}-${whatsapp}`;
}

/**
 * Store OTP with expiration time
 */
export function storeOTP(email: string, whatsapp: string, otp: string): void {
  const key = createKey(email, whatsapp);
  const expiresAt = Date.now() + OTP_EXPIRY_TIME;

  otpStore.set(key, {
    otp,
    email,
    whatsapp,
    expiresAt,
    attempts: 0,
  });
}

/**
 * Verify OTP
 * Returns { valid: boolean, message: string }
 */
export function verifyOTP(
  email: string,
  whatsapp: string,
  inputOtp: string
): { valid: boolean; message: string } {
  const key = createKey(email, whatsapp);
  const otpData = otpStore.get(key);

  // Check if OTP exists
  if (!otpData) {
    return {
      valid: false,
      message: 'OTP not found. Please request a new one.',
    };
  }

  // Check if OTP is expired
  if (Date.now() > otpData.expiresAt) {
    otpStore.delete(key);
    return {
      valid: false,
      message: 'OTP has expired. Please request a new one.',
    };
  }

  // Check if max attempts exceeded
  if (otpData.attempts >= MAX_ATTEMPTS) {
    otpStore.delete(key);
    return {
      valid: false,
      message: 'Maximum attempts exceeded. Please request a new OTP.',
    };
  }

  // Increment attempts
  otpData.attempts++;

  // Verify OTP
  if (otpData.otp === inputOtp) {
    otpStore.delete(key); // Clear OTP after successful verification
    return {
      valid: true,
      message: 'OTP verified successfully.',
    };
  }

  // Update attempts
  otpStore.set(key, otpData);

  return {
    valid: false,
    message: `Invalid OTP. ${MAX_ATTEMPTS - otpData.attempts} attempts remaining.`,
  };
}

/**
 * Clean up expired OTPs (run periodically)
 */
export function cleanupExpiredOTPs(): void {
  const now = Date.now();
  for (const [key, data] of otpStore.entries()) {
    if (now > data.expiresAt) {
      otpStore.delete(key);
    }
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupExpiredOTPs, 5 * 60 * 1000);
