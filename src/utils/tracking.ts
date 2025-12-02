// src/utils/tracking.ts
// Tracking utility functions for Google Analytics, Meta Pixel, and GTM

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
    dataLayer?: any[];
    GA_MEASUREMENT_ID?: string; // optional escape hatch
  }
}

/** Ensure dataLayer exists (for SSR safety, guard window) */
if (typeof window !== 'undefined') {
  window.dataLayer = window.dataLayer || [];
}

/** ====== Config (keep in sync with index.html) ====== */
const GA_ID =
  typeof window !== 'undefined'
    ? window.GA_MEASUREMENT_ID || 'G-EFGRF2RMGB'
    : 'G-EFGRF2RMGB';

let lastTrackedPath = '';

/** Small helpers */
const getRefFromUrl = () => {
  if (typeof window === 'undefined') return undefined;
  const u = new URL(window.location.href);
  const ref = u.searchParams.get('ref') || undefined;
  return ref || undefined;
};

const safeCurrency = (c?: string) => (c && c.length <= 4 ? c : 'INR');

/** ========== PAGEVIEW ========== */
/** SPA-friendly virtual pageview for GTM + GA4 + Meta Pixel (now also captures ?ref=) */
export function trackVirtualPage(opts: { title: string; path?: string }) {
  if (typeof window === 'undefined') return;

  const loc = window.location;
  const page_path = opts.path ?? `${loc.pathname}${loc.search}${loc.hash}`;
  const ref = getRefFromUrl();

  // De-duplicate same path
  if (lastTrackedPath === page_path) return;
  lastTrackedPath = page_path;

  // --- GTM ---
  window.dataLayer?.push({
    event: 'virtual_pageview',
    page_title: opts.title,
    page_path,
    page_location: loc.href,
    referrer_code: ref,
  });

  // --- GA4 (route change) ---
  if (typeof window.gtag === 'function') {
    window.gtag('config', GA_ID, {
      page_title: opts.title,
      page_path,
      page_location: loc.href,
      referrer_code: ref,
    });
  }

  // --- Meta Pixel ---
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'PageView'); // standard
    console.log('✅ Meta Pixel: PageView tracked for', page_path);
    // Optional: window.fbq('trackCustom', 'VirtualPageview', { page_path, page_title: opts.title, referrer_code: ref });
  } else {
    console.warn('❌ Meta Pixel: fbq function not available for PageView tracking');
  }
}

/** Backwards-compat wrapper your app already calls */
export const trackPageView = (pageName: string, pageTitle?: string) => {
  if (typeof window === 'undefined') return;
  trackVirtualPage({ title: pageTitle || pageName });
  console.log(`✅ Tracking: Page view for ${pageName}`);
};

/** Record the initial referral (call once on app mount or layout) */
export const trackReferralInit = () => {
  if (typeof window === 'undefined') return;
  const ref = getRefFromUrl();
  if (!ref) return;
  window.dataLayer?.push({ event: 'referral_init', referrer_code: ref });
  window.gtag?.('event', 'referral_init', { referrer_code: ref });
  window.fbq?.('trackCustom', 'ReferralInit', { referrer_code: ref });
  console.log(`✅ Tracking: Referral init (${ref})`);
};

/** ========== FORMS ========== */
/** Track form submission events across all platforms (+ optional referral payload) */
export const trackFormSubmission = (
  formType: 'contact' | 'appointment' | 'lead',
  formData?: { name?: string; email?: string; phone?: string; [k: string]: any },
  referral?: { code?: string; link?: string }
) => {
  const refParam = getRefFromUrl();

  // GA4
  window.gtag?.('event', 'generate_lead', {
    event_category: 'Form',
    event_label: formType,
    form_type: formType,
    value: formType === 'appointment' ? 1200 : 0,
    currency: 'INR',
    referral_code: referral?.code || refParam,
    referral_link: referral?.link,
  });

  // Meta Pixel
  if (window.fbq) {
    console.log('✅ Meta Pixel: Processing form submission', formType);
    
    if (formType === 'appointment') {
      window.fbq('track', 'Schedule');
      console.log('✅ Meta Pixel: Schedule event sent');
      
      window.fbq('track', 'Lead', {
        content_name: 'Appointment Booking',
        content_category: 'Mental Healthcare',
        value: 1200,
        currency: 'INR',
        referral_code: referral?.code || refParam,
      });
      console.log('✅ Meta Pixel: Lead event sent (appointment)');
      
      window.fbq('trackCustom', 'AppointmentBooked', {
        consultant: formData?.consultant || 'Not selected',
        date: formData?.date || 'Not selected',
        referral_code: referral?.code || refParam,
      });
      console.log('✅ Meta Pixel: AppointmentBooked custom event sent');
      
    } else if (formType === 'contact') {
      window.fbq('track', 'Contact', { method: 'form', referral_code: referral?.code || refParam });
      console.log('✅ Meta Pixel: Contact event sent');
      
      window.fbq('track', 'Lead', {
        content_name: 'Contact Form',
        content_category: 'Mental Healthcare',
        referral_code: referral?.code || refParam,
      });
      console.log('✅ Meta Pixel: Lead event sent (contact)');
      
      window.fbq('trackCustom', 'CallbackRequested', {
        callback_time: (formData as any)?.callbackTime || 'Not specified',
        referral_code: referral?.code || refParam,
      });
      console.log('✅ Meta Pixel: CallbackRequested custom event sent');
      
    } else {
      window.fbq('track', 'Lead', {
        content_name: 'Lead Form',
        content_category: 'Mental Healthcare',
        referral_code: referral?.code || refParam,
      });
      console.log('✅ Meta Pixel: Lead event sent (general)');
      
      window.fbq('trackCustom', 'LeadFormSubmitted', {
        service: (formData as any)?.service || 'Not specified',
        referral_code: referral?.code || refParam,
      });
      console.log('✅ Meta Pixel: LeadFormSubmitted custom event sent');
    }
  } else {
    console.warn('❌ Meta Pixel: fbq function not available for form tracking');
  }

  // GTM
  window.dataLayer?.push({
    event: 'form_submission',
    formType,
    formName:
      formType === 'appointment'
        ? 'Appointment Booking'
        : formType === 'contact'
        ? 'Contact Form'
        : 'Lead Form',
    formValue: formType === 'appointment' ? 1200 : 0,
    referralCode: referral?.code || refParam,
    referralLink: referral?.link,
    formData: {
      hasName: !!formData?.name,
      hasEmail: !!formData?.email,
      hasPhone: !!formData?.phone,
    },
    ecommerce: {
      value: formType === 'appointment' ? 1200 : 0,
      currency: 'INR',
      items: [
        {
          item_name:
            formType === 'appointment'
              ? 'Mental Health Consultation'
              : 'Contact Request',
          item_category: 'Healthcare',
          item_variant: formType,
          price: formType === 'appointment' ? 1200 : 0,
          quantity: 1,
        },
      ],
    },
  });

  console.log(`✅ Tracking: ${formType} form submitted (ref=${referral?.code || refParam || '—'})`);
};

/** ========== BUTTONS / CTAs ========== */
/** Generic CTA */
export const trackCTA = (ctaName: string, source?: string, extras?: Record<string, any>) => {
  // GA4
  window.gtag?.('event', 'select_content', {
    content_type: 'cta',
    item_id: ctaName,
    source,
    ...extras,
  });

  // Meta Pixel
  if (window.fbq) {
    window.fbq('trackCustom', 'CTA_Click', {
      cta_name: ctaName,
      source,
      ...extras,
    });
    console.log('✅ Meta Pixel: CTA_Click event sent -', ctaName, 'from', source);
  } else {
    console.warn('❌ Meta Pixel: fbq not available for CTA tracking');
  }

  // GTM
  window.dataLayer?.push({
    event: 'cta_click',
    ctaName,
    source,
    ...extras,
  });
  
  console.log('✅ Tracking: CTA click -', ctaName, 'from', source);
};

/** Convenience wrappers for your common buttons */
export const trackOpenContactCTA = () => trackCTA('Book Free Clarity Call', 'results_section');
export const trackChatWhatsAppCTA = () =>
  trackCTA('Chat Now on WhatsApp', 'results_section', { method: 'whatsapp' });
export const trackTeamCTA = () => trackCTA('Our Mental Health Team', 'results_section');
export const trackBookConsultationCTA = () =>
  trackCTA('Book Consultation Now', 'results_section');

/** Existing generic click helpers */
export const trackButtonClick = (buttonName: string, buttonType?: string, source?: string) => {
  // GA4
  window.gtag?.('event', 'click', {
    event_category: 'Button',
    event_label: buttonName,
    button_type: buttonType,
    click_source: source,
  });

  // Meta Pixel
  if (window.fbq) {
    window.fbq('trackCustom', 'ButtonClick', {
      button_name: buttonName,
      button_type: buttonType,
      source,
    });
    console.log('✅ Meta Pixel: ButtonClick event sent -', buttonName, buttonType, 'from', source);
  } else {
    console.warn('❌ Meta Pixel: fbq not available for button tracking');
  }

  // GTM
  window.dataLayer?.push({
    event: 'button_click',
    buttonName,
    buttonType,
    clickSource: source,
  });
  
  console.log('✅ Tracking: Button click -', buttonName, buttonType, 'from', source);
};

/** WhatsApp (direct contact to team) */
export const trackWhatsAppClick = (source: string) => {
  window.gtag?.('event', 'contact_whatsapp', {
    event_category: 'Engagement',
    event_label: source,
    method: 'whatsapp',
  });

  if (window.fbq) {
    window.fbq('track', 'Contact', { method: 'whatsapp', source });
    window.fbq('trackCustom', 'WhatsAppClick', { source });
    console.log('✅ Meta Pixel: WhatsApp Contact + WhatsAppClick events sent from', source);
  } else {
    console.warn('❌ Meta Pixel: fbq not available for WhatsApp tracking');
  }

  window.dataLayer?.push({
    event: 'contact_method_click',
    contactMethod: 'whatsapp',
    source,
  });

  console.log(`✅ Tracking: WhatsApp clicked from ${source}`);
};

/** Phone call click */
export const trackPhoneClick = (source: string) => {
  window.gtag?.('event', 'contact_phone', {
    event_category: 'Engagement',
    event_label: source,
    method: 'phone',
  });

  window.fbq?.('track', 'Contact', { method: 'phone', source });
  window.fbq?.('trackCustom', 'PhoneClick', { source });

  window.dataLayer?.push({
    event: 'contact_method_click',
    contactMethod: 'phone',
    source,
  });

  console.log(`✅ Tracking: Phone clicked from ${source}`);
};

/** Section view */
export const trackSectionView = (sectionName: string) => {
  // GA4
  window.gtag?.('event', 'section_view', {
    event_category: 'Engagement',
    event_label: sectionName,
  });

  // Meta Pixel
  if (window.fbq) {
    window.fbq('trackCustom', 'SectionView', {
      section_name: sectionName,
      timestamp: new Date().toISOString(),
    });
    console.log('✅ Meta Pixel: SectionView event sent -', sectionName);
  } else {
    console.warn('❌ Meta Pixel: fbq not available for section view tracking');
  }

  // GTM
  window.dataLayer?.push({
    event: 'section_view',
    sectionName,
  });
  
  console.log('✅ Tracking: Section view -', sectionName);
};

/** Conversion */
export const trackConversion = (
  value: number,
  currency: string = 'INR',
  transactionId?: string,
  referral?: { code?: string; link?: string }
) => {
  const refParam = getRefFromUrl();

  window.gtag?.('event', 'purchase', {
    value,
    currency: safeCurrency(currency),
    transaction_id: transactionId,
    referral_code: referral?.code || refParam,
    referral_link: referral?.link,
  });

  window.fbq?.('track', 'Purchase', { value, currency: safeCurrency(currency), referral_code: referral?.code || refParam });

  window.dataLayer?.push({
    event: 'conversion',
    conversionValue: value,
    currency: safeCurrency(currency),
    transactionId,
    referralCode: referral?.code || refParam,
    referralLink: referral?.link,
  });

  console.log(`✅ Tracking: Conversion of ${currency} ${value} (ref=${referral?.code || refParam || '—'})`);
};

/** ========== REFERRAL / SHARE ========== */
/** Share on WhatsApp (public share with referral link) */
export const trackReferralShare = (opts: {
  source?: string; // e.g., 'results_share_block'
  referralCode?: string;
  referralLink?: string;
}) => {
  const refParam = getRefFromUrl();

  // GA4 "share" event
  window.gtag?.('event', 'share', {
    method: 'whatsapp',
    content_type: 'referral',
    item_id: opts.referralCode || refParam,
    referral_link: opts.referralLink,
    source: opts.source,
  });

  // Meta Pixel
  window.fbq?.('trackCustom', 'ReferralShare', {
    method: 'whatsapp',
    referral_code: opts.referralCode || refParam,
    referral_link: opts.referralLink,
    source: opts.source,
  });

  // GTM
  window.dataLayer?.push({
    event: 'referral_share',
    method: 'whatsapp',
    referralCode: opts.referralCode || refParam,
    referralLink: opts.referralLink,
    source: opts.source,
  });

  console.log(`✅ Tracking: Referral share (code=${opts.referralCode || refParam || '—'})`);
};

/** Copy referral message/link */
export const trackReferralCopy = (opts: {
  source?: string;
  referralCode?: string;
  referralLink?: string;
}) => {
  const refParam = getRefFromUrl();

  window.gtag?.('event', 'copy', {
    content_type: 'referral',
    item_id: opts.referralCode || refParam,
    referral_link: opts.referralLink,
    source: opts.source,
  });

  window.fbq?.('trackCustom', 'ReferralCopy', {
    referral_code: opts.referralCode || refParam,
    referral_link: opts.referralLink,
    source: opts.source,
  });

  window.dataLayer?.push({
    event: 'referral_copy',
    referralCode: opts.referralCode || refParam,
    referralLink: opts.referralLink,
    source: opts.source,
  });

  console.log(`✅ Tracking: Referral copy (code=${opts.referralCode || refParam || '—'})`);
};

/** Ops/automation DM to the user with prepared WhatsApp text (direct, not share) */
export const trackPreparedWhatsAppDM = (opts: {
  toPhoneE164?: string; // e.g., +91900...
  source?: string; // e.g., 'webhook_auto'
}) => {
  window.gtag?.('event', 'message_send', {
    method: 'whatsapp',
    to: opts.toPhoneE164,
    source: opts.source,
  });

  window.fbq?.('trackCustom', 'WhatsAppDM', {
    to: opts.toPhoneE164,
    source: opts.source,
  });

  window.dataLayer?.push({
    event: 'whatsapp_dm',
    to: opts.toPhoneE164,
    source: opts.source,
  });

  console.log(`✅ Tracking: WhatsApp DM (to=${opts.toPhoneE164 || 'unknown'})`);
};

/** ========== DEBUGGING / TESTING ========== */
/** Test Meta Pixel functionality - call this from browser console */
export const testMetaPixel = () => {
  console.log('🧪 Testing Meta Pixel functionality...');
  
  if (typeof window.fbq === 'function') {
    console.log('✅ Meta Pixel fbq function is available');
    
    try {
      // Test standard events
      window.fbq('track', 'ViewContent', { content_type: 'test', content_name: 'Meta Pixel Test' });
      console.log('✅ Meta Pixel: ViewContent test event sent');
      
      // Test custom event
      window.fbq('trackCustom', 'TestEvent', { test_parameter: 'test_value', timestamp: new Date().toISOString() });
      console.log('✅ Meta Pixel: TestEvent custom event sent');
      
      // Test with parameters
      window.fbq('track', 'Lead', { content_name: 'Test Lead', value: 100, currency: 'INR' });
      console.log('✅ Meta Pixel: Lead test event sent');
      
      // Test common conversion events
      window.fbq('track', 'Contact', { content_name: 'Test Contact' });
      console.log('✅ Meta Pixel: Contact test event sent');
      
      console.log('🎉 Meta Pixel test completed. Check Facebook Events Manager for events.');
      console.log('💡 Tip: Open Facebook Events Manager > Test Events to see real-time data');
      console.log('💡 Debug URL: https://www.facebook.com/events_manager2/list/pixel/833058805840230/');
      
    } catch (error) {
      console.error('❌ Error sending Meta Pixel test events:', error);
      return false;
    }
    
    return true;
  } else {
    console.error('❌ Meta Pixel fbq function is NOT available');
    console.log('🔍 Checking if Meta Pixel script loaded...');
    console.log('window._fbq:', typeof window._fbq);
    console.log('Meta Pixel queue:', window.fbq?.queue);
    
    // Check for common issues
    console.log('🔍 Common issues to check:');
    console.log('1. Ad blockers blocking Facebook scripts');
    console.log('2. Pixel ID 833058805840230 - verify this is correct');
    console.log('3. Facebook domain restrictions');
    console.log('4. Browser privacy settings blocking trackers');
    
    return false;
  }
};

/** Diagnostic function to check all tracking systems */
export const runTrackingDiagnostic = () => {
  console.log('🔧 Running complete tracking diagnostic...');
  
  const results = {
    metaPixel: false,
    gtm: false,
    ga4: false,
    issues: []
  };
  
  // Meta Pixel Check
  if (typeof window.fbq === 'function') {
    results.metaPixel = true;
    console.log('✅ Meta Pixel: Available');
  } else {
    results.issues.push('Meta Pixel fbq function not available');
    console.log('❌ Meta Pixel: Not available');
  }
  
  // GTM Check
  if (window.dataLayer) {
    results.gtm = true;
    console.log('✅ GTM: DataLayer available');
  } else {
    results.issues.push('GTM dataLayer not available');
    console.log('❌ GTM: DataLayer not available');
  }
  
  // GA4 Check  
  if (typeof window.gtag === 'function') {
    results.ga4 = true;
    console.log('✅ GA4: gtag function available');
  } else {
    results.issues.push('GA4 gtag function not available');
    console.log('❌ GA4: gtag function not available');
  }
  
  // Environment checks
  console.log('🌍 Environment info:');
  console.log('- Hostname:', window.location.hostname);
  console.log('- Protocol:', window.location.protocol);
  console.log('- User agent:', navigator.userAgent);
  console.log('- Do not track:', navigator.doNotTrack);
  
  if (results.issues.length > 0) {
    console.log('⚠️ Issues found:', results.issues);
  } else {
    console.log('🎉 All tracking systems appear to be working');
  }
  
  return results;
};

/** Comprehensive event tracking summary */
export const getTrackingEventSummary = () => {
  console.log('📊 CuraGo Tracking Event Summary:');
  console.log('');
  
  console.log('🔄 Page Views (GTM + GA4 + Meta):');
  console.log('  - virtual_pageview → PageView (Meta)');
  console.log('  - All SPA routes tracked');
  console.log('');
  
  console.log('📝 Form Events (GTM + GA4 + Meta):');
  console.log('  - form_submission (GTM) → generate_lead (GA4) → Lead/Schedule/Contact (Meta)');
  console.log('  - Custom events: AppointmentBooked, CallbackRequested, LeadFormSubmitted');
  console.log('');
  
  console.log('🎯 CTA Events (GTM + GA4 + Meta):');
  console.log('  - cta_click (GTM) → select_content (GA4) → CTA_Click (Meta)');
  console.log('  - button_click (GTM) → click (GA4) → ButtonClick (Meta)');
  console.log('');
  
  console.log('📞 Contact Events (GTM + GA4 + Meta):');
  console.log('  - contact_method_click (GTM) → contact_whatsapp/phone (GA4) → WhatsAppClick/PhoneClick (Meta)');
  console.log('');
  
  console.log('👁️ Engagement Events (GTM + GA4 + Meta):');
  console.log('  - section_view (GTM) → section_view (GA4) → SectionView (Meta)');
  console.log('');
  
  console.log('🧠 Assessment Events (GTM + Meta):');
  console.log('  - aura_results_* (GTM) → AURA_* (Meta)');
  console.log('  - atm_results_* (GTM) → ATM_* (Meta)');
  console.log('');
  
  console.log('🔗 Referral Events (GTM + GA4 + Meta):');
  console.log('  - referral_init, referral_share, referral_copy');
  console.log('  - All tracked across platforms');
  console.log('');
  
  console.log('💰 Conversion Events (GTM + GA4 + Meta):');
  console.log('  - conversion (GTM) → purchase (GA4) → Purchase (Meta)');
  console.log('');
  
  console.log('✅ All events now have GTM + Meta Pixel coverage!');
};

// Auto-run test and summary on development
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  setTimeout(() => {
    console.log('🔧 Development mode detected - running diagnostics...');
    setTimeout(() => {
      testMetaPixel();
      getTrackingEventSummary();
    }, 3000);
  }, 1000);
}
