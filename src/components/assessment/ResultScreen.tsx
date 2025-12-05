// src/components/assessment/ResultScreen.tsx
import React, { useMemo, useRef, useState, FormEvent, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import RadarChartComponent from './RadarChart';
import {
  Eye,
  Brain,
  Scale,
  Target,
  TrendingUp,
  TrendingDown,
  MessageCircle,
  RefreshCw,
  Copy as CopyIcon,
  Check as CheckIcon,
  User,
  Mail,
  Phone,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { AuraScores, UserInfo } from '../../types/aura';
import { trackButtonClick } from '../../utils/tracking';
import { FloatingButtons } from '../FloatingButtons';

interface ResultScreenProps {
  scores: AuraScores;
  userInfo: UserInfo;
  onRetake: () => void;
}

type PillarKey = 'awareness' | 'understanding' | 'regulation' | 'alignment';

const BRAND = '#096b17';
const WEBHOOK = 'https://server.wylto.com/webhook/oFClXjgvHUCq5l0qpU';
const SITE_BASE = 'https://curago.in';

// ---------- tiny helpers ----------
function simpleHash(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  const base36 = Math.abs(h).toString(36);
  return base36.slice(0, 6).padEnd(6, '0');
}
const now = () => Date.now();
const secs = (ms: number) => Math.round(ms / 1000);

const dlPush = (obj: Record<string, any>) => {
  try {
    // GTM DataLayer
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push({
      page_path: window.location.pathname + window.location.search + window.location.hash,
      timestamp: new Date().toISOString(),
      ...obj,
    });
    
    // Meta Pixel equivalent
    if ((window as any).fbq && obj.event) {
      const eventName = obj.event.replace('aura_results_', '').replace('aura_', '');
      const metaEventName = `AURA_${eventName.charAt(0).toUpperCase() + eventName.slice(1)}`;
      
      (window as any).fbq('trackCustom', metaEventName, {
        aura_event_id: obj.aura_event_id,
        event_type: obj.event,
        page_path: window.location.pathname,
        timestamp: new Date().toISOString(),
        ...obj,
      });
      
      console.log('✅ Meta Pixel: AURA event sent -', metaEventName, obj.aura_event_id);
    }
    
    // console.debug('[DL]', obj);
  } catch (e) {
    console.warn('❌ Tracking error:', e);
  }
};

const pillarMeta: Record<
  PillarKey,
  { name: string; desc: string; Icon: React.ComponentType<any> }
> = {
  awareness: { name: 'Awareness', desc: 'Observing & naming feelings', Icon: Eye },
  understanding: { name: 'Understanding', desc: 'Knowing why emotions arise', Icon: Brain },
  regulation: { name: 'Regulation', desc: 'Managing responses & recovery', Icon: Scale },
  alignment: { name: 'Alignment', desc: 'Syncing thought, emotion & action', Icon: Target },
};

const getLabel = (s: number) =>
  s >= 80
    ? 'Exceptional & Thriving'
    : s >= 70
      ? 'Balanced & Reflective'
      : s >= 60
        ? 'Growing & Aware'
        : s >= 50
          ? 'Developing & Learning'
          : 'Beginning Your Journey';

function pillarLabel(score: number) {
  if (score >= 80) return 'Strength';
  if (score >= 70) return 'Doing well';
  if (score >= 60) return 'Stable';
  if (score >= 50) return 'Needs attention';
  return 'Priority area';
}

function tipForPillar(k: PillarKey): string[] {
  switch (k) {
    case 'awareness':
      return [
        'Do a 3× daily “Feelings Check”: 60 seconds to name your top emotion + intensity.',
        'Use the “RAIN” micro-pause: Recognize → Allow → Investigate → Note.',
      ];
    case 'understanding':
      return [
        'Journal triggers with: Situation → Thought → Feeling → Outcome.',
        'Label cognitive patterns (e.g., all-or-nothing) when you spot them.',
      ];
    case 'regulation':
      return [
        'Practice 4-7-8 breathing for 2 minutes after stressful events.',
        'Schedule a daily 10-minute recovery ritual (walk, stretch, music).',
      ];
    case 'alignment':
      return [
        'Set one values-aligned micro-goal each morning; review at night.',
        'Do an evening integrity audit: Did actions match intent? Why/why not?',
      ];
    default:
      return [];
  }
}

function sevenDayPlan(lowest: PillarKey, secondLowest: PillarKey) {
  return [
    { day: 'Day 1–2', focus: pillarMeta[lowest].name, actions: tipForPillar(lowest).slice(0, 2) },
    { day: 'Day 3–4', focus: pillarMeta[secondLowest].name, actions: tipForPillar(secondLowest).slice(0, 2) },
    { day: 'Day 5', focus: 'Combine', actions: ['Pair both practices for 15 min.'] },
    { day: 'Day 6', focus: 'Reflection', actions: ['Journal: What improved? What still feels hard?'] },
    { day: 'Day 7', focus: 'Plan Ahead', actions: ['Pick 2 habits to keep next week.'] },
  ];
}

function formatWhatsAppMessage(
  name: string,
  scores: AuraScores,
  highest: PillarKey,
  lowest: PillarKey,
  quickTips: string[],
) {
  const nl = '\n';
  const hi = pillarMeta[highest].name;
  const lo = pillarMeta[lowest].name;
  const label = getLabel(scores.overall);
  const tips = quickTips.slice(0, 3).map((t, i) => `${i + 1}. ${t}`).join(nl);

  return [
    `Hi ${name || 'there'}! 👋`,
    `Your AURA Index is *${Math.round(scores.overall)}/100* — *${label}*.`,
    `Top pillar: *${hi}*. Focus area: *${lo}*.`,
    '',
    `Quick tips for this week:`,
    tips,
    '',
    `Want a free 10-min clarity call to personalise this further?`,
    `Book here: ${SITE_BASE}/contact`,
    `Or reply *YES* and we’ll share a tailored micro-plan for you.`,
  ].join(nl);
}

function formatReferralShareMessage(
  name: string,
  scores: AuraScores,
  referralLink: string
) {
  const nl = '\n';
  const label = getLabel(scores.overall);
  return [
    `I just completed my AURA Index on CuraGo ✅`,
    `My score: *${Math.round(scores.overall)}/100* — *${label}*.`,
    ``,
    `It was genuinely helpful. Try it free here:`,
    `${referralLink}`,
    ``,
    `If you book a clarity call after your test, *we both get ₹200 off*.`,
    `Sharing in case it helps 💚`,
  ].join(nl);
}

export default function ResultScreen({ scores, userInfo, onRetake }: ResultScreenProps) {
  // --- Prefill from userInfo (name + possible +91…) ---
  const initialName = (userInfo?.name || '').trim();
  const initialWaDigits = (userInfo?.whatsapp || '').replace(/\D/g, '').slice(-10);

  const [contact, setContact] = useState<UserInfo>({
    name: initialName,
    whatsapp: initialWaDigits,
    email: userInfo?.email || '',
  });

  const displayName = (contact.name || '').trim();
  const [consent, setConsent] = useState(true);
  const [pending, setPending] = useState(false);
  const [submittedOnce, setSubmittedOnce] = useState(false);
  const [copied, setCopied] = useState(false);

  // Modal states
  const [showFormPopup, setShowFormPopup] = useState(true);
  const [showClarityCallPopup, setShowClarityCallPopup] = useState(false);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [formPopupClosedTime, setFormPopupClosedTime] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    email: ''
  });
  const [formErrors, setFormErrors] = useState({
    name: '',
    whatsapp: '',
    email: ''
  });

  const waDigits = contact.whatsapp.replace(/\D/g, '').slice(0, 10);
  const isWaValid = waDigits.length === 10;
  const canSubmit = displayName.length > 0 && isWaValid && consent && !pending && !submittedOnce;

  const handleBookNow = () => {
    trackButtonClick('Book Now', 'floating_cta', 'aura_results');
    // Navigate to booking page
    history.pushState(null, '', '/');
    window.location.hash = '#booking';
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  // Modal form handling
  const handleInputChange = (field: string, value: string) => {
    if (field === 'whatsapp') {
      // Only allow digits and limit to 10 characters
      value = value.replace(/\D/g, '').slice(0, 10);
    }
    
    setFormData({ ...formData, [field]: value });
    
    // Clear error when user starts typing
    if (formErrors[field as keyof typeof formErrors]) {
      setFormErrors({ ...formErrors, [field]: '' });
    }
  };

  const validateForm = () => {
    const errors = { name: '', whatsapp: '', email: '' };
    let isValid = true;

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
      isValid = false;
    }

    if (!formData.whatsapp.trim()) {
      errors.whatsapp = 'WhatsApp number is required';
      isValid = false;
    } else if (formData.whatsapp.length !== 10) {
      errors.whatsapp = 'Please enter a valid 10-digit number';
      isValid = false;
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      // Submit to Wylto webhook (same as ATM)
      const payload = {
        name: formData.name,
        whatsapp: `+91${formData.whatsapp}`,
        email: formData.email,
        formType: 'aura_results',
        scores: {
          overall: Math.round(scores.overall),
          awareness: Math.round(scores.awareness),
          understanding: Math.round(scores.understanding),
          regulation: Math.round(scores.regulation),
          alignment: Math.round(scores.alignment)
        },
        timestamp: new Date().toISOString(),
      };

      const res = await fetch(WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsFormSubmitted(true);
        setShowFormPopup(false);
        setFormPopupClosedTime(Date.now());

        // ✅ Result Unlock Event (₹300 value) - High-value signal
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'guard_rail_unlock',
          test_type: 'aura_index_form_submit',
          proxy_value: 300.00,
          currency: 'INR',
          // PII Data for Advanced Matching
          userEmail: formData.email || '',
          userPhone: `91${formData.whatsapp}`,
          transactionId: `GR-AURA-${Date.now()}`,
          page_path: window.location.pathname,
          aura_event_id: eventIdRef.current,
        });
        console.log('✅ guard_rail_unlock event pushed to dataLayer (AURA, ₹300)');

        // Track successful submission (legacy tracking)
        dlPush({
          event: 'aura_results_form_submitted',
          aura_event_id: eventIdRef.current,
          name: formData.name,
          whatsapp: formData.whatsapp,
          email: formData.email
        });

        trackButtonClick('AURA Form Submitted', 'form', 'aura_results');
      } else {
        console.error('Form submission failed');
        alert('Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      alert('Something went wrong. Please try again.');
    }
  };

  // order for tips
  const orderedKeys = useMemo(
    () =>
      (['awareness', 'understanding', 'regulation', 'alignment'] as PillarKey[]).sort(
        (a, b) => scores[b] - scores[a]
      ),
    [scores]
  );
  const highestKey = orderedKeys[0];
  const lowestKey = orderedKeys[orderedKeys.length - 1];
  const secondLowestKey = orderedKeys[orderedKeys.length - 2];

  // Ensure field values reflect derived cleans (keeps cursor stable)
  useEffect(() => {
    if (contact.whatsapp !== waDigits) {
      setContact((c) => ({ ...c, whatsapp: waDigits }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  // Show clarity call popup 5 seconds after first popup is closed
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (formPopupClosedTime) {
      // If form popup was closed, start timer from that moment
      timer = setTimeout(() => {
        setShowClarityCallPopup(true);
      }, 5000);
    } else if (!showFormPopup && !isFormSubmitted) {
      // If form popup was never shown or closed without submission, show after 7 seconds total
      timer = setTimeout(() => {
        setShowClarityCallPopup(true);
      }, 7000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [formPopupClosedTime, showFormPopup, isFormSubmitted]);

  // ---- Referral code/link ----
  const referralCode = useMemo(() => {
    if (waDigits) return `IN${waDigits}`;
    if (displayName) return `NM${simpleHash(displayName)}`;
    return `GUEST${simpleHash(String(Date.now()))}`;
  }, [waDigits, displayName]);

  const referralLink = `${SITE_BASE}/aura-rise-index?ref=${encodeURIComponent(referralCode)}`;

  // ---- DERIVED ANALYTICS & PERSONAL TIPS ----
  const analytics = useMemo(() => {
    const label = getLabel(scores.overall);
    const perPillar = (['awareness', 'understanding', 'regulation', 'alignment'] as PillarKey[]).map(
      (k) => ({
        key: k,
        name: pillarMeta[k].name,
        score: Math.round(scores[k]),
        band: pillarLabel(scores[k]),
      })
    );

    const strengths = perPillar.filter((p) => p.score >= 70).map((p) => p.name);
    const growth = perPillar.filter((p) => p.score < 60).map((p) => p.name);

    const riskFlags: string[] = [];
    if (scores.regulation < 55) riskFlags.push('Acute stress / slow recovery risk');
    if (scores.alignment < 55) riskFlags.push('Value-action mismatch risk');
    if (scores.awareness < 50 && scores.understanding < 55) riskFlags.push('Blind-spot risk');

    const quickTips = [
      ...tipForPillar(lowestKey),
      ...tipForPillar(secondLowestKey).slice(0, 1),
    ];

    const weekPlan = sevenDayPlan(lowestKey, secondLowestKey);

    return {
      label,
      perPillar,
      strengths,
      growth,
      riskFlags,
      quickTips,
      weekPlan,
    };
  }, [scores, lowestKey, secondLowestKey]);

  // ---- Messages ----
  const whatsappText = useMemo(
    () => formatWhatsAppMessage(displayName, scores, highestKey, lowestKey, analytics.quickTips),
    [displayName, scores, highestKey, lowestKey, analytics.quickTips]
  );

  const whatsappShareText = useMemo(
    () => formatReferralShareMessage(displayName, scores, referralLink),
    [displayName, scores, referralLink]
  );

  // ---------- TRACKING: session & timers ----------
  const eventIdRef = useRef<string>('');
  const startRef = useRef<number>(0);
  const maxScrollRef = useRef<number>(0);
  const sentScrollStepsRef = useRef<Set<number>>(new Set());
  const heartbeatRef = useRef<number | null>(null);

  // ----- FORM TRACKING (added) -----
  const formFirstFocusAtRef = useRef<number | null>(null);
  const formValidAtRef = useRef<number | null>(null);
  const formSubmitAtRef = useRef<number | null>(null);
  const formInteractedRef = useRef<boolean>(false);
  const prevCanSubmitRef = useRef<boolean>(false);
  const changeCountRef = useRef<{ name: number; whatsapp: number; email: number; consent: number }>({
    name: 0, whatsapp: 0, email: 0, consent: 0
  });

  const fieldsFilledCount = () => {
    let n = 0;
    if (displayName.length > 0) n++;
    if (waDigits.length === 10) n++;
    if ((contact.email || '').trim().length > 0) n++;
    if (consent) n++;
    return n;
  };

  const markFormStartIfNeeded = (field: string) => {
    if (!formFirstFocusAtRef.current) {
      formFirstFocusAtRef.current = now();
      formInteractedRef.current = true;
      dlPush({
        event: 'aura_results_form_start',
        aura_event_id: eventIdRef.current,
        first_field: field,
        t_since_results_s: secs(now() - startRef.current),
      });
    }
  };

  // section refs for intersection observers
  const radarRef = useRef<HTMLDivElement | null>(null);
  const pillarsRef = useRef<HTMLDivElement | null>(null);
  const formRef = useRef<HTMLDivElement | null>(null);
  const advRef = useRef<HTMLDivElement | null>(null);
  const ctaRef = useRef<HTMLDivElement | null>(null);
  const shareRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // session id
    const eid = `aurares_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    eventIdRef.current = eid;
    startRef.current = now();

    dlPush({
      event: 'aura_results_impression',
      aura_event_id: eid,
      aura_overall: Math.round(scores.overall),
    });

    // 15s heartbeat
    heartbeatRef.current = window.setInterval(() => {
      const elapsed = secs(now() - startRef.current);
      dlPush({
        event: 'aura_results_heartbeat',
        aura_event_id: eid,
        elapsed_s: elapsed,
      });
    }, 15000);

    // scroll depth
    const onScroll = () => {
      const doc = document.documentElement;
      const scrolled = (doc.scrollTop || document.body.scrollTop);
      const height = doc.scrollHeight - doc.clientHeight;
      if (height <= 0) return;
      const pct = Math.min(100, Math.round((scrolled / height) * 100));
      if (pct > maxScrollRef.current) {
        maxScrollRef.current = pct;
        [25, 50, 75, 90].forEach(step => {
          if (pct >= step && !sentScrollStepsRef.current.has(step)) {
            sentScrollStepsRef.current.add(step);
            dlPush({
              event: 'aura_results_scroll',
              aura_event_id: eid,
              scroll_pct: step,
            });
          }
        });
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // section visibility
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const id = (e.target as HTMLElement).dataset.trackId || 'unknown_section';
            dlPush({
              event: 'aura_results_section_view',
              aura_event_id: eid,
              section: id,
              visible_pct: Math.round(e.intersectionRatio * 100),
            });
          }
        }
      },
      { threshold: [0.25, 0.5, 0.75] }
    );
    [radarRef, pillarsRef, formRef, advRef, ctaRef, shareRef]
      .forEach(r => r.current && io.observe(r.current));

    // before unload -> abandonment if started but not submitted
    const beforeUnload = () => {
      if (formInteractedRef.current && !formSubmitAtRef.current && !submittedOnce) {
        dlPush({
          event: 'aura_results_form_abandon',
          aura_event_id: eid,
          time_on_form_s: formFirstFocusAtRef.current ? secs(now() - formFirstFocusAtRef.current) : 0,
          fields_filled: fieldsFilledCount(),
          changes: changeCountRef.current,
        });
      }
    };
    window.addEventListener('beforeunload', beforeUnload);

    // unmount
    return () => {
      [radarRef, pillarsRef, formRef, advRef, ctaRef, shareRef]
        .forEach(r => r.current && io.unobserve(r.current));
      io.disconnect();

      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('beforeunload', beforeUnload);
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
      dlPush({
        event: 'aura_results_time_spent',
        aura_event_id: eid,
        total_time_s: secs(now() - startRef.current),
        max_scroll_pct: maxScrollRef.current,
      });

      // component unmount abandonment
      if (formInteractedRef.current && !formSubmitAtRef.current && !submittedOnce) {
        dlPush({
          event: 'aura_results_form_abandon',
          aura_event_id: eid,
          time_on_form_s: formFirstFocusAtRef.current ? secs(now() - formFirstFocusAtRef.current) : 0,
          fields_filled: fieldsFilledCount(),
          changes: changeCountRef.current,
        });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Submit ----
  const postOnceRef = useRef(false);

  const submitFullInsights = async () => {
    if (!canSubmit) {
      dlPush({
        event: 'aura_results_submit_blocked',
        aura_event_id: eventIdRef.current,
        reason: !displayName ? 'name_missing' : !isWaValid ? 'wa_invalid' : !consent ? 'no_consent' : 'other',
        fields_filled: fieldsFilledCount(),
      });
      return;
    }
    if (postOnceRef.current) return;
    postOnceRef.current = true;
    setPending(true);

    dlPush({
      event: 'aura_results_submit_attempt',
      aura_event_id: eventIdRef.current,
      name_len: displayName.length,
      has_email: !!contact.email,
      time_to_submit_s:
        formFirstFocusAtRef.current ? secs(now() - formFirstFocusAtRef.current) : null,
      time_to_valid_s:
        formValidAtRef.current && formFirstFocusAtRef.current
          ? secs(formValidAtRef.current - formFirstFocusAtRef.current)
          : null,
    });

    try {
      const payload = {
        action: 'full_insights',
        scores,
        contact: {
          name: displayName,
          whatsapp: `+91${waDigits}`,
          email: contact.email || '',
        },
        consent,
        userInfo,
        analytics: {
          label: analytics.label,
          strengths: analytics.strengths,
          growth: analytics.growth,
          riskFlags: analytics.riskFlags,
          perPillar: analytics.perPillar,
          weekPlan: analytics.weekPlan,
          quickTips: analytics.quickTips,
        },
        referral: {
          code: referralCode,
          link: referralLink,
          incentive: '₹200 off for both on booking a clarity call',
        },
        prepared: {
          whatsappText,
          whatsappShareText,
        },
        timestamp: new Date().toISOString(),
      };

      const res = await fetch(WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const t = await res.text().catch(() => '');
        throw new Error(`Webhook error ${res.status}: ${t}`);
      }
      setSubmittedOnce(true);
      formSubmitAtRef.current = now();

      dlPush({
        event: 'aura_results_submit_success',
        aura_event_id: eventIdRef.current,
      });
    } catch (e) {
      console.error(e);
      postOnceRef.current = false; // allow retry on failure
      dlPush({
        event: 'aura_results_submit_error',
        aura_event_id: eventIdRef.current,
        message: (e as Error)?.message || 'unknown_error',
      });
      alert('Could not submit. Please try again.');
    } finally {
      setPending(false);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    submitFullInsights();
  };

  const copyShareToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(whatsappShareText);
      setCopied(true);
      dlPush({
        event: 'aura_referral_copy',
        aura_event_id: eventIdRef.current,
        code: referralCode,
      });
      setTimeout(() => setCopied(false), 1500);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = whatsappShareText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      dlPush({
        event: 'aura_referral_copy',
        aura_event_id: eventIdRef.current,
        code: referralCode,
        fallback: true,
      });
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const openWhatsAppShare = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(whatsappShareText)}`;
    dlPush({
      event: 'aura_referral_share_whatsapp',
      aura_event_id: eventIdRef.current,
      code: referralCode,
    });
    trackButtonClick('Share on WhatsApp', 'share', 'results_referral');
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // ----- VALIDATION STATE TRANSITIONS (added) -----
  useEffect(() => {
    const prev = prevCanSubmitRef.current;
    if (canSubmit && !prev) {
      formValidAtRef.current = formValidAtRef.current || now();
      dlPush({
        event: 'aura_results_form_valid',
        aura_event_id: eventIdRef.current,
        fields_filled: fieldsFilledCount(),
        time_to_valid_s:
          formFirstFocusAtRef.current ? secs((formValidAtRef.current || now()) - formFirstFocusAtRef.current) : null,
      });
    }
    if (!canSubmit && prev) {
      dlPush({
        event: 'aura_results_form_invalidated',
        aura_event_id: eventIdRef.current,
        fields_filled: fieldsFilledCount(),
      });
    }
    prevCanSubmitRef.current = canSubmit;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canSubmit]);

  // ---------- UI ----------
  return (
    <>
      {/* Show modal first, then results after form submission */}
      {showFormPopup && !isFormSubmitted && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={(e) => e.target === e.currentTarget && e.preventDefault()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 sm:p-8">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Unlock Your Results</h3>
              </div>

              <p className="text-gray-600 mb-6 leading-relaxed">
                Your result is ready.<br />
                To keep it secure and make it retrievable anytime, we need to link it to your WhatsApp number.<br />
                You may also receive helpful messages and calls from our team as part of your support journey.<br /><br />
                Enter your details to unlock your full result.
              </p>

              <form onSubmit={handleFormSubmit} className="space-y-5">
                {/* Name Field */}
                <div>
                  <div className="flex items-center mb-2">
                    <User className="w-4 h-4 text-gray-500 mr-2" />
                    <label className="text-sm font-medium text-gray-700">
                      Full Name *
                    </label>
                  </div>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-4 py-3 border focus:ring-2 focus:ring-[#64CB81] focus:border-[#64CB81] outline-none transition-colors ${
                      formErrors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your full name"
                  />
                  {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                </div>

                {/* WhatsApp Field */}
                <div>
                  <div className="flex items-center mb-2">
                    <Phone className="w-4 h-4 text-gray-500 mr-2" />
                    <label className="text-sm font-medium text-gray-700">
                      WhatsApp Number *
                    </label>
                  </div>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={formData.whatsapp}
                      onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                      className={`flex-1 px-4 py-3 border focus:ring-2 focus:ring-[#64CB81] focus:border-[#64CB81] outline-none transition-colors rounded-r-md ${
                        formErrors.whatsapp ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="9876543210"
                      maxLength={10}
                    />
                  </div>
                  {formErrors.whatsapp && <p className="text-red-500 text-sm mt-1">{formErrors.whatsapp}</p>}
                </div>

                {/* Email Field */}
                <div>
                  <div className="flex items-center mb-2">
                    <Mail className="w-4 h-4 text-gray-500 mr-2" />
                    <label className="text-sm font-medium text-gray-700">
                      Email Address *
                    </label>
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-4 py-3 border focus:ring-2 focus:ring-[#64CB81] focus:border-[#64CB81] outline-none transition-colors ${
                      formErrors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="your.email@example.com"
                  />
                  {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-[#64CB81] text-white py-3 px-6 rounded-lg font-medium hover:bg-[#5bb574] transition-colors"
                >
                  Unlock My Results
                </button>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Results content - only show after form submission */}
      {(!showFormPopup || isFormSubmitted) && (
        <div className="min-h-screen bg-gradient-to-br from-[#096b17] via-[#075110] to-[#053d0b] pt-24">
      {/* Header */}
      <header className="container mx-auto px-6 py-5 flex justify-between items-center">
        <Button
          onClick={() => {
            dlPush({ event: 'aura_results_cta_click', aura_event_id: eventIdRef.current, label: 'Retake' });
            trackButtonClick('Retake', 'cta', 'results_header');
            onRetake();
          }}
          variant="outline"
          size="sm"
          className="rounded-xl bg-white/20 border border-white/30 text-white hover:bg-white/30"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Retake
        </Button>
      </header>

      <div className="container mx-auto px-6 py-6 max-w-5xl">
        {/* Greeting */}
        <div className="text-center mb-4">
          <h1 className="text-xl text-white flex items-center justify-center gap-2">
            Hello{displayName ? `, ${displayName}` : ''}!
            <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: '#096b17' }} />
          </h1>
        </div>

        {/* Profile: Radar + Pillars */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card
            className="p-6 bg-white/30 backdrop-blur-md border border-white/20"
            ref={radarRef}
            data-track-id="radar_profile"
          >
            <h3 className="text-lg text-center text-white mb-4">
              Your Emotional Fitness Profile
            </h3>
            <RadarChartComponent scores={scores} />
          </Card>

          <div
            className="space-y-4"
            ref={(el) => { pillarsRef.current = el; if (el) el.dataset.trackId = 'pillar_cards'; }}
          >
            {(['awareness', 'understanding', 'regulation', 'alignment'] as PillarKey[]).map((k) => {
              const MetaIcon = pillarMeta[k].Icon;
              const hi = k === highestKey;
              const lo = k === lowestKey;
              return (
                <Card key={k} className="p-5 bg-white/30 backdrop-blur-md border border-white/20">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: 'rgba(255, 253, 189, 0.3)' }}
                      >
                        <MetaIcon className="w-5 h-5" color="#096b17" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-base font-medium text-white break-words">
                          {pillarMeta[k].name}
                        </h4>
                        <p className="text-sm text-white/90 break-words leading-snug">
                          {pillarMeta[k].desc}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {hi && <TrendingUp className="w-5 h-5" color="#096b17" />}
                      {lo && <TrendingDown className="w-5 h-5" color="#096b17" />}
                      <span className="text-xl font-semibold text-white">
                        {Math.round(scores[k])}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${scores[k]}%` }}
                      transition={{ duration: 0.6 }}
                      className="h-2 rounded-full"
                      style={{ backgroundColor: '#096b17' }}
                    />
                  </div>
                  <p className="text-xs text-white/70 mt-2">{pillarLabel(scores[k])}</p>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Overall score */}
        <Card className="p-6 mb-8 bg-white/30 backdrop-blur-md border border-white/20 text-center"
          ref={formRef}
          data-track-id="overall_score">
          <div className="mb-2">
            <span className="text-6xl font-semibold" style={{ color: '#096b17' }}>
              {Math.round(scores.overall)}
            </span>
            <span className="text-2xl text-white/90">/100</span>
          </div>
          <Badge className="bg-white/20 border-0 px-4 py-1.5 text-sm text-white">
            {analytics.label}
          </Badge>
        </Card>

        {/* Advanced analytics & personal tips */}
        <Card
          className="p-6 mb-8 bg-white/30 backdrop-blur-md border border-white/20"
          ref={(el) => { advRef.current = el; if (el) el.dataset.trackId = 'advanced_insights'; }}
        >
          <h3 className="text-xl font-semibold text-white mb-3">Your Advanced Insights</h3>

          {/* Summary */}
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div className="p-4 rounded-xl bg-white/20 border border-white/10">
              <p className="text-xs text-white/70">Top Pillar</p>
              <p className="font-medium text-white">{pillarMeta[highestKey].name}</p>
            </div>
            <div className="p-4 rounded-xl bg-white/20 border border-white/10">
              <p className="text-xs text-white/70">Focus Area</p>
              <p className="font-medium text-white">{pillarMeta[lowestKey].name}</p>
            </div>
            <div className="p-4 rounded-xl bg-white/20 border border-white/10">
              <p className="text-xs text-white/70">Overall Band</p>
              <p className="font-medium text-white">{analytics.label}</p>
            </div>
          </div>

          {/* Risk flags */}
          {analytics.riskFlags.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-white mb-1">Potential Risks</p>
              <ul className="list-disc list-inside text-sm text-white/90">
                {analytics.riskFlags.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Per-pillar bands */}
          <div className="mb-4">
            <p className="text-sm font-medium text-white mb-1">Pillar Status</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {analytics.perPillar.map((p) => (
                <div key={p.key} className="p-3 rounded-lg bg-white/20 border border-white/10 flex items-center justify-between">
                  <span className="text-sm text-white">{p.name}</span>
                  <span className="text-xs text-white/90">{p.score}/100 • {p.band}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick tips */}
          <div className="mb-4">
            <p className="text-sm font-medium text-white mb-1">Personal Tips (Next 7 Days)</p>
            <ul className="list-disc list-inside text-sm text-white/90">
              {analytics.quickTips.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </div>

          {/* 7-day plan */}
          <div className="mb-6">
            <p className="text-sm font-medium text-white mb-1">Simple 7-Day Plan</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {analytics.weekPlan.map((d, i) => (
                <div key={i} className="p-3 rounded-lg bg-white/20 border border-white/10">
                  <p className="text-xs text-white/70">{d.day}</p>
                  <p className="text-sm font-medium text-white">{d.focus}</p>
                  <ul className="list-disc list-inside text-xs text-white/90 mt-1">
                    {d.actions.map((a, j) => (
                      <li key={j}>{a}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Share on WhatsApp (Referral) */}
          <div
            className="rounded-xl bg-white/20 border border-white/10"
            ref={(el) => { shareRef.current = el; if (el) el.dataset.trackId = 'referral_share'; }}
          >
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <p className="text-sm font-medium text-white">Share on WhatsApp</p>
              <Button
                type="button"
                variant="outline"
                onClick={copyShareToClipboard}
                className="h-8 px-3 rounded-lg bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                {copied ? <CheckIcon className="w-4 h-4 mr-2" /> : <CopyIcon className="w-4 h-4 mr-2" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
            <div className="p-4">
              <pre className="whitespace-pre-wrap text-sm text-white/90">{whatsappShareText}</pre>
              <div className="mt-3 flex flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  onClick={openWhatsAppShare}
                  className="rounded-xl text-white"
                  style={{ backgroundColor: '#096b17' }}
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Share on WhatsApp
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl bg-white/10 border-white/20 text-white hover:bg-white/20"
                  onClick={() => {
                    dlPush({ event: 'aura_results_cta_click', aura_event_id: eventIdRef.current, label: 'Book Free Clarity Call (share card)' });
                    trackButtonClick('Book Free Clarity Call', 'cta', 'results_share_card');
                    window.open(`${SITE_BASE}/contact`, '_blank');
                  }}
                >
                  Book Free Clarity Call
                </Button>
              </div>
              <p className="text-xs text-white/70 mt-2">
                Your referral code: <code className="font-semibold text-white">{referralCode}</code> • Link:{' '}
                <a
                  href={referralLink}
                  className="underline text-white/90"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => dlPush({ event: 'aura_referral_link_click', aura_event_id: eventIdRef.current, code: referralCode })}
                >
                  {referralLink}
                </a>
              </p>
            </div>
          </div>
        </Card>

        {/* Next-step CTAs */}
        <Card
          className="p-6 text-center bg-white/30 backdrop-blur-md border border-white/20"
          ref={(el) => { ctaRef.current = el; if (el) el.dataset.trackId = 'results_ctas'; }}
        >
          <h3 className="text-xl text-white mb-3">Ready to take your next step?</h3>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => {
                dlPush({ event: 'aura_results_cta_click', aura_event_id: eventIdRef.current, label: 'Book Free Clarity Call' });
                trackButtonClick('Book Free Clarity Call', 'cta', 'results_bottom');
                window.location.assign('/contact');
              }}
              className="sm:w-auto w-full rounded-xl text-white"
              style={{ backgroundColor: '#096b17' }}
            >
              Book Free Clarity Call
            </Button>
            <Button
              onClick={() => {
                dlPush({ event: 'aura_results_cta_click', aura_event_id: eventIdRef.current, label: 'Chat Now on WhatsApp' });
                trackButtonClick('Chat Now on WhatsApp', 'cta', 'results_bottom');
                window.open('https://wa.me/917021227203?text=' + encodeURIComponent('Hi! I completed my AURA Index and would like to chat.'), '_blank', 'noopener,noreferrer');
              }}
              className="sm:w-auto w-full rounded-xl bg-white/20 border border-white/30 text-white hover:bg-white/30"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Chat Now on WhatsApp
            </Button>
            <Button
              onClick={() => {
                dlPush({ event: 'aura_results_cta_click', aura_event_id: eventIdRef.current, label: 'Our Mental Health Team' });
                trackButtonClick('Our Mental Health Team', 'cta', 'results_bottom');
                const el = document.getElementById('team');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else window.location.assign('/#mental-health-team');
              }}
              className="sm:w-auto w-full rounded-xl bg-white/20 border border-white/30 text-white hover:bg-white/30"
            >
              Our Mental Health Team
            </Button>
            <Button
              onClick={() => {
                dlPush({ event: 'aura_results_cta_click', aura_event_id: eventIdRef.current, label: 'Book Consultation Now' });
                trackButtonClick('Book Consultation Now', 'cta', 'results_bottom');
                const el = document.getElementById('home');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else window.location.assign('/#home');
              }}
              className="sm:w-auto w-full rounded-xl bg-white/20 border border-white/30 text-white hover:bg-white/30"
            >
              Book Consultation Now
            </Button>
          </div>
        </Card>
      </div>
      
      {/* Floating Buttons */}
      <FloatingButtons onBookNow={handleBookNow} />
        </div>
      )}

      {/* Second popup - Clarity Call */}
      {showClarityCallPopup && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={(e) => e.target === e.currentTarget && setShowClarityCallPopup(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md lg:max-w-lg xl:max-w-xl mx-4"
          >
            <div className="p-6 sm:p-8 lg:p-10 text-center">
              <div className="flex justify-end mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowClarityCallPopup(false)}
                  className="rounded-full w-8 h-8 p-0 border-gray-200 hover:bg-gray-50"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Logo */}
              <div className="flex justify-center mb-6">
                <img src="/Logo.svg?v=6" alt="CuraGo Logo" className="h-12 w-auto lg:h-16" />
              </div>

             
              <h3 className="text-xl lg:text-2xl xl:text-3xl font-bold text-gray-800 mb-4">
                Get Personalized Guidance
              </h3>
              
              <p className="text-gray-600 mb-6 lg:mb-8 text-sm lg:text-base leading-relaxed">
                Book a free 15-minute clarity call with our mental health expert to discuss your AURA results and create a personalized plan for your emotional fitness journey.
              </p>
              
              <div className="space-y-3 lg:space-y-4">
                <Button
                  onClick={() => {
                    // ✅ Clarity Call CTA Click (₹400 value intent)
                    window.dataLayer = window.dataLayer || [];
                    window.dataLayer.push({
                      event: 'contact_form_submission',
                      form_type: 'clarity_call_cta_click',
                      proxy_value: 400.00,
                      currency: 'INR',
                      page_path: window.location.pathname,
                      source: 'aura_clarity_popup',
                      aura_event_id: eventIdRef.current,
                    });
                    console.log('✅ contact_form_submission event (CTA click) pushed to dataLayer (₹400)');

                    dlPush({ event: 'aura_results_cta_click', aura_event_id: eventIdRef.current, label: 'Book Free Clarity Call (popup)' });
                    trackButtonClick('Book Free Clarity Call', 'popup', 'aura_results_clarity_popup');
                    window.location.href = '/contact';
                    setShowClarityCallPopup(false);
                  }}
                  className="w-full bg-white border cursor-pointer border-gray-300 text-gray-800 hover:bg-gray-50 py-3 lg:py-4 rounded-lg font-semibold text-sm lg:text-base xl:text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <Phone className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
                  Book Free Clarity Call
                </Button>
                
                <Button
                  onClick={() => {
                    dlPush({ event: 'aura_results_cta_click', aura_event_id: eventIdRef.current, label: 'Chat Now on WhatsApp (popup)' });
                    trackButtonClick('Chat Now on WhatsApp', 'popup', 'aura_results_clarity_popup');
                    window.open('https://wa.me/917021227203?text=' + encodeURIComponent('Hi! I completed my AURA assessment and would like to chat.'), '_blank', 'noopener,noreferrer');
                    setShowClarityCallPopup(false);
                  }}
                  className="w-full py-3 lg:py-4 rounded-lg font-medium text-sm lg:text-base bg-[#64CB81] text-white cursor-pointer hover:bg-green-600 transition-all duration-300"
                >
                  <MessageCircle className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
                  Chat Now on WhatsApp
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}
