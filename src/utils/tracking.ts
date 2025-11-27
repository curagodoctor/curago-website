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
    // Optional: window.fbq('trackCustom', 'VirtualPageview', { page_path, page_title: opts.title, referrer_code: ref });
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
    if (formType === 'appointment') {
      window.fbq('track', 'Schedule');
      window.fbq('track', 'Lead', {
        content_name: 'Appointment Booking',
        content_category: 'Mental Healthcare',
        value: 1200,
        currency: 'INR',
        referral_code: referral?.code || refParam,
      });
      window.fbq('trackCustom', 'AppointmentBooked', {
        consultant: formData?.consultant || 'Not selected',
        date: formData?.date || 'Not selected',
        referral_code: referral?.code || refParam,
      });
    } else if (formType === 'contact') {
      window.fbq('track', 'Contact', { method: 'form', referral_code: referral?.code || refParam });
      window.fbq('track', 'Lead', {
        content_name: 'Contact Form',
        content_category: 'Mental Healthcare',
        referral_code: referral?.code || refParam,
      });
      window.fbq('trackCustom', 'CallbackRequested', {
        callback_time: (formData as any)?.callbackTime || 'Not specified',
        referral_code: referral?.code || refParam,
      });
    } else {
      window.fbq('track', 'Lead', {
        content_name: 'Lead Form',
        content_category: 'Mental Healthcare',
        referral_code: referral?.code || refParam,
      });
      window.fbq('trackCustom', 'LeadFormSubmitted', {
        service: (formData as any)?.service || 'Not specified',
        referral_code: referral?.code || refParam,
      });
    }
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
  window.gtag?.('event', 'select_content', {
    content_type: 'cta',
    item_id: ctaName,
    source,
    ...extras,
  });

  window.fbq?.('trackCustom', 'CTA_Click', {
    cta_name: ctaName,
    source,
    ...extras,
  });

  window.dataLayer?.push({
    event: 'cta_click',
    ctaName,
    source,
    ...extras,
  });
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
  window.gtag?.('event', 'click', {
    event_category: 'Button',
    event_label: buttonName,
    button_type: buttonType,
    click_source: source,
  });

  window.fbq?.('trackCustom', 'ButtonClick', {
    button_name: buttonName,
    button_type: buttonType,
    source,
  });

  window.dataLayer?.push({
    event: 'button_click',
    buttonName,
    buttonType,
    clickSource: source,
  });
};

/** WhatsApp (direct contact to team) */
export const trackWhatsAppClick = (source: string) => {
  window.gtag?.('event', 'contact_whatsapp', {
    event_category: 'Engagement',
    event_label: source,
    method: 'whatsapp',
  });

  window.fbq?.('track', 'Contact', { method: 'whatsapp', source });
  window.fbq?.('trackCustom', 'WhatsAppClick', { source });

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
  window.gtag?.('event', 'section_view', {
    event_category: 'Engagement',
    event_label: sectionName,
  });

  window.dataLayer?.push({
    event: 'section_view',
    sectionName,
  });
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
