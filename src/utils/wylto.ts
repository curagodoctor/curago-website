// Wylto API Integration with proper form flags

const WYLTO_WEBHOOK_URL = 'https://server.wylto.com/webhook/k224WX6y6exVpUZAM0';

export interface WyltoFormData {
  name: string;
  phoneNumber: string;
  email: string;
  formType: 'appointment' | 'contact' | 'lead';
  // Optional fields based on form type
  consultant?: string;
  date?: string;
  time?: string;
  message?: string;
  callbackTime?: string;
  service?: string;
  area?: string;
}

/**
 * Submit form data to Wylto with proper flags
 */
export const submitToWylto = async (formData: WyltoFormData): Promise<{ success: boolean; message?: string }> => {
  try {
    // Prepare payload with form flags
    const payload = {
      // Core fields
      name: formData.name,
      phoneNumber: formData.phoneNumber,
      email: formData.email,
      
      // Form identification flag
      formType: formData.formType,
      formSource: 'CuraGo Website',
      submittedAt: new Date().toISOString(),
      
      // Optional fields
      ...(formData.consultant && { consultant: formData.consultant }),
      ...(formData.date && { appointmentDate: formData.date }),
      ...(formData.time && { appointmentTime: formData.time }),
      ...(formData.message && { message: formData.message }),
      ...(formData.callbackTime && { preferredCallbackTime: formData.callbackTime }),
      ...(formData.service && { requestedService: formData.service }),
      ...(formData.area && { area: formData.area }),
      
      // Additional metadata for better tracking
      metadata: {
        userAgent: navigator.userAgent,
        referrer: document.referrer || 'direct',
        currentUrl: window.location.href,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        timestamp: Date.now(),
      }
    };

    console.log('📤 Sending to Wylto:', { formType: formData.formType, name: formData.name });

    const response = await fetch(WYLTO_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Wylto API error: ${response.status} ${response.statusText}`);
    }

    const responseData = await response.json().catch(() => ({}));
    
    console.log('✅ Wylto submission successful:', responseData);
    
    return {
      success: true,
      message: 'Form submitted successfully'
    };
  } catch (error) {
    console.error('❌ Wylto submission error:', error);
    
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to submit form'
    };
  }
};

/**
 * Alternative cURL-style submission (for reference/documentation)
 * This shows what the actual cURL command would look like
 */
export const getCurlCommand = (formData: WyltoFormData): string => {
  const payload = {
    name: formData.name,
    phoneNumber: formData.phoneNumber,
    email: formData.email,
    formType: formData.formType,
    formSource: 'CuraGo Website',
    submittedAt: new Date().toISOString(),
    ...(formData.consultant && { consultant: formData.consultant }),
    ...(formData.date && { appointmentDate: formData.date }),
    ...(formData.time && { appointmentTime: formData.time }),
    ...(formData.message && { message: formData.message }),
    ...(formData.callbackTime && { preferredCallbackTime: formData.callbackTime }),
    ...(formData.service && { requestedService: formData.service }),
    ...(formData.area && { area: formData.area }),
  };

  return `curl -X POST "${WYLTO_WEBHOOK_URL}" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(payload, null, 2)}'`;
};
