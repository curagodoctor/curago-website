# GBSI Result Page Action Buttons & Popup

## Overview

The GBSI Result page now includes:
1. **Pop-up Modal** - Appears 5 seconds after results are displayed
2. **4 Action Buttons** - Appear on all result types (clinicalPriority, brainGutOverdrive, mechanicalMetabolic, allClear)

These features provide users with next steps and support options.

## Implementation Details

### File Modified
- **`src/components/assessment/gbsi/GbsiResultScreen.tsx`**

## Pop-up Modal (Appears after 5 seconds)

### Features
- **Timing**: Appears automatically 5 seconds after result page loads
- **Design**: Centered modal with backdrop blur
- **Animation**: Smooth fade-in and scale animation using Framer Motion
- **Close Options**:
  - Click X button in top-right corner
  - Click anywhere outside the modal (on backdrop)
  - Clicking any action button inside closes the modal

### Content

**Header**: "Check Your Email!"

**Message**:
> You would have received your test result PDF in your email inbox/spam. If you want to book an online consultation, book an appointment.

**Action Buttons**:
1. **Book an Appointment (₹999)** - Green button
   - Opens Razorpay payment gateway
   - After payment: Redirects to `/schedule-consultation`
   - Closes popup after click

2. **Chat Now on WhatsApp** - WhatsApp green button
   - Opens WhatsApp with pre-filled message
   - Message includes user's name from assessment
   - Closes popup after click

### Implementation

```typescript
// State to control popup visibility
const [showPopup, setShowPopup] = useState(false);

// Show popup after 5 seconds
React.useEffect(() => {
  const timer = setTimeout(() => {
    setShowPopup(true);
  }, 5000);

  return () => clearTimeout(timer);
}, []);

// WhatsApp handler for popup
const handleWhatsAppChat = () => {
  const message = `Hi, I've received my GBSI Assessment results. I would like to discuss my results. My name is ${userName}.`;
  window.open(`https://wa.me/919148615951?text=${encodeURIComponent(message)}`, '_blank');
  setShowPopup(false);
};

// Consultation handler for popup
const handlePopupConsultation = () => {
  handleOnlineConsultation(); // Opens Razorpay
  setShowPopup(false);
};
```

### Customization

**Change Popup Delay** (default: 5 seconds):
```typescript
setTimeout(() => {
  setShowPopup(true);
}, 5000); // Change 5000 to desired milliseconds
```

**Change Message Text** (line ~620-622):
```jsx
<p className="text-gray-700 leading-relaxed">
  Your custom message here
</p>
```

**Disable Auto-Popup**: Remove or comment out the `useEffect` hook that sets the timer.

### Visual Layout

```
┌─────────────────────────────────────┐
│  [×]                                │
│                                     │
│         [✓ Icon]                    │
│                                     │
│      Check Your Email!              │
│                                     │
│  You would have received your       │
│  test result PDF in your email...   │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ 📅 Book an Appointment (₹999) │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ 💬 Chat Now on WhatsApp       │  │
│  └───────────────────────────────┘  │
│                                     │
│  Click × or outside to close        │
└─────────────────────────────────────┘
```

## Action Buttons Section

#### 1. Book Online Consultation (₹999)
- **Functionality**: Opens Razorpay payment gateway for online consultation booking
- **Payment Amount**: ₹999
- **Post-Payment Redirect**: Redirects to `/schedule-consultation` page after successful payment
- **GTM Tracking**: Pushes `initiatecheckout` event to dataLayer with test_type: 'gbsi_consultation'
- **Button Color**: Green (#096b17) with white text
- **Icon**: Calendar icon

**Implementation**:
```typescript
const handleOnlineConsultation = () => {
  // Opens Razorpay payment link
  // Redirects to /schedule-consultation after payment
  // Tracks GTM event
};
```

#### 2. Apply for Priority Circle 365
- **Functionality**: Opens Priority Circle 365 application form
- **URL**: `https://dryuvaraj.curago.in/apply`
- **Opens**: In new tab
- **Button Style**: White background with green border and text
- **Icon**: FileText icon

**Implementation**:
```typescript
const handlePriorityCircleApply = () => {
  window.open('https://dryuvaraj.curago.in/apply', '_blank');
};
```

#### 3. Know More - Priority Circle 365
- **Functionality**: Opens Priority Circle 365 main information page
- **URL**: `https://dryuvaraj.curago.in`
- **Opens**: In new tab
- **Button Style**: White background with green border and text
- **Icon**: ExternalLink icon

**Implementation**:
```typescript
const handlePriorityCircleInfo = () => {
  window.open('https://dryuvaraj.curago.in', '_blank');
};
```

#### 4. Book In-Clinic Appointment on WhatsApp
- **Functionality**: Opens WhatsApp chat with pre-filled message
- **WhatsApp Number**: +919148615951 (CuraGo)
- **Pre-filled Message**: Includes user's name from GBSI assessment
- **Opens**: In new tab
- **Button Style**: WhatsApp green (#25D366) with white text
- **Icon**: MessageCircle icon

**Implementation**:
```typescript
const handleWhatsAppAppointment = () => {
  const message = `Hi, I've completed the GBSI Assessment and would like to book an in-clinic appointment. My name is ${userName}.`;
  window.open(`https://wa.me/919148615951?text=${encodeURIComponent(message)}`, '_blank');
};
```

## Configuration

### Razorpay Settings

**Update in `GbsiResultScreen.tsx` (lines 17-18)**:
```typescript
const RAZORPAY_CONSULTATION_BUTTON_ID = 'pl_Rtue8bSVIson8p'; // Replace with actual consultation button ID
const CONSULTATION_AMOUNT = 99900; // ₹999 in paise
```

To change the consultation fee or Razorpay button:
1. Update `RAZORPAY_CONSULTATION_BUTTON_ID` with your actual Razorpay payment button ID
2. Update `CONSULTATION_AMOUNT` (amount in paise, e.g., ₹999 = 99900 paise)

### Priority Circle 365 URLs

**Update in button handlers if URLs change**:
- Application form: `https://dryuvaraj.curago.in/apply`
- Information page: `https://dryuvaraj.curago.in`

### WhatsApp Configuration

**Update in `handleWhatsAppAppointment` function**:
```typescript
const whatsappNumber = '919148615951'; // CuraGo WhatsApp number
```

To change the WhatsApp number:
1. Update the `whatsappNumber` variable
2. Format: Country code + number (no + sign, no spaces)

## Layout

The action buttons appear in a 2x2 grid on desktop and stack vertically on mobile:

```
┌────────────────────────────────────┐
│   Next Steps & Support             │
├──────────────────┬─────────────────┤
│ Book Online      │ Apply for       │
│ Consultation     │ Priority 365    │
├──────────────────┼─────────────────┤
│ Know More        │ Book In-Clinic  │
│ Priority 365     │ on WhatsApp     │
└──────────────────┴─────────────────┘
```

## Scheduling Page

After successful payment for online consultation, users are redirected to `/schedule-consultation`.

### To-Do: Create Scheduling Page

Create a new component at `src/components/ScheduleConsultationPage.tsx` or similar, and add it to your router.

**Example structure**:
```tsx
// src/components/ScheduleConsultationPage.tsx
export default function ScheduleConsultationPage() {
  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <h1>Schedule Your Consultation</h1>
      {/* Add calendar/scheduling component */}
    </div>
  );
}
```

**Add to router** (in `App.tsx`):
```tsx
<Route path="/schedule-consultation" element={<ScheduleConsultationPage />} />
```

## Priority Circle 365 Webhook

The Priority Circle 365 application form uses the same webhook as `dryuvaraj.curago.in`.

**Webhook URL**: Should be configured in the form at `https://dryuvaraj.curago.in/apply`

Ensure the webhook:
1. Captures user information from the form
2. Sends to the same endpoint as the main Priority Circle form
3. Includes GBSI assessment context if needed

## GTM Tracking

### Event: `initiatecheckout`

**Triggered when**: User clicks "Book Online Consultation"

**Data Layer Push**:
```javascript
{
  event: 'initiatecheckout',
  test_type: 'gbsi_consultation',
  amount: 999,
  currency: 'INR',
  page_path: window.location.pathname,
  timestamp: new Date().toISOString()
}
```

This event helps track:
- Consultation booking attempts
- Conversion funnel from GBSI assessment to paid consultation
- User journey analytics

## Testing

### Test Popup Modal
1. Complete GBSI assessment
2. Reach result page
3. Wait 5 seconds
4. Verify popup appears with:
   - "Check Your Email!" header
   - Proper message about PDF in email
   - Two action buttons
   - X close button in top-right
5. Test closing popup:
   - Click X button - verify closes
   - Re-load page, wait 5 seconds, click outside modal - verify closes
   - Re-load page, wait 5 seconds, click any action button - verify closes

### Test Popup Action Buttons
1. **Book Appointment from Popup**:
   - Click "Book an Appointment (₹999)"
   - Verify Razorpay opens in new tab
   - Verify popup closes
   - Complete test payment
   - Verify redirect to `/schedule-consultation`

2. **WhatsApp Chat from Popup**:
   - Click "Chat Now on WhatsApp"
   - Verify WhatsApp opens with pre-filled message
   - Verify message includes user's name
   - Verify popup closes

### Test Online Consultation Payment Flow (from main buttons)
1. Complete GBSI assessment
2. Reach result page
3. Scroll to "Next Steps & Support" section
4. Click "Book Online Consultation (₹999)"
5. Verify Razorpay opens in new tab
6. Complete test payment
7. Verify redirect to `/schedule-consultation`

### Test Priority Circle 365 Links
1. Click "Apply for Priority Circle 365"
   - Verify opens `https://dryuvaraj.curago.in/apply` in new tab
2. Click "Know More - Priority Circle 365"
   - Verify opens `https://dryuvaraj.curago.in` in new tab

### Test WhatsApp Booking
1. Click "Book In-Clinic on WhatsApp"
2. Verify WhatsApp opens with pre-filled message
3. Verify message includes user's name
4. Verify number is +919148615951

## Customization

### Change Button Text
Update button labels in the `renderActionButtons` function:

```typescript
{isPaymentLoading ? 'Opening...' : 'Book Online Consultation (₹999)'}
```

### Change Button Colors
Update the `style` prop:

```typescript
style={{ backgroundColor: '#096b17', color: '#ffffff' }}
```

### Change Button Order
Rearrange the grid items in the JSX:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {/* Reorder buttons here */}
</div>
```

### Add/Remove Buttons
Modify the grid in the `renderActionButtons` function to add or remove buttons.

## User Experience

### Button Visibility
- Buttons appear on ALL result types
- Positioned after the existing "Retake Assessment" buttons
- Contained in a distinct "Next Steps & Support" card

### Mobile Responsiveness
- Grid layout: 2 columns on desktop, 1 column on mobile
- All buttons stack vertically on small screens
- Touch-friendly button sizes (py-4)

### Loading States
- "Book Online Consultation" shows "Opening..." while loading
- Other buttons don't have loading states (instant navigation)

## Support

For issues or questions:
- Email: curagodoctor@gmail.com
- Check browser console for GTM event logs
- Review Razorpay dashboard for payment tracking
- Test WhatsApp integration with different phone numbers

## Summary

### Popup Modal
- ✅ Appears 5 seconds after result page loads
- ✅ Reminds users to check email for PDF results
- ✅ Two action buttons: Book Appointment & WhatsApp Chat
- ✅ Multiple close options (X button, outside click, action buttons)
- ✅ Smooth animations with Framer Motion
- ✅ Mobile responsive design

### Action Buttons Section (4 buttons)
- ✅ Book Online Consultation (₹999) - Razorpay integration
- ✅ Apply for Priority Circle 365 - Form link
- ✅ Know More - Priority Circle 365 - Info page
- ✅ Book In-Clinic on WhatsApp - WhatsApp chat

### User Flow
1. User completes GBSI assessment
2. Results page loads
3. After 5 seconds → Popup appears
4. User can either:
   - Book appointment via Razorpay (popup or main buttons)
   - Chat on WhatsApp (popup or main buttons)
   - Apply for Priority Circle 365 (main buttons)
   - Learn about Priority Circle 365 (main buttons)
5. All actions tracked via GTM for analytics

## Files Reference

- Result Screen: `src/components/assessment/gbsi/GbsiResultScreen.tsx`
- This Guide: `docs/GBSI-ACTION-BUTTONS.md`
- OTP Guide: `docs/OTP-IMPLEMENTATION-GUIDE.md`
- WhatsApp Setup: `docs/WHATSAPP-SETUP.md`
