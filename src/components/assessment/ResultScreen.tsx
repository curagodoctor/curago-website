// src/components/assessment/ResultScreen.tsx
import { useMemo, useRef, useState, FormEvent, useEffect } from 'react';
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
  Check as CheckIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { AuraScores, UserInfo } from '../../types/aura';
import { trackButtonClick } from '../../utils/tracking';

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
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push({
      page_path: window.location.pathname + window.location.search + window.location.hash,
      ...obj,
    });
    // console.debug('[DL]', obj);
  } catch { }
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

  const waDigits = contact.whatsapp.replace(/\D/g, '').slice(0, 10);
  const isWaValid = waDigits.length === 10;
  const canSubmit = displayName.length > 0 && isWaValid && consent && !pending && !submittedOnce;

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
    <div className="min-h-screen bg-white pt-24">
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
          className="rounded-xl border-gray-300 hover:border-[#096b17]/40"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Retake
        </Button>
      </header>

      <div className="container mx-auto px-6 py-6 max-w-5xl">
        {/* Greeting */}
        <div className="text-center mb-4">
          <h1 className="text-xl text-gray-700 flex items-center justify-center gap-2">
            Hello{displayName ? `, ${displayName}` : ''}!
            <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: BRAND }} />
          </h1>
        </div>

        {/* Profile: Radar + Pillars */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card
            className="p-6 border-[#096b17]/10"
            ref={radarRef}
            data-track-id="radar_profile"
          >

            <h3 className="text-lg text-center text-gray-900 mb-4">
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
                <Card key={k} className="p-5 border-[#096b17]/10">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: '#FFFDBD' }}
                      >
                        <MetaIcon className="w-5 h-5" color={BRAND} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-base font-medium text-gray-900 break-words">
                          {pillarMeta[k].name}
                        </h4>
                        <p className="text-sm text-gray-600 break-words leading-snug">
                          {pillarMeta[k].desc}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {hi && <TrendingUp className="w-5 h-5" color={BRAND} />}
                      {lo && <TrendingDown className="w-5 h-5" color={BRAND} />}
                      <span className="text-xl font-semibold text-gray-900">
                        {Math.round(scores[k])}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${scores[k]}%` }}
                      transition={{ duration: 0.6 }}
                      className="h-2 rounded-full"
                      style={{ backgroundColor: BRAND }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{pillarLabel(scores[k])}</p>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Overall score */}
        <Card className="p-6 mb-8 border-[#096b17]/10 text-center"
          ref={formRef}
          data-track-id="full_insights_form">
          <div className="mb-2">
            <span className="text-6xl font-semibold" style={{ color: BRAND }}>
              {Math.round(scores.overall)}
            </span>
            <span className="text-2xl text-gray-400">/100</span>
          </div>
          <Badge className="bg-[#FFFDBD] border-0 px-4 py-1.5 text-sm" style={{ color: BRAND }}>
            {analytics.label}
          </Badge>
        </Card>

        {/* Full insights form */}
        <Card
          className="p-6 mb-8 border-[#096b17]/20"
          ref={(el) => { formRef.current = el; if (el) el.dataset.trackId = 'full_insights_form'; }}
        >
          <h3 className="text-2xl text-center text-gray-900 mb-2">Get your full insights</h3>
          <p className="text-gray-600 text-center mb-6">
            Get detailed pillar-by-pillar interpretations and personalised next steps.
          </p>

          <form onSubmit={onSubmit} className="max-w-xl mx-auto text-left space-y-4">
            {/* Name */}
            <div>
              <Label>Name *</Label>
              <Input
                value={contact.name}
                onFocus={() => {
                  markFormStartIfNeeded('name');
                  dlPush({ event: 'aura_results_input_focus', aura_event_id: eventIdRef.current, field: 'name' });
                }}
                onBlur={(e) => {
                  dlPush({
                    event: 'aura_results_input_blur',
                    aura_event_id: eventIdRef.current,
                    field: 'name',
                    len: e.target.value.length,
                  });
                }}
                onChange={(e) => {
                  setContact({ ...contact, name: e.target.value });
                  changeCountRef.current.name += 1;
                  dlPush({
                    event: 'aura_results_input_change',
                    aura_event_id: eventIdRef.current,
                    field: 'name',
                    len: e.target.value.length,
                    filled_fields: fieldsFilledCount(),
                  });
                }}
                placeholder="Your name"
                className="
                  text-base
                  border border-[#FFF7AF]/70
                  focus-visible:!outline-none
                  focus-visible:!ring-2
                  focus-visible:!ring-[#FFF7AF]
                  focus-visible:!border-[#FFF7AF]
                "
                style={{ ['--tw-ring-color' as any]: '#FFF7AF' }}
              />
            </div>

            {/* WhatsApp */}
            <div>
              <Label>WhatsApp Number *</Label>
              <div
                className="
                  flex items-center rounded-md border bg-background
                  border-[#FFF7AF]/70
                  focus-within:!ring-2
                  focus-within:!ring-[#FFF7AF]
                  focus-within:!border-[#FFF7AF]
                "
                style={{ ['--tw-ring-color' as any]: '#FFF7AF' }}
              >
                <span className="px-3 text-sm font-medium" style={{ color: BRAND }}>
                  +91
                </span>
                <input
                  className="flex-1 h-10 px-3 outline-none bg-transparent text-base"
                  inputMode="numeric"
                  pattern="\d*"
                  placeholder="10-digit number"
                  value={waDigits}
                  onFocus={() => {
                    markFormStartIfNeeded('whatsapp');
                    dlPush({ event: 'aura_results_input_focus', aura_event_id: eventIdRef.current, field: 'whatsapp' });
                  }}
                  onBlur={(e) => {
                    dlPush({
                      event: 'aura_results_input_blur',
                      aura_event_id: eventIdRef.current,
                      field: 'whatsapp',
                      len: e.target.value.replace(/\D/g, '').length,
                      valid: e.target.value.replace(/\D/g, '').length === 10,
                    });
                  }}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setContact({ ...contact, whatsapp: v });
                    changeCountRef.current.whatsapp += 1;
                    dlPush({
                      event: 'aura_results_input_change',
                      aura_event_id: eventIdRef.current,
                      field: 'whatsapp',
                      len: v.length,
                      valid: v.length === 10,
                      filled_fields: fieldsFilledCount(),
                    });
                  }}
                />
              </div>
              {!isWaValid && contact.whatsapp.length > 0 && (
                <p className="text-xs text-red-600 mt-1">Please enter a valid 10-digit number.</p>
              )}
            </div>

            {/* Email */}
            <div>
              <Label>Email (optional)</Label>
              <Input
                type="email"
                value={contact.email}
                onFocus={() => {
                  markFormStartIfNeeded('email');
                  dlPush({ event: 'aura_results_input_focus', aura_event_id: eventIdRef.current, field: 'email' });
                }}
                onBlur={(e) => {
                  dlPush({
                    event: 'aura_results_input_blur',
                    aura_event_id: eventIdRef.current,
                    field: 'email',
                    len: e.target.value.length,
                    has_at: e.target.value.includes('@'),
                  });
                }}
                onChange={(e) => {
                  setContact({ ...contact, email: e.target.value });
                  changeCountRef.current.email += 1;
                  dlPush({
                    event: 'aura_results_input_change',
                    aura_event_id: eventIdRef.current,
                    field: 'email',
                    len: e.target.value.length,
                    filled_fields: fieldsFilledCount(),
                  });
                }}
                placeholder="you@example.com"
                className="
                  text-base
                  border border-[#FFF7AF]/70
                  focus-visible:!outline-none
                  focus-visible:!ring-2
                  focus-visible:!ring-[#FFF7AF]
                  focus-visible:!border-[#FFF7AF]
                "
                style={{ ['--tw-ring-color' as any]: '#FFF7AF' }}
              />
            </div>

            {/* Consent */}
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={consent}
                onFocus={() => {
                  markFormStartIfNeeded('consent');
                  dlPush({ event: 'aura_results_input_focus', aura_event_id: eventIdRef.current, field: 'consent' });
                }}
                onChange={(e) => {
                  setConsent(e.target.checked);
                  changeCountRef.current.consent += 1;
                  dlPush({
                    event: 'aura_results_input_change',
                    aura_event_id: eventIdRef.current,
                    field: 'consent',
                    value: e.target.checked,
                    filled_fields: fieldsFilledCount(),
                  });
                }}
                onBlur={(e) => {
                  dlPush({
                    event: 'aura_results_input_blur',
                    aura_event_id: eventIdRef.current,
                    field: 'consent',
                    value: e.target.checked,
                  });
                }}
              />
              I agree to get insights on WhatsApp and email.
            </label>

            <div className="flex justify-center pt-1">
              <Button
                type="submit"
                disabled={!canSubmit}
                onClick={() => {
                  dlPush({
                    event: 'aura_results_cta_click',
                    aura_event_id: eventIdRef.current,
                    label: 'Get Full Insights',
                    can_submit: canSubmit,
                    fields_filled: fieldsFilledCount(),
                  });
                  trackButtonClick('Get Full Insights', 'cta', 'results_form');
                }}
                className="rounded-xl px-6 text-white"
                style={{ backgroundColor: BRAND }}
              >
                {pending ? 'Submitting…' : submittedOnce ? 'Submitted' : 'Get Full Insights'}
              </Button>
            </div>
          </form>
        </Card>

        {/* Advanced analytics & personal tips (visible after submit) */}
        {submittedOnce && (
          <Card
            className="p-6 mb-8 border-[#096b17]/30"
            ref={(el) => { advRef.current = el; if (el) el.dataset.trackId = 'advanced_insights'; }}
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Your Advanced Insights</h3>

            {/* Summary */}
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div className="p-4 rounded-xl border border-[#096b17]/20">
                <p className="text-xs text-gray-500">Top Pillar</p>
                <p className="font-medium">{pillarMeta[highestKey].name}</p>
              </div>
              <div className="p-4 rounded-xl border border-[#096b17]/20">
                <p className="text-xs text-gray-500">Focus Area</p>
                <p className="font-medium">{pillarMeta[lowestKey].name}</p>
              </div>
              <div className="p-4 rounded-xl border border-[#096b17]/20">
                <p className="text-xs text-gray-500">Overall Band</p>
                <p className="font-medium">{analytics.label}</p>
              </div>
            </div>

            {/* Risk flags */}
            {analytics.riskFlags.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-900 mb-1">Potential Risks</p>
                <ul className="list-disc list-inside text-sm text-gray-700">
                  {analytics.riskFlags.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Per-pillar bands */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-900 mb-1">Pillar Status</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {analytics.perPillar.map((p) => (
                  <div key={p.key} className="p-3 rounded-lg border border-[#096b17]/15 flex items-center justify-between">
                    <span className="text-sm text-gray-800">{p.name}</span>
                    <span className="text-xs text-gray-600">{p.score}/100 • {p.band}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick tips */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-900 mb-1">Personal Tips (Next 7 Days)</p>
              <ul className="list-disc list-inside text-sm text-gray-700">
                {analytics.quickTips.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>

            {/* 7-day plan */}
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-900 mb-1">Simple 7-Day Plan</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {analytics.weekPlan.map((d, i) => (
                  <div key={i} className="p-3 rounded-lg border border-[#096b17]/15">
                    <p className="text-xs text-gray-500">{d.day}</p>
                    <p className="text-sm font-medium">{d.focus}</p>
                    <ul className="list-disc list-inside text-xs text-gray-700 mt-1">
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
              className="rounded-xl border border-[#096b17]/30"
              ref={(el) => { shareRef.current = el; if (el) el.dataset.trackId = 'referral_share'; }}
            >
              <div className="px-4 py-3 border-b border-[#096b17]/20 flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900">Share on WhatsApp</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={copyShareToClipboard}
                  className="h-8 px-3 rounded-lg"
                  style={{ borderColor: BRAND, color: BRAND }}
                >
                  {copied ? <CheckIcon className="w-4 h-4 mr-2" /> : <CopyIcon className="w-4 h-4 mr-2" />}
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>
              <div className="p-4">
                <pre className="whitespace-pre-wrap text-sm text-gray-800">{whatsappShareText}</pre>
                <div className="mt-3 flex flex-col sm:flex-row gap-2">
                  <Button
                    type="button"
                    onClick={openWhatsAppShare}
                    className="rounded-xl text-white"
                    style={{ backgroundColor: BRAND }}
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Share on WhatsApp
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl"
                    style={{ color: BRAND, borderColor: BRAND }}
                    onClick={() => {
                      dlPush({ event: 'aura_results_cta_click', aura_event_id: eventIdRef.current, label: 'Book Free Clarity Call (share card)' });
                      trackButtonClick('Book Free Clarity Call', 'cta', 'results_share_card');
                      window.open(`${SITE_BASE}/contact`, '_blank');
                    }}
                  >
                    Book Free Clarity Call
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Your referral code: <code className="font-semibold">{referralCode}</code> • Link:{' '}
                  <a
                    href={referralLink}
                    className="underline"
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
        )}

        {/* Next-step CTAs */}
        <Card
          className="p-6 text-center border-[#096b17]/10"
          ref={(el) => { ctaRef.current = el; if (el) el.dataset.trackId = 'results_ctas'; }}
        >
          <h3 className="text-xl text-gray-900 mb-3">Ready to take your next step?</h3>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => {
                dlPush({ event: 'aura_results_cta_click', aura_event_id: eventIdRef.current, label: 'Book Free Clarity Call' });
                trackButtonClick('Book Free Clarity Call', 'cta', 'results_bottom');
                window.location.assign('/contact');
              }}
              className="sm:w-auto w-full rounded-xl text-white"
              style={{ backgroundColor: BRAND }}
            >
              Book Free Clarity Call
            </Button>
            <Button
              onClick={() => {
                dlPush({ event: 'aura_results_cta_click', aura_event_id: eventIdRef.current, label: 'Chat Now on WhatsApp' });
                trackButtonClick('Chat Now on WhatsApp', 'cta', 'results_bottom');
                window.open('https://wa.me/917021227203?text=' + encodeURIComponent('Hi! I completed my AURA Index and would like to chat.'), '_blank', 'noopener,noreferrer');
              }}
              className="sm:w-auto w-full rounded-xl bg-white border"
              style={{ color: BRAND, borderColor: BRAND }}
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
              className="sm:w-auto w-full rounded-xl bg-white border"
              style={{ color: BRAND, borderColor: BRAND }}
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
              className="sm:w-auto w-full rounded-xl bg-white border"
              style={{ color: BRAND, borderColor: BRAND }}
            >
              Book Consultation Now
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
