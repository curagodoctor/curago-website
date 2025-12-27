# CuraGo's Anxiety Loop Assessment Tool 1.0 Landing Page - GTM & Razorpay Code Reference

## 🎯 GTM (Google Tag Manager) Tracking Code

### 1. Tracking Utility Functions (from `/src/utils/tracking.ts`)

```typescript
// GTM DataLayer declaration
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

// Initialize dataLayer
if (typeof window !== 'undefined') {
  window.dataLayer = window.dataLayer || [];
}

// Helper: Get referral code from URL
const getRefFromUrl = () => {
  if (typeof window === 'undefined') return undefined;
  const u = new URL(window.location.href);
  const ref = u.searchParams.get('ref') || undefined;
  return ref || undefined;
};
```

### 2. Page View Tracking

```typescript
// Virtual pageview for SPA navigation
export function trackVirtualPage(opts: { title: string; path?: string }) {
  if (typeof window === 'undefined') return;

  const loc = window.location;
  const page_path = opts.path ?? `${loc.pathname}${loc.search}${loc.hash}`;
  const ref = getRefFromUrl();

  // GTM event
  window.dataLayer?.push({
    event: 'virtual_pageview',
    page_title: opts.title,
    page_path,
    page_location: loc.href,
    referrer_code: ref,
  });
}

// Backwards-compatible wrapper
export const trackPageView = (pageName: string, pageTitle?: string) => {
  if (typeof window === 'undefined') return;
  trackVirtualPage({ title: pageTitle || pageName });
  console.log(`✅ Tracking: Page view for ${pageName}`);
};
```

### 3. Button Click Tracking

```typescript
// Generic button click tracking
export const trackButtonClick = (
  buttonName: string,
  buttonType?: string,
  source?: string
) => {
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

// CTA click tracking
export const trackCTA = (
  ctaName: string,
  source?: string,
  extras?: Record<string, any>
) => {
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
```

### 4. Form Submission Tracking

```typescript
// Form submission tracking (for appointment/contact forms)
export const trackFormSubmission = (
  formType: 'contact' | 'appointment' | 'lead',
  formData?: { name?: string; email?: string; phone?: string; [k: string]: any },
  referral?: { code?: string; link?: string }
) => {
  const refParam = getRefFromUrl();

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
    formData: {
      hasName: !!formData?.name,
      hasEmail: !!formData?.email,
      hasPhone: !!formData?.phone,
    },
  });

  console.log(`✅ Tracking: ${formType} form submitted`);
};
```

### 5. WhatsApp Click Tracking

```typescript
// Track WhatsApp contact clicks
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
```

### 6. Section View Tracking

```typescript
// Track when user scrolls to a section
export const trackSectionView = (sectionName: string) => {
  window.dataLayer?.push({
    event: 'section_view',
    sectionName,
    event_category: 'Engagement',
    event_label: sectionName,
  });

  console.log('✅ Tracking: Section view -', sectionName);
};
```

### 7. Conversion Tracking

```typescript
// Track conversions (purchases, payments)
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
    currency,
    transactionId,
    transaction_id: transactionId,
    referralCode: referral?.code || refParam,
    referralLink: referral?.link,
  });

  console.log(`✅ Tracking: Conversion of ${currency} ${value}`);
};
```

---

## 💳 Razorpay Payment Integration

### RazorpayButton Component (from `/src/components/RazorpayButton.tsx`)

```typescript
import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Sparkles } from 'lucide-react';

interface RazorpayButtonProps {
  buttonId?: string;
  className?: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function RazorpayButton({
  buttonId = 'pl_Rtue8bSVIson8p',
  className
}: RazorpayButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load Razorpay checkout script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handlePayment = () => {
    setIsLoading(true);

    // Track initiate checkout event in GTM
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'initiatecheckout',
      test_type: 'calm_tool',
      amount: 299,
      currency: 'INR',
      page_path: window.location.pathname,
      timestamp: new Date().toISOString(),
    });
    console.log('✅ initiatecheckout event pushed to dataLayer (CuraGo\'s Anxiety Loop Assessment Tool 1.0, ₹299)');

    // Open Razorpay payment link
    const paymentUrl = `https://razorpay.com/payment-button/${buttonId}/view/?amount=29900`;
    window.open(paymentUrl, '_blank');

    setIsLoading(false);
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={isLoading}
      size="lg"
      className={
        className ||
        "bg-[#096b17] text-white hover:bg-[#075110] border-2 border-[#096b17] px-8 h-14 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
      }
    >
      <Sparkles className="w-5 h-5 mr-2" />
      {isLoading ? 'Opening...' : 'Start Assessment'}
    </Button>
  );
}
```

---

## 📝 Usage in CuraGo's Anxiety Loop Assessment Tool 1.0 Landing Page

### How it's used in `/src/components/CalmLandingPage.tsx`

```tsx
import RazorpayButton from './RazorpayButton';

export default function CalmLandingPage({ onStartAssessment }: CalmLandingPageProps) {
  const [price] = useState(299);

  return (
    <div className="min-h-screen bg-[#F5F5DC]">
      {/* HERO SECTION */}
      <section>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {/* Primary CTA - Razorpay Payment Button */}
          <RazorpayButton />

          {/* Secondary CTA - What You Get */}
          <Button
            onClick={() => scrollToSection('what-you-get')}
            variant="outline"
            size="lg"
          >
            What exactly will I receive?
          </Button>
        </div>

        <p className="text-xs text-center max-w-md">
          By clicking Start CALM 1.0, you are agreeing to our{' '}
          <a href="/calm/terms" target="_blank" rel="noopener noreferrer">
            terms and conditions
          </a>
        </p>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="bg-[#FFFDBD] py-20 pb-32">
        <div className="text-center">
          <h2 className="text-3xl md:text-5xl mb-6 font-bold">
            This is the safest place to start<br />
            when you don't know where to start.
          </h2>

          <p className="text-lg md:text-xl mb-8">
            Gain clarity on your anxiety pattern in just 10 minutes.
          </p>

          {/* Razorpay Button with custom styling */}
          <RazorpayButton
            className="bg-white text-[#096b17] hover:bg-white border-4 border-white px-12 py-8 h-auto rounded-2xl font-bold text-xl shadow-2xl hover:scale-105 transition-all duration-300"
          />

          <p className="text-xs text-center max-w-md mt-4">
            By clicking Start Assessment, you are agreeing to our{' '}
            <a href="/calm/terms">terms and conditions</a>
          </p>
        </div>
      </section>
    </div>
  );
}
```

---

## 🔑 Key Details

### Razorpay Configuration

**Payment Button ID:** `pl_Rtue8bSVIson8p`
**Amount:** ₹299 (passed as 29900 paise)
**Payment URL Format:** `https://razorpay.com/payment-button/{buttonId}/view/?amount={amount_in_paise}`

### GTM Events Tracked

1. **initiatecheckout** - When payment button is clicked
   - `test_type`: 'calm_tool'
   - `amount`: 299
   - `currency`: 'INR'
   - `page_path`: Current page path
   - `timestamp`: ISO timestamp

2. **virtual_pageview** - Page navigation tracking
3. **button_click** - Generic button clicks
4. **cta_click** - CTA-specific clicks
5. **contact_method_click** - WhatsApp/phone clicks
6. **form_submission** - Form submissions
7. **conversion** - Payment completions

### GTM Server-Side Routing

All events route through:
- **GTM Web Container:** GTM-PL6KV3ND
- **Custom Server:** gtm.curago.in
- Handles both GA4 and Facebook CAPI server-side

---

## 💡 Implementation Notes for ALM Tool

### For Next.js Implementation:

1. **Create tracking utility file:**
   - Copy the tracking functions to `/lib/tracking.ts`
   - Ensure `window` checks for SSR safety

2. **Create Razorpay button component:**
   - Use `'use client'` directive for Next.js
   - Load Razorpay script in `useEffect`
   - Track `initiatecheckout` event before opening payment

3. **Add GTM to layout:**
   ```tsx
   // app/layout.tsx
   <Script
     id="gtm"
     strategy="afterInteractive"
     dangerouslySetInnerHTML={{
       __html: `
         (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
         new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
         j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
         'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
         })(window,document,'script','dataLayer','GTM-PL6KV3ND');
       `,
     }}
   />
   ```

4. **Track events throughout landing page:**
   - Page load: `trackPageView('ALM Landing', 'CuraGo ALM Tool 1.0')`
   - Section views: `trackSectionView('features')` with Intersection Observer
   - Button clicks: `trackButtonClick('Start Assessment', 'primary', 'hero')`
   - Payment initiation: In Razorpay button component

5. **Environment variables needed:**
   ```env
   NEXT_PUBLIC_RAZORPAY_BUTTON_ID=pl_xxxxx
   NEXT_PUBLIC_GTM_ID=GTM-PL6KV3ND
   ```

---

## 🎨 Button Styling Reference

### Primary CTA (Hero/Main sections)
```tsx
className="bg-[#096b17] text-white hover:bg-[#075110] border-2 border-[#096b17] px-8 h-14 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
```

### Final CTA (White on green background)
```tsx
className="bg-white text-[#096b17] hover:bg-white border-4 border-white px-12 py-8 h-auto rounded-2xl font-bold text-xl shadow-2xl hover:scale-105 transition-all duration-300"
```

### Brand Colors
- Primary Green: `#096b17`
- Hover Green: `#075110`
- Background Beige: `#F5F5DC`
- Accent Yellow: `#FFFDBD`

---

## ✅ Testing Checklist

Before deploying:

- [ ] GTM container loads (`window.dataLayer` exists)
- [ ] Razorpay script loads on page
- [ ] `initiatecheckout` event fires on button click
- [ ] Payment link opens in new tab
- [ ] Amount is correct (₹299 = 29900 paise)
- [ ] Page view events track navigation
- [ ] All button clicks tracked
- [ ] Console logs show tracking events
- [ ] Test in production mode (not just dev)

---

## 🔗 Related Files

- **Tracking Utilities:** `/src/utils/tracking.ts`
- **Razorpay Button:** `/src/components/RazorpayButton.tsx`
- **CuraGo's Anxiety Loop Assessment Tool 1.0 Landing:** `/src/components/CalmLandingPage.tsx`
- **Main GTM:** Loaded in root `index.html`
