# CuraGo – Software Design Document (SDD)

**Project:** CuraGo Marketing & Assessment Website  
**Domain:** Online Mental Health Consultation  
**Version:** 1.0  
**Primary System Designer & Developer:** Jatin Dubey  

---

## 1. Introduction

### 1.1 Purpose

This Software Design Document (SDD) describes the design of the **CuraGo marketing and assessment website**, including:

- Frontend architecture and major components  
- Form handling and data submission flow  
- Tracking & analytics behavior  
- Deployment approach on the VPS  
- Current API payload shapes used by forms (via proxy)

The system is already implemented; this document describes the **current production-ready design** and the expected contracts for the backend/proxy layer.

### 1.2 Scope

Included in this SDD:

- Public-facing **CuraGo website** at `curago.in`
- **Booking, lead, and contact forms** that submit data via a proxy utility
- **Mental health assessment** UI and result visualization
- Tracking & analytics integrations (GTM, GA, Meta Pixel)
- Docker-based deployment with Traefik + Nginx

Out of scope (future phase):

- Full backend application with business workflows
- Admin panel or CRM dashboard for viewing/managing data

### 1.3 System Summary

- The **frontend** is a React + TypeScript SPA built with Vite and styled using Tailwind + shadcn/ui components.
- The **frontend server uses a proxy at the VPS to dump the form data into MongoDB**.
- For any **detailed functionality** (validation rules, workflows, admin panel, analytics dashboards), a dedicated **server application and admin UI** will be built on top of the existing data structure.

---

## 2. High-Level Overview

### 2.1 Business Goal

CuraGo is an online mental health consultation platform. The marketing site:

- Communicates CuraGo’s value proposition, services, and clinical team
- Collects **appointments, leads, and callback requests** via forms
- Engages users with a **mental health assessment** funnel
- Tracks performance via GTM, GA, and Meta Pixel

### 2.2 Key Features

- Landing page: hero, services, testimonials, mental health team
- Forms:
  - **Booking Form** – appointment/consultation intent
  - **Lead Form** – top-of-funnel interest capture
  - **Contact Form** – request a callback
- Assessment module:
  - Assessment landing
  - Quiz flow
  - Results view with radar chart
- Legal / informational pages:
  - Privacy Policy, Terms of Use, Website Disclaimer
- Tracking:
  - Centralized tracking helpers + tracking matrix CSV

---

## 3. Architecture

### 3.1 Frontend Architecture

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Library**:
  - Tailwind CSS
  - shadcn/ui components in `src/components/ui`  
  - Additional UI set for assessment module in `src/components/assessment/components/ui`
- **Animations**: framer-motion
- **Charts**: recharts (Radar chart)

Entry points and structure:

- `src/main.tsx` – mounts React app into `<div id="root">`
- `src/App.tsx` – composes main sections (hero, services, forms, etc.)
- `src/components/` – core marketing-site components
- `src/components/assessment/` – assessment flow components
- `src/utils/` – tracking utilities and Wylto integration
- `src/data/teamMembers.ts` – static content for mental health team

### 3.2 Deployment & Infra

- **Containerization**: Docker multi-stage build
  - Stage 1: Node 18 Alpine → `npm ci` → `npm run build`
  - Stage 2: Nginx Alpine serving static `dist/` build
- **Reverse Proxy**: Traefik v3
  - Handles HTTP/HTTPS
  - Automatic Let’s Encrypt certificates
  - HTTP → HTTPS redirect
  - Security headers middleware
- **Firewall**: UFW (22, 80, 443 allowed)
- **VPS Deployment**: `deploy.sh`
  - Checks/install Docker & Docker Compose plugin
  - Sets up directories (`letsencrypt`, logs)
  - Builds and runs `docker-compose.yml`
  - Performs basic HTTP/HTTPS checks

### 3.3 Data Flow (High Level)

1. User fills a form (Booking, Lead, or Contact) on the SPA.
2. Form handler calls **`submitToWylto`** (in `src/utils/wylto`) with a structured payload.
3. Wylto utility sends the payload to a **proxy endpoint at the VPS**.
4. The proxy receives the request and **writes the data into MongoDB**.
5. On success:
   - The frontend **tracks the form submission** using `trackFormSubmission` (GTM, GA, Meta Pixel).
   - The user sees a toast or success dialog.
6. On failure:
   - Frontend logs the error and shows an error message/alert.

The backend API is intentionally minimal at this stage: it accepts valid JSON payloads and persists them. This keeps the marketing site fully usable while server-side features and admin panel are built later.

---

## 4. Component Design

### 4.1 Main Components

- `Navbar.tsx` – top navigation and branding
- `Hero.tsx` – primary CTA section
- `Services.tsx` – lists core services / conditions
- `DoctorCard.tsx`, `MentalHealthTeam.tsx`, `MentalHealthTeamPage.tsx` – mental health team presentation
- `Testimonials.tsx` – social proof section
- `About.tsx` – overview of CuraGo
- `Footer.tsx` – links, contact, and legal info
- `FloatingButtons.tsx` – floating WhatsApp/CTA buttons
- Legal pages:
  - `PrivacyPolicy.tsx`
  - `TermsOfUse.tsx`
  - `WebsiteDisclaimer.tsx`

### 4.2 Forms

The following forms are fully implemented in the frontend and wired to the proxy via `submitToWylto`:

#### 4.2.1 BookingForm

File: `src/components/BookingForm.tsx`

- Purpose: Capture appointment requests.
- Fields:
  - `name` – string (required)
  - `phone` – string (required, WhatsApp, normalized with `+91` prefix)
  - `email` – string (required)
  - `consultant` – string (optional, selected from fixed list; can be `"Any Available Consultant"`)
  - `date` – Date (required, must be >= today)
  - `time` – string (required, from evening time slots)
  - `message` – string (optional details)
- Behavior:
  - On submit, calls:
    ```ts
    const { submitToWylto } = await import('../utils/wylto');
    submitToWylto({
      name: formData.name,
      phoneNumber: formData.phone,
      email: formData.email,
      formType: 'appointment',
      consultant: formData.consultant,
      date: formattedDate,
      time: formData.time,
      message: formData.message,
    });
    ```
  - On success:
    - Tracks event:  
      `trackFormSubmission('appointment', { ...formData, date: dateString })`
    - Shows “Thank You” dialog (AlertDialog).
    - Resets form fields.

#### 4.2.2 LeadForm

File: `src/components/LeadForm.tsx`

- Purpose: Capture general leads and service interest.
- Fields:
  - `service` – string (required; values like `psychiatry`, `psychology`, `anxiety-depression`, etc.)
  - `name` – string (required)
  - `email` – string (required)
  - `phone` – string (required, enforced as `+91 ` prefix)
  - `area` – string (optional)
  - `message` – string (optional)
- Behavior:
  - Basic frontend validation: required fields check.
  - On submit:
    ```ts
    const { submitToWylto } = await import('../utils/wylto');
    submitToWylto({
      name: formData.name,
      phoneNumber: formData.phone.trim(),
      email: formData.email,
      formType: 'lead',
      service: formData.service,
      area: formData.area,
      message: formData.message,
    });
    ```
  - On success:
    - Tracks event:  
      `trackFormSubmission('lead', { ...formData })`
    - Shows success toast with `sonner`:  
      “Thank you! We'll contact you within 24 hours.”
    - Resets form fields.

#### 4.2.3 ContactForm

File: `src/components/ContactForm.tsx`

- Purpose: Capture **callback requests**.
- Fields:
  - `name` – string (required)
  - `phone` – string (required, normalized with `+91`)
  - `email` – string (required)
  - `callbackTime` – string (required; values like `morning`, `afternoon`, `evening`, `night`)
- Behavior:
  - Basic frontend required-validation.
  - On submit:
    ```ts
    const { submitToWylto } = await import('../utils/wylto');
    submitToWylto({
      name: formData.name,
      phoneNumber: formData.phone,
      email: formData.email,
      formType: 'contact',
      callbackTime: formData.callbackTime,
    });
    ```
  - On success:
    - Tracks event:  
      `trackFormSubmission('contact', { ...formData })`
    - Shows a success dialog.
    - Resets form fields.
  - WhatsApp CTA:
    - Clicking the WhatsApp button:
      - Calls `trackWhatsAppClick('contact_form')`
      - Opens `https://wa.me/917021227203` in a new tab.

---

## 5. Assessment Module

Located in: `src/components/assessment`

### 5.1 Main Parts

- `LandingPage.tsx` – introduction & CTA to start the assessment.
- `QuizFlow.tsx` – handles:
  - Question list and current index
  - User answers and internal scoring
  - Navigation between questions
- `ResultScreen.tsx` – displays:
  - Results by domain
  - Explanatory text
  - Radar chart via `RadarChart.tsx`
- `RadarChart.tsx` – uses `recharts` to display a multi-axis chart.
- `LeadCaptureModal.tsx` – optional lead capture around the assessment (can reuse Wylto pattern and `formType` such as `"assessment_lead"`).

### 5.2 Data Handling

- Internal state stores answers and computed scores.
- When integrated with backend, a `submitToWylto` call can be added to send:
  - `formType: 'assessment_result'`
  - Scores per domain
  - Raw answers (optional)
  - Optional user identification fields (if user consents)

---

## 6. Tracking & Analytics

### 6.1 Scripts in index.html

- **Google Tag Manager (GTM)** script
- **Google Analytics (GA4)** script
- **Meta Pixel** script
- `<noscript>` fallbacks for GTM and Pixel

### 6.2 Tracking Utilities

File: `src/utils/tracking.ts`

- Provides wrapper functions like:
  - `trackFormSubmission(formType, payload)`
  - `trackWhatsAppClick(source)`
- Responsibilities:
  - Push appropriate events into `window.dataLayer`
  - Call Meta Pixel (`fbq`) where relevant
  - Keep naming consistent with `curago_tracking_matrix.csv`

### 6.3 Events

- **Form-related**:
  - `"appointment_form_submitted"` (type `"appointment"`)
  - `"lead_form_submitted"` (type `"lead"`)
  - `"contact_form_submitted"` (type `"contact"`)
- **WhatsApp interactions**:
  - `"whatsapp_click"` with `source` (e.g., `contact_form`, floating button)

---

## 7. API Context (Proxy & DB)

Although the implementation lives outside this repo (in the VPS/proxy), the **frontend already assumes and uses a stable contract** via `submitToWylto`. This section defines that contract so the backend and future admin panel can be built reliably.

### 7.1 General Behavior

- The frontend calls a **Wylto utility** function:

  ```ts
  const { submitToWylto } = await import('../utils/wylto');
  const result = await submitToWylto(payload);
  ```

- `submitToWylto` is responsible for:
  - Calling the **proxy endpoint** hosted on the VPS (for example `/api/forms` or similar).
  - Sending the JSON body as-is.
  - Returning a standardized response:

    ```ts
    type SubmitToWyltoResult = {
      success: boolean;
      message?: string;
      data?: unknown;
    };
    ```

- The **frontend server uses this proxy at the server to dump the data into MongoDB.**

### 7.2 Common Request Envelope

All form submissions include:

```jsonc
{
  "formType": "appointment | lead | contact | assessment_lead | assessment_result",
  "name": "string",
  "phoneNumber": "string",     // includes +91 prefix
  "email": "string",           // required for all current forms
  // Plus type-specific fields below
}
```

#### 7.2.1 Appointment (Booking Form)

```jsonc
{
  "formType": "appointment",
  "name": "string",
  "phoneNumber": "string",
  "email": "string",
  "consultant": "string",     // Either specific doctor or 'Any Available Consultant'
  "date": "string",           // Human-readable, e.g. 'Saturday, 18 January 2025'
  "time": "string",           // e.g. '07:30 PM'
  "message": "string"         // optional
}
```

#### 7.2.2 Lead (Lead Form)

```jsonc
{
  "formType": "lead",
  "name": "string",
  "phoneNumber": "string",
  "email": "string",
  "service": "string",        // e.g. 'psychiatry', 'psychology', 'deaddiction'
  "area": "string",           // optional
  "message": "string"         // optional
}
```

#### 7.2.3 Contact (Contact Form)

```jsonc
{
  "formType": "contact",
  "name": "string",
  "phoneNumber": "string",
  "email": "string",
  "callbackTime": "string"    // 'morning' | 'afternoon' | 'evening' | 'night'
}
```

#### 7.2.4 Recommended Future: Assessment Result

(Not yet wired in code, but aligned with current design.)

```jsonc
{
  "formType": "assessment_result",
  "scores": {
    "anxiety": 0,
    "depression": 0,
    "stress": 0,
    "burnout": 0,
    "wellbeing": 0
  },
  "rawAnswers": [
    { "questionId": "string", "answer": "string | number" }
  ],
  "version": "string",      // assessment version
  "meta": {
    "source": "website",
    "utm": { "utm_source": "string", "utm_campaign": "string" }
  }
}
```

### 7.3 Storage Model (MongoDB – Conceptual)

Recommended MongoDB collection: `form_submissions`

Example document:

```jsonc
{
  "_id": ObjectId("..."),
  "formType": "appointment",
  "payload": {
    // original JSON payload from the form
  },
  "createdAt": ISODate("2025-01-18T15:30:00Z"),
  "meta": {
    "ip": "x.x.x.x",
    "userAgent": "string",
    "path": "/#booking",
    "referrer": "https://curago.in",
    "utm": {
      "utm_source": "meta",
      "utm_campaign": "launch_campaign"
    }
  }
}
```

This structure keeps the API simple today, and makes it easy to build:

- A Node/Express service to read/filter submissions
- An **Admin Panel** for CuraGo team members (future phase)

---

## 8. Non-Functional Requirements

- **Performance**
  - SPA served as static assets via Nginx
  - Vite production build optimizations
- **Security**
  - HTTPS by default via Traefik + Let’s Encrypt
  - Security headers in Traefik (HSTS, X-Frame-Options, X-Content-Type-Options)
  - Basic Auth on Traefik dashboard (`traefik.curago.in`)
- **Availability**
  - Docker containers set with `restart: unless-stopped`
  - Simple restart & rebuild via `docker compose` commands
- **Maintainability**
  - Typed code with TypeScript
  - Components organized by feature (`components`, `components/assessment`, `components/ui`)
  - Guidelines file for consistent styling

---

## 9. Future Work

- Full backend service with:
  - Validation logic
  - SMS/email alerts for new leads/appointments
  - Integration with scheduling/payment systems
- Admin panel for:
  - Viewing, searching, filtering submissions
  - Tagging and status management (new/in-progress/closed)
- Extended analytics and funnel reporting using the tracked events.
- Optional multi-language support.

---

**Author:**  
This system and architecture (frontend, forms, deployment flow, and integration patterns) have been **designed and developed by _Jatin Dubey_** for CuraGo.