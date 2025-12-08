// src/utils/tracking.ts
// Tracking utility functions for Google Analytics and GTM

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
    GA_MEASUREMENT_ID?: string; // optional escape hatch
  }
}

/** Ensure dataLayer exists (for SSR safety, guard window) */
if (typeof window !== 'undefined') {
  window.dataLayer = window.dataLayer || [];
}

/** ====== Config - All tracking handled via GTM server-side ====== */
// REMOVED: Hardcoded GA4 ID to prevent direct Google Analytics calls
// All tracking is now exclusively managed through GTM Web Container (GTM-PL6KV3ND)
// which routes to custom server (gtm.curago.in) for server-side tracking

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
/** SPA-friendly virtual pageview for GTM + GA4 (now also captures ?ref=) */
export function trackVirtualPage(opts: { title: string; path?: string }) {
  if (typeof window === 'undefined') return;

  const loc = window.location;
  const page_path = opts.path ?? `${loc.pathname}${loc.search}${loc.hash}`;
  const ref = getRefFromUrl();

  // De-duplicate same path
  if (lastTrackedPath === page_path) return;
  lastTrackedPath = page_path;

  // --- GTM (handles both GTM and GA4 via server) ---
  window.dataLayer?.push({
    event: 'virtual_pageview',
    page_title: opts.title,
    page_path,
    page_location: loc.href,
    referrer_code: ref,
  });
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

  // GTM (will handle GA4 via server-side routing)
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
    value: formType === 'appointment' ? 1200 : 0,
    currency: 'INR',
    referralCode: referral?.code || refParam,
    referralLink: referral?.link,
    referral_code: referral?.code || refParam,
    referral_link: referral?.link,
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
  // GTM (will handle GA4 via server-side routing)
  window.dataLayer?.push({
    event: 'cta_click',
    ctaName,
    source,
    content_type: 'cta',
    item_id: ctaName,
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
  // GTM (will handle GA4 via server-side routing)
  window.dataLayer?.push({
    event: 'button_click',
    buttonName,
    buttonType,
    clickSource: source,
    event_category: 'Button',
    event_label: buttonName,
    button_type: buttonType,
    click_source: source,
  });

  console.log('✅ Tracking: Button click -', buttonName, buttonType, 'from', source);
};

/** WhatsApp (direct contact to team) */
export const trackWhatsAppClick = (source: string) => {
  window.dataLayer?.push({
    event: 'contact_method_click',
    contactMethod: 'whatsapp',
    source,
    event_category: 'Engagement',
    event_label: source,
    method: 'whatsapp',
  });

  console.log(`✅ Tracking: WhatsApp clicked from ${source}`);
};

/** Phone call click */
export const trackPhoneClick = (source: string) => {
  window.dataLayer?.push({
    event: 'contact_method_click',
    contactMethod: 'phone',
    source,
    event_category: 'Engagement',
    event_label: source,
    method: 'phone',
  });

  console.log(`✅ Tracking: Phone clicked from ${source}`);
};

/** Section view */
export const trackSectionView = (sectionName: string) => {
  // GTM (will handle GA4 via server-side routing)
  window.dataLayer?.push({
    event: 'section_view',
    sectionName,
    event_category: 'Engagement',
    event_label: sectionName,
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

  window.dataLayer?.push({
    event: 'conversion',
    conversionValue: value,
    value,
    currency: safeCurrency(currency),
    transactionId,
    transaction_id: transactionId,
    referralCode: referral?.code || refParam,
    referralLink: referral?.link,
    referral_code: referral?.code || refParam,
    referral_link: referral?.link,
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

  // GTM (will handle GA4 via server-side routing)
  window.dataLayer?.push({
    event: 'referral_share',
    method: 'whatsapp',
    content_type: 'referral',
    item_id: opts.referralCode || refParam,
    referralCode: opts.referralCode || refParam,
    referralLink: opts.referralLink,
    referral_link: opts.referralLink,
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

  window.dataLayer?.push({
    event: 'referral_copy',
    content_type: 'referral',
    item_id: opts.referralCode || refParam,
    referralCode: opts.referralCode || refParam,
    referralLink: opts.referralLink,
    referral_link: opts.referralLink,
    source: opts.source,
  });

  console.log(`✅ Tracking: Referral copy (code=${opts.referralCode || refParam || '—'})`);
};

/** Ops/automation DM to the user with prepared WhatsApp text (direct, not share) */
export const trackPreparedWhatsAppDM = (opts: {
  toPhoneE164?: string; // e.g., +91900...
  source?: string; // e.g., 'webhook_auto'
}) => {
  window.dataLayer?.push({
    event: 'whatsapp_dm',
    method: 'whatsapp',
    to: opts.toPhoneE164,
    source: opts.source,
  });

  console.log(`✅ Tracking: WhatsApp DM (to=${opts.toPhoneE164 || 'unknown'})`);
};

/** ========== DEBUGGING / TESTING ========== */

/** Diagnostic function to check all tracking systems */
export const runTrackingDiagnostic = () => {
  console.log('🔧 Running complete tracking diagnostic...');

  const results = {
    gtm: false,
    serverRouting: false,
    issues: [] as string[]
  };

  // GTM Check
  if (window.dataLayer) {
    results.gtm = true;
    console.log('✅ GTM: DataLayer available');

    // Check server routing
    const firstItem = window.dataLayer[0];
    if (firstItem && firstItem.server) {
      results.serverRouting = true;
      console.log('✅ Server Routing: Active (' + firstItem.server + ')');
    } else {
      results.issues.push('Server routing not configured');
      console.log('❌ Server Routing: Not configured');
    }
  } else {
    results.issues.push('GTM dataLayer not available');
    console.log('❌ GTM: DataLayer not available');
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

  console.log('🔄 Page Views (GTM → Server → GA4/CAPI):');
  console.log('  - virtual_pageview event');
  console.log('  - All SPA routes tracked');
  console.log('');

  console.log('📝 Form Events (GTM → Server → GA4/CAPI):');
  console.log('  - form_submission → generate_lead');
  console.log('  - Appointment, Contact, and Lead forms');
  console.log('');

  console.log('🎯 CTA Events (GTM → Server → GA4/CAPI):');
  console.log('  - cta_click → select_content');
  console.log('  - button_click → click');
  console.log('');

  console.log('📞 Contact Events (GTM → Server → GA4/CAPI):');
  console.log('  - contact_method_click → contact_whatsapp/phone');
  console.log('');

  console.log('👁️ Engagement Events (GTM → Server → GA4/CAPI):');
  console.log('  - section_view');
  console.log('');

  console.log('🧠 Assessment Events (GTM → Server → GA4/CAPI):');
  console.log('  - test_finish, guard_rail_unlock');
  console.log('  - aura_results_* and atm_results_* events');
  console.log('');

  console.log('🔗 Referral Events (GTM → Server → GA4/CAPI):');
  console.log('  - referral_init, referral_share, referral_copy');
  console.log('');

  console.log('💰 Conversion Events (GTM → Server → GA4/CAPI):');
  console.log('  - conversion → purchase');
  console.log('');

  console.log('✅ All events route through server-side GTM for FB CAPI!');
};

// Auto-run test and summary on development
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  setTimeout(() => {
    console.log('🔧 Development mode detected - running diagnostics...');
    setTimeout(() => {
      runTrackingDiagnostic();
      getTrackingEventSummary();
    }, 3000);
  }, 1000);
}
