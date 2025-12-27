# CuraGo's ALM Tool 1.0 Landing Page - Complete Specification

## 🎯 Project Overview

**Tool Name:** CuraGo's Anxiety Loop Assessment 1.0
**Platform:** Next.js 15 with App Router
**Performance Target:** < 3 second loading speed
**Design Theme:** Dark landing page with trust elements
**Pricing Model:** Similar to CALM (₹299 with Razorpay)

---

## 📋 Table of Contents

1. [Tech Stack & Architecture](#tech-stack--architecture)
2. [Project Structure](#project-structure)
3. [Design System](#design-system)
4. [Landing Page Sections](#landing-page-sections)
5. [Performance Optimization Strategy](#performance-optimization-strategy)
6. [CRO (Conversion Rate Optimization)](#cro-conversion-rate-optimization)
7. [Implementation Roadmap](#implementation-roadmap)
8. [Code Examples](#code-examples)
9. [Deployment Strategy](#deployment-strategy)

---

## 🛠 Tech Stack & Architecture

### Core Technologies

```json
{
  "framework": "Next.js 15",
  "runtime": "Node 20+",
  "styling": "Tailwind CSS v4 + shadcn/ui",
  "animations": "Framer Motion",
  "forms": "React Hook Form",
  "payment": "Razorpay",
  "analytics": "Google Tag Manager + GA4 + Meta Pixel",
  "charts": "Recharts (for sample reports)",
  "icons": "Lucide React",
  "language": "TypeScript",
  "testing": "Jest + React Testing Library (optional)"
}
```

### Next.js 15 Features to Leverage

- **App Router** - File-based routing with layouts
- **Server Components** - Default for static content (hero, features, testimonials)
- **Client Components** - Only for interactive elements (forms, payment, videos)
- **Image Optimization** - `next/image` with blur placeholders
- **Font Optimization** - `next/font` for Google Fonts
- **Metadata API** - SEO optimization out of the box
- **Streaming SSR** - Progressive page rendering
- **Partial Prerendering** (PPR) - Combine static and dynamic content

### Performance Architecture

```
┌─────────────────────────────────────────┐
│   Static Shell (Server Components)      │
│   ├─ Hero Section                       │
│   ├─ Features Grid                      │
│   ├─ Trust Badges                       │
│   ├─ Testimonials                       │
│   └─ Footer                             │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Dynamic Islands (Client Components)    │
│   ├─ Payment Popup                      │
│   ├─ Video Players                      │
│   ├─ Sample Report Modal                │
│   └─ CTA Buttons with tracking          │
└─────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
alm-landing/
├── app/
│   ├── layout.tsx              # Root layout with fonts, analytics
│   ├── page.tsx                # Main landing page (Server Component)
│   ├── globals.css             # Tailwind + custom CSS
│   ├── api/
│   │   ├── razorpay/
│   │   │   └── route.ts        # Razorpay order creation
│   │   └── verify-payment/
│   │       └── route.ts        # Payment verification
│   └── metadata.ts             # SEO metadata
│
├── components/
│   ├── landing/
│   │   ├── Hero.tsx            # Hero section (Server)
│   │   ├── TrustBar.tsx        # Trust elements bar (Server)
│   │   ├── FeaturesGrid.tsx    # Key features (Server)
│   │   ├── HowItWorks.tsx      # Process steps (Server)
│   │   ├── SocialProof.tsx     # Test-taker count (Server with dynamic island)
│   │   ├── Testimonials.tsx    # Testimonial carousel (Server)
│   │   ├── UseCases.tsx        # User success stories (Server)
│   │   ├── SampleReport.tsx    # Report preview popup (Client)
│   │   ├── PaymentPopup.tsx    # Payment modal (Client)
│   │   ├── VideoSection.tsx    # Video embeds (Client)
│   │   ├── CTASection.tsx      # Main CTA (Client for tracking)
│   │   └── FloatingCTA.tsx     # Sticky CTA button (Client)
│   │
│   ├── ui/                     # shadcn components
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── badge.tsx
│   │   ├── card.tsx
│   │   └── ...
│   │
│   └── shared/
│       ├── Navbar.tsx          # Top navigation (Server)
│       └── Footer.tsx          # Footer (Server)
│
├── lib/
│   ├── utils.ts                # Utility functions
│   ├── tracking.ts             # GTM/GA4 tracking
│   ├── razorpay.ts             # Payment helpers
│   └── constants.ts            # Config constants
│
├── types/
│   └── alm.ts                  # TypeScript types
│
├── public/
│   ├── images/
│   │   ├── hero-bg.webp        # Dark gradient background
│   │   ├── testimonials/       # Face images
│   │   ├── badges/             # Trust badges
│   │   ├── reports/            # Sample report screenshots
│   │   └── use-cases/          # Success story images
│   ├── videos/
│   │   └── explainer.mp4       # Self-hosted video
│   └── fonts/                  # Custom fonts (if needed)
│
├── styles/
│   └── animations.css          # Custom CSS animations
│
├── next.config.mjs             # Next.js configuration
├── tailwind.config.ts          # Tailwind configuration
├── tsconfig.json               # TypeScript config
└── package.json                # Dependencies
```

---

## 🎨 Design System

### Color Palette (Dark Theme)

Based on your existing CALM tool design:

```css
/* globals.css */
:root {
  /* Primary Green (CuraGo Brand) */
  --color-primary-900: #053d0b;
  --color-primary-700: #075110;
  --color-primary-500: #096b17;
  --color-primary-300: #64CB81;

  /* Accent Colors */
  --color-beige: #FFFDBD;
  --color-cream: #F5F5DC;

  /* Dark Theme */
  --color-bg-dark: #0a0a0a;
  --color-bg-dark-elevated: #1a1a1a;
  --color-text-dark: #e5e5e5;
  --color-text-muted: #a3a3a3;

  /* Status Colors */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
}

/* Dark gradient backgrounds */
.gradient-dark-green {
  background: linear-gradient(135deg, #096b17 0%, #075110 50%, #053d0b 100%);
}

.gradient-dark-radial {
  background: radial-gradient(circle at 50% 0%, rgba(9, 107, 23, 0.3) 0%, transparent 70%);
}
```

### Typography

```typescript
// app/layout.tsx
import { Inter, Manrope } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

// Usage:
// Headings: font-manrope
// Body: font-inter
```

### Component Styling Patterns

```tsx
// Reusable Tailwind classes based on your CALM tool

// Primary Button
className="bg-[#096b17] hover:bg-[#075110] text-white px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 text-lg font-semibold"

// Secondary Button (Beige)
className="bg-white hover:bg-[#FFFDBD] text-[#096b17] border-2 border-[#096b17] px-8 py-4 rounded-xl transition-all duration-300 text-lg font-semibold"

// Card Component
className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6 hover:border-[#096b17] transition-all duration-300"

// Trust Badge
className="bg-[#096b17]/10 border border-[#096b17]/30 rounded-lg px-4 py-2 text-sm font-medium text-[#64CB81]"

// Section Container
className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24"
```

---

## 📄 Landing Page Sections

### 1. Hero Section (Above the Fold)

**Goal:** Capture attention immediately, communicate value, drive to CTA

**Elements:**
- **Dark gradient background** with subtle radial glow
- **Tool name prominently displayed:** "CuraGo's ALM Tool 1.0"
- **Compelling headline** (H1): "Map Your Anxiety Patterns. Take Back Control."
- **Subheadline:** "Clinical-grade anxiety assessment. No AI. Real results. Under 20 minutes."
- **Two CTAs:**
  - Primary: "Start Assessment - ₹299" (payment popup)
  - Secondary: "See Sample Report" (opens modal)
- **Trust indicators:**
  - "Approved by certified mental health professionals"
  - "5,234 tests completed" (dynamic count)
  - "Strictly non-AI involved"
- **Hero image/video:** Screenshot of sample report or explainer video
- **Social proof badges:** "Clinical Grade" | "Privacy Protected" | "Instant Results"

**Code Example:**

```tsx
// app/page.tsx (Server Component)
import { Hero } from '@/components/landing/Hero'
import { TrustBar } from '@/components/landing/TrustBar'

export default function ALMHomePage() {
  return (
    <>
      <Hero />
      <TrustBar />
      {/* Other sections... */}
    </>
  )
}

// components/landing/Hero.tsx
'use client'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import PaymentPopup from './PaymentPopup'
import SampleReportModal from './SampleReport'

export function Hero() {
  const [showPayment, setShowPayment] = useState(false)
  const [showSample, setShowSample] = useState(false)

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a0a]">
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-dark-green opacity-90" />
      <div className="absolute inset-0 gradient-dark-radial" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          {/* Tool Name Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-block mb-6"
          >
            <span className="bg-[#096b17]/20 border border-[#096b17] text-[#64CB81] px-6 py-2 rounded-full text-sm font-semibold">
              CuraGo's ALM Tool 1.0
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 font-manrope"
          >
            Map Your Anxiety Patterns.
            <br />
            <span className="text-[#64CB81]">Take Back Control.</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl sm:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto"
          >
            Clinical-grade anxiety assessment. <span className="text-[#FFFDBD] font-semibold">No AI</span>. Real results. Under 20 minutes.
          </motion.p>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap justify-center gap-4 mb-10"
          >
            <div className="bg-[#096b17]/10 border border-[#096b17]/30 rounded-lg px-4 py-2 text-sm font-medium text-[#64CB81]">
              ✓ Clinical Grade
            </div>
            <div className="bg-[#096b17]/10 border border-[#096b17]/30 rounded-lg px-4 py-2 text-sm font-medium text-[#64CB81]">
              ✓ Privacy Protected
            </div>
            <div className="bg-[#096b17]/10 border border-[#096b17]/30 rounded-lg px-4 py-2 text-sm font-medium text-[#64CB81]">
              ✓ Instant Results
            </div>
            <div className="bg-[#096b17]/10 border border-[#096b17]/30 rounded-lg px-4 py-2 text-sm font-medium text-[#64CB81]">
              ✓ Strictly Non-AI
            </div>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button
              size="lg"
              onClick={() => setShowPayment(true)}
              className="bg-[#096b17] hover:bg-[#075110] text-white px-10 py-6 rounded-xl shadow-2xl hover:shadow-[#096b17]/50 transition-all duration-300 text-lg font-semibold min-w-[280px] h-auto"
            >
              Start Assessment - ₹299
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setShowSample(true)}
              className="bg-white/10 hover:bg-white/20 text-white border-2 border-white/30 px-10 py-6 rounded-xl transition-all duration-300 text-lg font-semibold min-w-[280px] h-auto backdrop-blur-sm"
            >
              See Sample Report
            </Button>
          </motion.div>

          {/* Social Proof */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-gray-400 mt-8 text-sm"
          >
            <span className="text-[#64CB81] font-semibold">5,234 people</span> have taken this assessment
          </motion.p>
        </motion.div>
      </div>

      {/* Modals */}
      <PaymentPopup open={showPayment} onClose={() => setShowPayment(false)} />
      <SampleReportModal open={showSample} onClose={() => setShowSample(false)} />
    </section>
  )
}
```

---

### 2. Trust Bar (Immediately After Hero)

**Elements:**
- Horizontal scrolling logos/text
- "Approved by certified mental health professionals"
- "Developed in collaboration with clinical psychologists"
- Trust badges with icons

```tsx
// components/landing/TrustBar.tsx
export function TrustBar() {
  return (
    <section className="bg-[#1a1a1a] border-y border-gray-800 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-wrap justify-center items-center gap-8 text-gray-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#64CB81]" />
            <span className="text-sm">Approved by Mental Health Experts</span>
          </div>
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-[#64CB81]" />
            <span className="text-sm">Clinical-Grade Assessment</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#64CB81]" />
            <span className="text-sm">Your Data is Private & Secure</span>
          </div>
        </div>
      </div>
    </section>
  )
}
```

---

### 3. What Is ALM Tool? (Features Grid)

**Goal:** Explain what the tool does and key benefits

**Layout:** 3-column grid (responsive to 1 column on mobile)

**Features to Highlight:**
1. **Map 6 Anxiety Loops**
   - Icon: Target/Map icon
   - Description: "Identify specific anxiety patterns: Anticipatory, Control-Seeking, Reassurance, Avoidance, Somatic Sensitivity, Cognitive Overload"

2. **Clinical Accuracy**
   - Icon: Microscope/Chart icon
   - Description: "Based on peer-reviewed anxiety research. Scored by certified professionals, not algorithms."

3. **Actionable Insights**
   - Icon: Lightbulb/Path icon
   - Description: "Get personalized recommendations and intervention strategies tailored to your anxiety loops."

4. **Privacy First**
   - Icon: Shield icon
   - Description: "Your responses are encrypted and never shared. Complete confidentiality guaranteed."

5. **Quick & Easy**
   - Icon: Clock icon
   - Description: "20 carefully designed questions. Complete in under 20 minutes from any device."

6. **Detailed Report**
   - Icon: FileText icon
   - Description: "Comprehensive PDF report with loop scores, interpretations, and next steps."

```tsx
// components/landing/FeaturesGrid.tsx
import { Target, Microscope, Lightbulb, Shield, Clock, FileText } from 'lucide-react'

const features = [
  {
    icon: Target,
    title: 'Map 6 Anxiety Loops',
    description: 'Identify specific anxiety patterns: Anticipatory, Control-Seeking, Reassurance, Avoidance, Somatic Sensitivity, Cognitive Overload',
  },
  // ... other features
]

export function FeaturesGrid() {
  return (
    <section className="bg-[#0a0a0a] py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4 font-manrope">
            What Is ALM Tool?
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            A clinical-grade assessment that identifies your unique anxiety patterns and provides actionable insights
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-8 hover:border-[#096b17] transition-all duration-300 group"
            >
              <div className="bg-[#096b17]/10 w-14 h-14 rounded-lg flex items-center justify-center mb-6 group-hover:bg-[#096b17]/20 transition-colors">
                <feature.icon className="w-7 h-7 text-[#64CB81]" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3 font-manrope">
                {feature.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

---

### 4. How It Works (Process Steps)

**Goal:** Demystify the assessment process

**Layout:** Horizontal timeline or vertical steps

**Steps:**
1. **Pay Securely (₹299)**
   - "One-time payment via Razorpay. All major payment methods accepted."

2. **Answer 20 Questions**
   - "Thoughtfully designed questions about your anxiety experiences. Takes 15-20 minutes."

3. **Get Instant Results**
   - "Detailed report with your anxiety loop scores and personalized interpretations."

4. **Take Action**
   - "Use insights to book targeted therapy sessions or self-manage with our recommendations."

**Visual:** Use numbered circles or icons for each step

---

### 5. Why Choose ALM? (Authority & Safety)

**Goal:** Build credibility and address objections

**Elements:**
- **No AI Involvement**
  - "Every response is reviewed and scored by certified mental health professionals, not algorithms. You deserve human expertise."

- **Clinical Foundation**
  - "Based on CBT (Cognitive Behavioral Therapy) principles and peer-reviewed anxiety research."

- **Privacy Guaranteed**
  - "Your responses are encrypted end-to-end. We never sell or share your data. See our Privacy Policy."

- **Instant Access**
  - "No appointments needed. Take the assessment on your schedule, from anywhere."

- **Money-Back Guarantee** (if applicable)
  - "Not satisfied? Full refund within 7 days, no questions asked."

**Visual Design:** Dark cards with icons, use checkmarks and shield imagery

---

### 6. Social Proof Section

**Goal:** Build trust through numbers and testimonials

**Elements:**

#### A. Counter Section
```tsx
// components/landing/SocialProof.tsx (Client Component for dynamic count)
'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export function SocialProof() {
  const [count, setCount] = useState(0)
  const targetCount = 5234 // Fetch from API in production

  useEffect(() => {
    let start = 0
    const duration = 2000
    const increment = targetCount / (duration / 16)

    const timer = setInterval(() => {
      start += increment
      if (start >= targetCount) {
        setCount(targetCount)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)

    return () => clearInterval(timer)
  }, [])

  return (
    <section className="bg-[#096b17] py-16">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <div className="text-6xl font-bold text-white mb-4 font-manrope">
            {count.toLocaleString()}+
          </div>
          <p className="text-2xl text-white/90">
            People have mapped their anxiety patterns with ALM Tool
          </p>
          <p className="text-white/70 mt-4">
            Join thousands who've taken the first step toward understanding their anxiety
          </p>
        </motion.div>
      </div>
    </section>
  )
}
```

#### B. Testimonials Carousel

**Design:** Cards with:
- User photo (real faces, get permission or use stock)
- Name + Age/Location
- Star rating (5/5)
- Quote highlighting impact
- Optional: Specific result ("Identified Control-Seeking loop, now in targeted therapy")

**Note:** Create testimonial cards on Canva with consistent branding

```tsx
// components/landing/Testimonials.tsx
const testimonials = [
  {
    name: 'Priya S.',
    age: 28,
    location: 'Mumbai',
    image: '/images/testimonials/priya.jpg',
    rating: 5,
    quote: 'The ALM Tool helped me understand my anxiety wasn\'t random. Identifying my Reassurance Loop was life-changing. I saved months of trial-and-error therapy.',
    result: 'Now in targeted CBT for reassurance-seeking behaviors',
  },
  // ... more testimonials
]

export function Testimonials() {
  return (
    <section className="bg-[#0a0a0a] py-24">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-white text-center mb-16 font-manrope">
          What Our Users Say
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-8"
            >
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold text-white">{testimonial.name}</div>
                  <div className="text-sm text-gray-400">{testimonial.age} • {testimonial.location}</div>
                </div>
              </div>

              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-[#64CB81] text-[#64CB81]" />
                ))}
              </div>

              <p className="text-gray-300 mb-4 italic">"{testimonial.quote}"</p>

              <div className="bg-[#096b17]/10 border border-[#096b17]/30 rounded-lg px-3 py-2 text-xs text-[#64CB81]">
                {testimonial.result}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

---

### 7. Use Cases Section

**Goal:** Show real-world impact and ROI

**Stories to Include:**

1. **Saved Money on Therapy**
   - "Rajesh spent ₹15,000 on general therapy before discovering his specific Avoidance Loop. ALM helped him find the right specialist."

2. **Faster Treatment**
   - "Ananya's therapist used her ALM report to design targeted interventions. She saw improvement in 4 weeks vs. 4 months."

3. **Self-Awareness**
   - "Vikram didn't know he needed help until ALM revealed his Cognitive Overload pattern. Now he practices specific coping strategies."

4. **Better Communication**
   - "Sneha shared her ALM report with her psychiatrist, leading to a medication adjustment that actually worked."

**Visual:** Icons + short descriptions, use real(ish) names

---

### 8. Sample Report Preview (Popup)

**Goal:** Remove uncertainty about what they're paying for

**Content:**
- Screenshot of actual report (PDF preview)
- Sections visible:
  - Your Loop Scores (bar chart)
  - Primary Loop: Anticipatory Anxiety (33%)
  - Secondary Loop: Control-Seeking (28%)
  - Interpretation paragraph
  - Recommended interventions
  - Next steps

**Implementation:**
```tsx
// components/landing/SampleReport.tsx
'use client'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import Image from 'next/image'

interface SampleReportModalProps {
  open: boolean
  onClose: () => void
}

export default function SampleReportModal({ open, onClose }: SampleReportModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#1a1a1a] border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white font-manrope">
            Sample ALM Report
          </DialogTitle>
          <p className="text-gray-400">
            Here's what you'll receive after completing the assessment
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Report Preview Images */}
          <div className="border border-gray-800 rounded-lg overflow-hidden">
            <Image
              src="/images/reports/sample-report-page-1.png"
              alt="Sample Report Page 1"
              width={800}
              height={1000}
              className="w-full"
            />
          </div>

          <div className="border border-gray-800 rounded-lg overflow-hidden">
            <Image
              src="/images/reports/sample-report-page-2.png"
              alt="Sample Report Page 2"
              width={800}
              height={1000}
              className="w-full"
            />
          </div>

          {/* CTA */}
          <div className="bg-[#096b17]/10 border border-[#096b17] rounded-lg p-6 text-center">
            <p className="text-white mb-4">Ready to get your personalized report?</p>
            <Button
              onClick={() => {
                onClose()
                // Open payment popup
              }}
              className="bg-[#096b17] hover:bg-[#075110] text-white px-8 py-3 rounded-xl"
            >
              Start Assessment - ₹299
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

---

### 9. Video Section

**Goal:** Explain complex concepts visually

**Videos to Include:**
1. **Explainer Video** (2-3 min)
   - What are anxiety loops?
   - How ALM identifies them
   - What to expect from the assessment

2. **Testimonial Video** (Optional)
   - User sharing their experience

3. **How to Use Your Report**
   - Quick guide on interpreting results

**Implementation:**
```tsx
// components/landing/VideoSection.tsx
'use client'
import { useState } from 'react'
import { Play } from 'lucide-react'

export function VideoSection() {
  const [activeVideo, setActiveVideo] = useState<string | null>(null)

  return (
    <section className="bg-[#1a1a1a] py-24">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-white text-center mb-16 font-manrope">
          See ALM Tool in Action
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Video 1: Explainer */}
          <div className="relative group cursor-pointer" onClick={() => setActiveVideo('explainer')}>
            <div className="aspect-video bg-gray-900 rounded-2xl overflow-hidden">
              {activeVideo === 'explainer' ? (
                <iframe
                  src="https://www.youtube.com/embed/YOUR_VIDEO_ID"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <>
                  <img
                    src="/images/video-thumbnails/explainer.jpg"
                    alt="Understanding Anxiety Loops"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="bg-[#096b17] rounded-full p-6 group-hover:scale-110 transition-transform">
                      <Play className="w-12 h-12 text-white fill-white" />
                    </div>
                  </div>
                </>
              )}
            </div>
            <h3 className="text-xl font-semibold text-white mt-4">Understanding Anxiety Loops</h3>
            <p className="text-gray-400 mt-2">Learn how anxiety patterns form and why mapping them matters</p>
          </div>

          {/* Video 2: How to Use Report */}
          <div className="relative group cursor-pointer" onClick={() => setActiveVideo('guide')}>
            {/* Similar structure */}
          </div>
        </div>
      </div>
    </section>
  )
}
```

---

### 10. FAQ Section (Optional but Recommended)

Common questions:
- How is this different from a regular therapy session?
- Is my data secure?
- Can I share my report with my therapist?
- What if I don't have anxiety? Will the test work?
- How long are results valid?

---

### 11. Final CTA Section

**Goal:** One last push to convert

**Design:**
- Dark green gradient background
- Large headline: "Ready to Understand Your Anxiety?"
- Subheadline: "5,234 people have already started their journey"
- Large CTA button (no distractions around it)
- Trust elements below: "Money-back guarantee" | "Instant access" | "Privacy protected"

```tsx
// components/landing/CTASection.tsx
export function CTASection() {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 gradient-dark-green" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 font-manrope">
            Ready to Understand Your Anxiety?
          </h2>
          <p className="text-xl text-white/80 mb-10">
            Join 5,234+ people who've mapped their anxiety patterns
          </p>

          {/* LARGE CTA - No other buttons nearby */}
          <div className="flex justify-center mb-10">
            <Button
              size="lg"
              onClick={() => {/* Open payment */}}
              className="bg-[#FFFDBD] hover:bg-white text-[#096b17] px-16 py-8 rounded-2xl shadow-2xl hover:shadow-[#FFFDBD]/50 transition-all duration-300 text-2xl font-bold min-w-[320px] h-auto"
            >
              Start Assessment - ₹299
            </Button>
          </div>

          {/* Trust elements */}
          <div className="flex flex-wrap justify-center gap-6 text-white/70 text-sm">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span>Instant Access</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span>Privacy Protected</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              <span>Secure Payment</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
```

---

### 12. Floating CTA Button

**Goal:** Always visible, drives action

**Behavior:**
- Sticks to bottom on mobile, bottom-right on desktop
- Shows when user scrolls past hero
- Finger-friendly size (min 48px height)
- No competing buttons nearby

```tsx
// components/landing/FloatingCTA.tsx
'use client'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export function FloatingCTA() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 600)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!visible) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5">
      <Button
        size="lg"
        onClick={() => {/* Open payment */}}
        className="bg-[#096b17] hover:bg-[#075110] text-white px-8 py-6 rounded-full shadow-2xl hover:shadow-[#096b17]/50 transition-all duration-300 text-lg font-semibold flex items-center gap-2 min-h-[56px]"
      >
        Start Assessment
        <ArrowRight className="w-5 h-5" />
      </Button>
    </div>
  )
}
```

---

### 13. Footer

Standard footer with:
- Company info
- Links (Privacy Policy, Terms, Contact)
- Social media icons
- Copyright

---

## 🚀 Performance Optimization Strategy

### Goal: < 3 Second Load Time

#### 1. Next.js 15 Optimizations

```typescript
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React compiler
  experimental: {
    reactCompiler: true,
    ppr: true, // Partial Prerendering
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year
  },

  // Compression
  compress: true,

  // Production optimizations
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Bundle analyzer (dev only)
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config) => {
      config.plugins.push(
        new (require('@next/bundle-analyzer'))({
          enabled: true,
        })
      )
      return config
    },
  }),
}

export default nextConfig
```

#### 2. Image Optimization Checklist

```bash
# Convert all images to WebP/AVIF
pnpm install sharp

# Optimize before adding to /public
- Hero background: max 1920x1080, WebP, quality 80
- Testimonial photos: 256x256, WebP, quality 85
- Trust badges: SVG preferred, or PNG optimized
- Sample report screenshots: 1200px width max, WebP, quality 75
```

**Usage:**
```tsx
import Image from 'next/image'

<Image
  src="/images/hero-bg.webp"
  alt="Hero background"
  fill
  priority // Only for above-the-fold images
  quality={80}
  placeholder="blur"
  blurDataURL="data:image/..." // Generate with plaiceholder library
/>
```

#### 3. Font Optimization

```typescript
// app/layout.tsx
import { Inter, Manrope } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap', // Critical for performance
  preload: true,
})

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
  preload: true,
  weight: ['600', '700'], // Only load needed weights
})
```

#### 4. Code Splitting Strategy

```tsx
// app/page.tsx
import { Hero } from '@/components/landing/Hero' // Above fold - normal import
import { TrustBar } from '@/components/landing/TrustBar' // Above fold
import dynamic from 'next/dynamic'

// Below-the-fold components - lazy load
const FeaturesGrid = dynamic(() => import('@/components/landing/FeaturesGrid'))
const Testimonials = dynamic(() => import('@/components/landing/Testimonials'))
const VideoSection = dynamic(() => import('@/components/landing/VideoSection'))
const UseCases = dynamic(() => import('@/components/landing/UseCases'))

// Heavy client components - lazy load with no SSR
const PaymentPopup = dynamic(
  () => import('@/components/landing/PaymentPopup'),
  { ssr: false }
)
const SampleReportModal = dynamic(
  () => import('@/components/landing/SampleReport'),
  { ssr: false }
)
```

#### 5. CSS Optimization

```css
/* globals.css */

/* Critical CSS - inline in <head> */
@layer base {
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body {
    font-family: var(--font-inter), system-ui, sans-serif;
    background: #0a0a0a;
    color: #e5e5e5;
  }
}

/* Defer non-critical CSS */
@layer components {
  /* Component styles */
}

@layer utilities {
  /* Utility classes */
}
```

**Tailwind Config:**
```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)'],
        manrope: ['var(--font-manrope)'],
      },
      colors: {
        primary: {
          900: '#053d0b',
          700: '#075110',
          500: '#096b17',
          300: '#64CB81',
        },
        beige: '#FFFDBD',
        cream: '#F5F5DC',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
```

#### 6. Analytics Optimization

```tsx
// app/layout.tsx
import Script from 'next/script'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://checkout.razorpay.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
      </head>
      <body>
        {children}

        {/* Load analytics after page interactive */}
        <Script
          id="gtm"
          strategy="afterInteractive" // Not "lazyOnload" for marketing pages
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-XXXXXX');
            `,
          }}
        />
      </body>
    </html>
  )
}
```

#### 7. Animation Performance

```tsx
// Use CSS animations for simple transitions
// Use Framer Motion only for complex interactions

// Good: CSS animation (GPU-accelerated)
className="transition-transform duration-300 hover:scale-105"

// Better for complex: Framer Motion with layoutId
<motion.div
  layoutId="card"
  transition={{ duration: 0.3, ease: 'easeOut' }}
>

// Avoid: Animating expensive properties (width, height, top, left)
// Prefer: transform, opacity
```

#### 8. Third-Party Script Management

```tsx
// lib/razorpay.ts
let razorpayLoaded = false

export function loadRazorpay(): Promise<void> {
  if (razorpayLoaded) return Promise.resolve()

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => {
      razorpayLoaded = true
      resolve()
    }
    script.onerror = reject
    document.body.appendChild(script)
  })
}

// Only load when payment popup opens
const handlePayment = async () => {
  await loadRazorpay()
  // Initialize Razorpay
}
```

#### 9. Caching Strategy

```typescript
// app/api/[...]/route.ts
export async function GET() {
  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
```

#### 10. Performance Monitoring

```typescript
// app/layout.tsx
export const metadata = {
  metadataBase: new URL('https://alm.curago.health'),
  title: 'CuraGo ALM Tool 1.0 - Map Your Anxiety Patterns',
  description: 'Clinical-grade anxiety assessment. Identify your unique anxiety loops. No AI. Real results.',
  openGraph: {
    images: ['/og-image.png'],
  },
}

// Add Web Vitals tracking
// app/web-vitals.tsx
'use client'

import { useReportWebVitals } from 'next/web-vitals'

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Send to analytics
    window.gtag?.('event', metric.name, {
      value: Math.round(metric.value),
      event_label: metric.id,
      non_interaction: true,
    })
  })
}
```

---

## 🎯 CRO (Conversion Rate Optimization)

### 1. Eye Candy Checklist

✅ **Visual Polish:**
- Use high-quality images (testimonials, badges, report screenshots)
- Consistent color scheme (dark theme + green accents)
- Ample whitespace (don't cram content)
- Smooth animations (Framer Motion)
- Premium feel (rounded corners, shadows, gradients)

✅ **Images to Create:**
- Hero background (dark gradient with subtle pattern)
- 6-10 testimonial photos (diverse faces, smiling)
- Trust badges (design on Canva):
  - "Clinical Grade"
  - "Non-AI Verified"
  - "Privacy Protected"
  - "Approved by Mental Health Experts"
- Sample report screenshots (2-3 pages)
- Use case illustrations (icons or simple graphics)

### 2. Safety & Trust Elements

✅ **"Your Photo & Video" Reassurance:**
- Add section: "Your Privacy Matters"
  - "We never ask for photos or videos"
  - "Only answer questions about your experiences"
  - "Your responses are encrypted and confidential"

✅ **Test & Report Screenshots:**
- Show actual test questions (blur answers)
- Display full sample report (watermarked "SAMPLE")
- Include chart/graph visualizations

✅ **Razorpay Acknowledgment:**
Before payment popup closes:
```tsx
<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
  <p className="text-sm text-blue-900">
    ✓ Payment processed securely by Razorpay
  </p>
  <p className="text-xs text-blue-700 mt-1">
    Your payment information is encrypted and never stored on our servers
  </p>
</div>
```

### 3. Sample Report Popup

```tsx
// components/landing/SampleReport.tsx
// (Code provided above in Section #8)
```

### 4. Offer & CTA Optimization

✅ **Clear Offer:**
- Headline: "Get Your Anxiety Loop Map for ₹299"
- Subheadline: "One-time payment. Instant access. Lifetime report access."
- Show what's included:
  - ✓ 20-question clinical assessment
  - ✓ Detailed PDF report
  - ✓ Loop scores and interpretations
  - ✓ Personalized recommendations
  - ✓ Shareable with therapist

✅ **CTA Button Best Practices:**
```tsx
// PRIMARY CTA (Main conversion point)
<Button className="
  bg-[#096b17]           /* Brand color */
  hover:bg-[#075110]     /* Darker on hover */
  text-white
  px-16 py-8             /* Large, finger-friendly */
  rounded-2xl            /* Premium feel */
  shadow-2xl             /* Stands out */
  text-2xl font-bold     /* Readable from distance */
  min-h-[64px]           /* Touch target >= 48px */
  min-w-[320px]          /* Prominent */

  /* Ensure no other buttons within 80px radius on mobile */
  /* Place in center of section with ample margin */
">
  Start Assessment - ₹299
</Button>

// SECONDARY CTA (Informational)
<Button variant="outline" className="
  bg-transparent
  border-2 border-white/30
  text-white
  px-8 py-4
  rounded-xl
  /* Visually distinct from primary */
">
  See Sample Report
</Button>
```

**CTA Placement:**
1. Hero (above fold) - Primary
2. After "How It Works" section - Primary
3. Final CTA section - Primary (LARGEST)
4. Floating button - Primary (when scrolled)

**No competing buttons near CTAs:**
- Minimum 80px spacing on mobile
- No secondary actions in same visual group
- Exception: "See Sample Report" secondary CTA is okay if clearly distinct

### 5. Social Proof Display

```tsx
// Animated counter (code in Section #6)
// Static testimonials (code in Section #6)

// Additional: "Live" activity feed (optional)
<div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4 max-w-md mx-auto">
  <div className="flex items-center gap-3">
    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
    <p className="text-sm text-gray-300">
      <span className="font-semibold text-white">Amit from Delhi</span> just completed their assessment
    </p>
  </div>
  <p className="text-xs text-gray-500 mt-1">2 minutes ago</p>
</div>
```

### 6. Testimonials Best Practices

**Design on Canva:**
- Template: 800x600px card
- Background: Dark gradient matching site
- User photo: Circular, 120x120px
- Name + location below photo
- 5-star rating (yellow stars)
- Quote in quotation marks, 2-3 lines max
- Optional: Small badge showing their primary loop

**Authenticity Tips:**
- Use real names (first name + last initial)
- Include age/location for relatability
- Mix genders, ages, cities
- Quotes should be specific, not generic
  - ✅ "Identifying my Control-Seeking loop saved me ₹8,000 in wrong therapy"
  - ❌ "Great tool, very helpful!"

### 7. Trust Badges & Claims

**Phrases to Use:**
- "Approved by certified mental health professionals"
- "Strictly non-AI involved - human expertise only"
- "Based on peer-reviewed CBT research"
- "Used by 5,000+ individuals across India"
- "Trusted by therapists and psychiatrists"
- "Privacy-first: Your data is never sold"

**Badge Design:**
```tsx
<div className="flex flex-wrap justify-center gap-4">
  <div className="flex items-center gap-2 bg-[#096b17]/10 border border-[#096b17] rounded-lg px-4 py-2">
    <ShieldCheck className="w-5 h-5 text-[#64CB81]" />
    <span className="text-sm font-medium text-[#64CB81]">Clinical Grade</span>
  </div>

  <div className="flex items-center gap-2 bg-[#096b17]/10 border border-[#096b17] rounded-lg px-4 py-2">
    <Users className="w-5 h-5 text-[#64CB81]" />
    <span className="text-sm font-medium text-[#64CB81]">No AI Involved</span>
  </div>

  {/* More badges... */}
</div>
```

### 8. Use Cases Section (Detailed)

```tsx
// components/landing/UseCases.tsx
const useCases = [
  {
    icon: TrendingDown,
    title: 'Saved ₹12,000 on Therapy',
    story: 'Rajesh spent months in general therapy before ALM revealed his Reassurance-Seeking loop. His therapist tailored treatment, cutting his therapy duration in half.',
    metric: '6 months → 3 months',
    image: '/images/use-cases/money-saved.jpg',
  },
  {
    icon: Clock,
    title: 'Faster Results',
    story: 'Ananya\'s therapist used her ALM report to skip the "discovery phase" and immediately address her Avoidance patterns. She saw improvement in weeks.',
    metric: '4 months → 4 weeks',
    image: '/images/use-cases/faster-treatment.jpg',
  },
  {
    icon: Lightbulb,
    title: 'Finally Understood Myself',
    story: 'Vikram didn\'t realize his "overthinking" was Cognitive Overload. ALM gave him language to describe his anxiety and specific coping strategies.',
    metric: 'From confusion to clarity',
    image: '/images/use-cases/self-awareness.jpg',
  },
  {
    icon: MessageCircle,
    title: 'Better Doctor Communication',
    story: 'Sneha shared her ALM report with her psychiatrist, leading to a medication adjustment that finally worked for her Somatic Sensitivity.',
    metric: 'Found the right treatment',
    image: '/images/use-cases/communication.jpg',
  },
]

export function UseCases() {
  return (
    <section className="bg-[#0a0a0a] py-24">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-white text-center mb-4 font-manrope">
          Real Results from Real People
        </h2>
        <p className="text-xl text-gray-400 text-center mb-16 max-w-3xl mx-auto">
          See how ALM Tool has helped thousands understand their anxiety and take effective action
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {useCases.map((useCase, index) => (
            <motion.div
              key={useCase.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#1a1a1a] border border-gray-800 rounded-2xl overflow-hidden group hover:border-[#096b17] transition-all duration-300"
            >
              {/* Image */}
              <div className="aspect-video bg-gray-900 overflow-hidden">
                <img
                  src={useCase.image}
                  alt={useCase.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-[#096b17]/10 w-12 h-12 rounded-lg flex items-center justify-center">
                    <useCase.icon className="w-6 h-6 text-[#64CB81]" />
                  </div>
                  <h3 className="text-xl font-semibold text-white font-manrope">
                    {useCase.title}
                  </h3>
                </div>

                <p className="text-gray-300 leading-relaxed mb-4">
                  {useCase.story}
                </p>

                <div className="bg-[#096b17]/10 border border-[#096b17]/30 rounded-lg px-4 py-2 inline-block">
                  <p className="text-sm font-semibold text-[#64CB81]">
                    {useCase.metric}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

---

## 🔧 Implementation Roadmap

### Phase 1: Project Setup (Day 1)

```bash
# Create Next.js 15 project
pnpm create next-app@latest alm-landing --typescript --tailwind --app --use-pnpm

cd alm-landing

# Install dependencies
pnpm add framer-motion lucide-react react-hook-form recharts
pnpm add -D @next/bundle-analyzer sharp

# Install shadcn/ui
pnpm dlx shadcn@latest init

# Add required shadcn components
pnpm dlx shadcn@latest add button card dialog badge input label
```

### Phase 2: Design System & Layout (Day 1-2)

- [ ] Set up color variables in `globals.css`
- [ ] Configure Tailwind with brand colors
- [ ] Set up Google Fonts (Inter, Manrope)
- [ ] Create root layout with analytics
- [ ] Build Navbar component
- [ ] Build Footer component
- [ ] Create base page structure

### Phase 3: Landing Page Sections (Day 2-4)

**Day 2:**
- [ ] Hero section with CTAs
- [ ] Trust bar
- [ ] Features grid

**Day 3:**
- [ ] How It Works section
- [ ] Why Choose ALM section
- [ ] Social proof counter
- [ ] Testimonials section

**Day 4:**
- [ ] Use cases section
- [ ] Video section
- [ ] FAQ section (optional)
- [ ] Final CTA section
- [ ] Floating CTA button

### Phase 4: Interactive Components (Day 4-5)

**Day 4:**
- [ ] Payment popup modal
  - Razorpay integration
  - Payment acknowledgment
  - Error handling
- [ ] Sample report modal

**Day 5:**
- [ ] Video player functionality
- [ ] Form validation
- [ ] Analytics tracking setup
- [ ] GTM integration

### Phase 5: Content Creation (Day 5-6)

**Design Assets (Canva):**
- [ ] Testimonial cards (6-10)
- [ ] Trust badges (4-6)
- [ ] Use case images (4)
- [ ] Sample report screenshots (2-3 pages)
- [ ] OG image for social sharing

**Content Writing:**
- [ ] All copy for sections
- [ ] Meta descriptions
- [ ] FAQ answers

### Phase 6: Performance Optimization (Day 6-7)

- [ ] Optimize all images (WebP conversion)
- [ ] Implement lazy loading
- [ ] Set up dynamic imports
- [ ] Configure caching headers
- [ ] Add blur placeholders for images
- [ ] Test on slow 3G connection
- [ ] Run Lighthouse audit
- [ ] Optimize bundle size

### Phase 7: Testing & QA (Day 7)

- [ ] Mobile responsiveness (all breakpoints)
- [ ] Cross-browser testing (Chrome, Safari, Firefox)
- [ ] Payment flow testing
- [ ] Analytics event testing
- [ ] Form validation testing
- [ ] Accessibility audit (a11y)
- [ ] Performance testing (target: < 3s load)

### Phase 8: Deployment (Day 7-8)

```bash
# Build for production
pnpm build

# Analyze bundle
ANALYZE=true pnpm build

# Deploy to Vercel
pnpm dlx vercel --prod

# Or deploy to custom server
# (Docker + Nginx setup if needed)
```

**Post-Deployment:**
- [ ] Set up custom domain (alm.curago.health)
- [ ] Configure SSL certificate
- [ ] Set up monitoring (Vercel Analytics or custom)
- [ ] Configure CDN caching
- [ ] Test production build performance
- [ ] Submit sitemap to Google
- [ ] Set up Google Search Console

---

## 💻 Code Examples

### Complete App Structure

```typescript
// app/layout.tsx
import type { Metadata } from 'next'
import { Inter, Manrope } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
  weight: ['600', '700'],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://alm.curago.health'),
  title: 'CuraGo ALM Tool 1.0 - Map Your Anxiety Patterns | Clinical Anxiety Assessment',
  description: 'Clinical-grade anxiety loop mapping assessment. Identify your unique anxiety patterns with expert-validated testing. No AI. Real results. Under 20 minutes.',
  keywords: ['anxiety assessment', 'anxiety test', 'mental health', 'clinical assessment', 'anxiety patterns', 'CuraGo'],
  openGraph: {
    title: 'CuraGo ALM Tool 1.0 - Map Your Anxiety Patterns',
    description: 'Clinical-grade anxiety assessment. Identify your unique anxiety loops. No AI. Real results.',
    images: ['/og-image.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CuraGo ALM Tool 1.0',
    description: 'Map your anxiety patterns with clinical-grade assessment',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable}`}>
      <head>
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://checkout.razorpay.com" />
      </head>
      <body className="font-sans antialiased">
        {children}

        {/* Google Tag Manager */}
        <Script
          id="gtm"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-XXXXXX');
            `,
          }}
        />
      </body>
    </html>
  )
}
```

```typescript
// app/page.tsx
import { Hero } from '@/components/landing/Hero'
import { TrustBar } from '@/components/landing/TrustBar'
import dynamic from 'next/dynamic'

// Lazy load below-the-fold components
const FeaturesGrid = dynamic(() => import('@/components/landing/FeaturesGrid'))
const HowItWorks = dynamic(() => import('@/components/landing/HowItWorks'))
const SocialProof = dynamic(() => import('@/components/landing/SocialProof'))
const Testimonials = dynamic(() => import('@/components/landing/Testimonials'))
const UseCases = dynamic(() => import('@/components/landing/UseCases'))
const VideoSection = dynamic(() => import('@/components/landing/VideoSection'))
const CTASection = dynamic(() => import('@/components/landing/CTASection'))
const FloatingCTA = dynamic(() => import('@/components/landing/FloatingCTA'), { ssr: false })

export default function ALMHomePage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Hero />
      <TrustBar />
      <FeaturesGrid />
      <HowItWorks />
      <SocialProof />
      <Testimonials />
      <UseCases />
      <VideoSection />
      <CTASection />
      <FloatingCTA />
    </main>
  )
}
```

### Payment Integration

```typescript
// lib/razorpay.ts
let razorpayLoaded = false

export function loadRazorpay(): Promise<void> {
  if (razorpayLoaded) return Promise.resolve()

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => {
      razorpayLoaded = true
      resolve()
    }
    script.onerror = reject
    document.body.appendChild(script)
  })
}

export interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  handler: (response: any) => void
  prefill: {
    name: string
    email: string
    contact: string
  }
  theme: {
    color: string
  }
}

export function openRazorpay(options: RazorpayOptions) {
  const rzp = new (window as any).Razorpay(options)
  rzp.open()
}
```

```typescript
// app/api/razorpay/route.ts
import { NextResponse } from 'next/server'
import Razorpay from 'razorpay'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST(req: Request) {
  try {
    const { amount, currency = 'INR' } = await req.json()

    const order = await razorpay.orders.create({
      amount: amount * 100, // Convert to paise
      currency,
      receipt: `receipt_${Date.now()}`,
    })

    return NextResponse.json({ orderId: order.id })
  } catch (error) {
    console.error('Razorpay order creation failed:', error)
    return NextResponse.json(
      { error: 'Order creation failed' },
      { status: 500 }
    )
  }
}
```

```tsx
// components/landing/PaymentPopup.tsx
'use client'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { loadRazorpay, openRazorpay } from '@/lib/razorpay'
import { useRouter } from 'next/navigation'

interface PaymentPopupProps {
  open: boolean
  onClose: () => void
}

export default function PaymentPopup({ open, onClose }: PaymentPopupProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  })
  const router = useRouter()

  const handlePayment = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      alert('Please fill all fields')
      return
    }

    setLoading(true)

    try {
      // Load Razorpay script
      await loadRazorpay()

      // Create order
      const response = await fetch('/api/razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 299, currency: 'INR' }),
      })

      const { orderId } = await response.json()

      // Open Razorpay checkout
      openRazorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: 299 * 100,
        currency: 'INR',
        name: 'CuraGo Health',
        description: 'ALM Tool 1.0 Assessment',
        order_id: orderId,
        handler: async (response) => {
          // Payment successful
          console.log('Payment successful:', response)

          // Track event
          window.dataLayer?.push({
            event: 'purchase',
            value: 299,
            currency: 'INR',
            transaction_id: response.razorpay_payment_id,
          })

          // Redirect to assessment
          router.push(`/assessment?payment_id=${response.razorpay_payment_id}`)
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: '#096b17',
        },
      })
    } catch (error) {
      console.error('Payment failed:', error)
      alert('Payment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-[#1a1a1a] border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white font-manrope">
            Start Your Assessment
          </DialogTitle>
          <p className="text-gray-400">
            Complete payment to begin the ALM assessment
          </p>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Acknowledgment Box */}
          <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-300 mb-2">Before you proceed:</p>
            <ul className="text-xs text-blue-200 space-y-1">
              <li>✓ Payment is processed securely by Razorpay</li>
              <li>✓ Your data is encrypted and confidential</li>
              <li>✓ You'll get instant access after payment</li>
              <li>✓ Report is valid for lifetime access</li>
            </ul>
          </div>

          {/* Form */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="name" className="text-white">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your full name"
                className="bg-[#0a0a0a] border-gray-700 text-white"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your@email.com"
                className="bg-[#0a0a0a] border-gray-700 text-white"
              />
            </div>

            <div>
              <Label htmlFor="phone" className="text-white">WhatsApp Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 XXXXX XXXXX"
                className="bg-[#0a0a0a] border-gray-700 text-white"
              />
            </div>
          </div>

          {/* Price */}
          <div className="bg-[#096b17]/10 border border-[#096b17] rounded-lg p-4 text-center">
            <p className="text-gray-400 text-sm">Total Amount</p>
            <p className="text-4xl font-bold text-[#64CB81] font-manrope">₹299</p>
            <p className="text-xs text-gray-500 mt-1">One-time payment • Lifetime access</p>
          </div>

          {/* CTA */}
          <Button
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-[#096b17] hover:bg-[#075110] text-white py-6 text-lg font-semibold"
          >
            {loading ? 'Processing...' : 'Proceed to Payment'}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            By proceeding, you agree to our Terms & Privacy Policy
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

### Analytics Tracking

```typescript
// lib/tracking.ts
declare global {
  interface Window {
    dataLayer?: any[]
  }
}

export function trackPageView(pageName: string, title?: string) {
  window.dataLayer?.push({
    event: 'page_view',
    page_name: pageName,
    page_title: title || document.title,
  })
}

export function trackButtonClick(label: string, category: string = 'engagement') {
  window.dataLayer?.push({
    event: 'button_click',
    button_label: label,
    event_category: category,
  })
}

export function trackCTAClick(ctaLocation: string) {
  window.dataLayer?.push({
    event: 'cta_click',
    cta_location: ctaLocation,
  })
}

export function trackPaymentInitiated(amount: number) {
  window.dataLayer?.push({
    event: 'begin_checkout',
    value: amount,
    currency: 'INR',
  })
}

export function trackPaymentSuccess(paymentId: string, amount: number) {
  window.dataLayer?.push({
    event: 'purchase',
    transaction_id: paymentId,
    value: amount,
    currency: 'INR',
  })
}

export function trackModalOpen(modalName: string) {
  window.dataLayer?.push({
    event: 'modal_open',
    modal_name: modalName,
  })
}

export function trackVideoPlay(videoTitle: string) {
  window.dataLayer?.push({
    event: 'video_play',
    video_title: videoTitle,
  })
}
```

---

## 🚀 Deployment Strategy

### Option 1: Vercel (Recommended for Next.js)

```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard:
# - RAZORPAY_KEY_ID
# - RAZORPAY_KEY_SECRET
# - NEXT_PUBLIC_RAZORPAY_KEY_ID
# - GTM_ID
```

**Advantages:**
- Automatic CI/CD
- Global CDN
- Edge functions
- Analytics built-in
- Zero config needed

### Option 2: Custom Server (Docker + Nginx)

```dockerfile
# Dockerfile
FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable pnpm && pnpm build

# Production
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

```nginx
# nginx.conf
server {
    listen 80;
    server_name alm.curago.health;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Static assets caching
    location /_next/static/ {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## 📊 Success Metrics

### Performance Targets

- **Lighthouse Score:** > 90 (all categories)
- **First Contentful Paint (FCP):** < 1.5s
- **Largest Contentful Paint (LCP):** < 2.5s
- **Time to Interactive (TTI):** < 3s
- **Total Blocking Time (TBT):** < 200ms
- **Cumulative Layout Shift (CLS):** < 0.1

### Conversion Targets

- **Landing → Payment Popup:** > 15%
- **Payment Popup → Completed Payment:** > 40%
- **Overall Conversion Rate:** > 6%

### Tracking Setup

```typescript
// Track key events:
1. Page load
2. Scroll depth (25%, 50%, 75%, 100%)
3. CTA clicks (by location)
4. Sample report opens
5. Payment initiated
6. Payment completed
7. Video plays
8. Time on page
```

---

## 🎨 Placeholder Strategy

For elements you don't have yet:

```tsx
// Placeholder components
export function PlaceholderTestimonial() {
  return (
    <div className="bg-[#1a1a1a] border-2 border-dashed border-gray-700 rounded-2xl p-8 text-center">
      <div className="w-16 h-16 bg-gray-800 rounded-full mx-auto mb-4" />
      <p className="text-gray-500 italic">[Testimonial placeholder]</p>
      <p className="text-xs text-gray-600 mt-2">Design in Canva, then replace</p>
    </div>
  )
}

export function PlaceholderVideo() {
  return (
    <div className="aspect-video bg-gray-900 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-700">
      <div className="text-center">
        <Play className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-500">[Video placeholder]</p>
        <p className="text-xs text-gray-600 mt-2">Upload explainer video</p>
      </div>
    </div>
  )
}
```

---

## ✅ Final Checklist

### Before Launch

- [ ] All sections implemented
- [ ] All images optimized (WebP)
- [ ] Payment flow tested
- [ ] Analytics working
- [ ] Mobile responsive
- [ ] Cross-browser tested
- [ ] Lighthouse score > 90
- [ ] Load time < 3s
- [ ] SEO meta tags complete
- [ ] OG image created
- [ ] Privacy policy linked
- [ ] Terms & conditions linked
- [ ] Contact information correct
- [ ] Razorpay credentials configured
- [ ] GTM container published
- [ ] Error tracking set up (Sentry optional)
- [ ] 404 page created
- [ ] Favicon added
- [ ] Security headers configured
- [ ] HTTPS enabled
- [ ] DNS configured
- [ ] Backup strategy in place

---

## 📚 Resources

### Design
- **Canva:** https://canva.com (testimonials, badges)
- **Unsplash:** https://unsplash.com (stock photos if needed)
- **Lucide Icons:** https://lucide.dev

### Development
- **Next.js Docs:** https://nextjs.org/docs
- **Tailwind CSS:** https://tailwindcss.com/docs
- **shadcn/ui:** https://ui.shadcn.com
- **Framer Motion:** https://www.framer.com/motion

### Tools
- **Lighthouse:** Chrome DevTools
- **WebPageTest:** https://www.webpagetest.org
- **Bundle Analyzer:** @next/bundle-analyzer
- **ImageOptim:** https://imageoptim.com

---

## 🎯 Summary

This specification provides a complete blueprint for building the CuraGo ALM Tool 1.0 landing page with:

✅ **Next.js 15** - Latest framework with App Router
✅ **< 3 second load time** - Performance-first architecture
✅ **Dark theme** - Consistent with brand
✅ **Trust elements** - Non-AI, clinical-grade, privacy-focused
✅ **CRO optimized** - Every section designed for conversion
✅ **Payment integration** - Razorpay with acknowledgments
✅ **Social proof** - Testimonials, counters, use cases
✅ **Sample report** - Transparent preview
✅ **Video content** - Explainer and educational
✅ **Mobile-first** - Responsive across all devices

Follow the roadmap sequentially, use the code examples, and create placeholder components for missing assets. You can build this in 7-8 days following the phase breakdown.

**Good luck building an amazing landing page!** 🚀
