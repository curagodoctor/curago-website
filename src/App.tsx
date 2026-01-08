// src/App.tsx
import { useEffect, useState, lazy, Suspense } from 'react';
import { Toaster } from './components/ui/sonner';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import {
  trackPageView,
  trackButtonClick,
  trackReferralInit, // ✅ new
} from './utils/tracking';

// ⚡ Lazy load heavy components - loads only when needed
const Hero = lazy(() => import('./components/Hero').then(m => ({ default: m.Hero })));
const Services = lazy(() => import('./components/Services').then(m => ({ default: m.Services })));
const ExpertiseScroller = lazy(() => import('./components/ExpertiseScroller').then(m => ({ default: m.ExpertiseScroller })));
const MentalHealthTeam = lazy(() => import('./components/MentalHealthTeam').then(m => ({ default: m.MentalHealthTeam })));
const MentalHealthTeamPage = lazy(() => import('./components/MentalHealthTeamPage').then(m => ({ default: m.MentalHealthTeamPage })));
const BookingFormPage = lazy(() => import('./components/BookingFormPage').then(m => ({ default: m.BookingFormPage })));
const About = lazy(() => import('./components/About').then(m => ({ default: m.About })));
const Contact = lazy(() => import('./components/Contact').then(m => ({ default: m.Contact })));
const FloatingButtons = lazy(() => import('./components/FloatingButtons').then(m => ({ default: m.FloatingButtons })));
const TestimonialsMarquee = lazy(() => import('./components/Testimonials'));

// AURA bundle - lazy loaded
const AuraLandingPage = lazy(() => import('./components/assessment').then(m => ({ default: m.AuraLandingPage })));
const AuraQuizFlow = lazy(() => import('./components/assessment').then(m => ({ default: m.AuraQuizFlow })));
const AuraResultScreen = lazy(() => import('./components/assessment').then(m => ({ default: m.AuraResultScreen })));

// ATM bundle - lazy loaded
const AtmLandingPage = lazy(() => import('./components/assessment/atm').then(m => ({ default: m.AtmLandingPage })));
const AtmWindDownScreen = lazy(() => import('./components/assessment/atm').then(m => ({ default: m.AtmWindDownScreen })));
const AtmQualificationScreen = lazy(() => import('./components/assessment/atm').then(m => ({ default: m.AtmQualificationScreen })));
const AtmDummyQuizFlow = lazy(() => import('./components/assessment/atm').then(m => ({ default: m.AtmDummyQuizFlow })));
const AtmDummyResultScreen = lazy(() => import('./components/assessment/atm').then(m => ({ default: m.AtmDummyResultScreen })));
const AtmQuizFlow = lazy(() => import('./components/assessment/atm').then(m => ({ default: m.AtmQuizFlow })));
const AtmResultScreen = lazy(() => import('./components/assessment/atm').then(m => ({ default: m.AtmResultScreen })));

// Consultation bundle - lazy loaded
const ConsultationThankYouPage = lazy(() => import('./components/ConsultationThankYouPage'));
const ConsultationLandingPage = lazy(() => import('./components/ConsultationLandingPage'));

// CuraGo's Anxiety Loop Assessment Tool 1.0 bundle - lazy loaded
const CalmLandingPage = lazy(() => import('./components/CalmLandingPage'));
const QuizFlow = lazy(() => import('./components/assessment/calm/QuizFlow'));
const AnalyzingScreen = lazy(() => import('./components/assessment/calm/AnalyzingScreen'));
const ResultScreen = lazy(() => import('./components/assessment/calm/ResultScreen'));
const CalmTermsAndConditions = lazy(() => import('./components/CalmTermsAndConditions'));

// GBSI (Gut Brain Sensitivity Index) bundle - lazy loaded
const GbsiLandingPage = lazy(() => import('./components/assessment/gbsi').then(m => ({ default: m.GbsiLandingPage })));
const GbsiQuizFlow = lazy(() => import('./components/assessment/gbsi').then(m => ({ default: m.GbsiQuizFlow })));
const GbsiResultScreen = lazy(() => import('./components/assessment/gbsi').then(m => ({ default: m.GbsiResultScreen })));

// Keep these as regular imports (small utilities)
import { calculateCalmResult } from './components/assessment/calm/scoringEngine';
import { sendCalaResultsToGoogleSheets, sendGbsiResultsToGoogleSheets } from './utils/googleSheets';
import { calculateGbsiResult } from './components/assessment/gbsi/scoringEngine';
import { submitGbsiCompletion } from './utils/wylto';

// ✅ Single source of truth for types (new 8-pillar model)
import type { QuizAnswers, UserInfo, AuraScores } from './types/aura';
import type { AtmAnswers, AtmUserInfo } from './types/atm';
import type { CalmAnswers, CalmUserInfo, CalmResult } from './types/calm';
import type { GbsiAnswers, GbsiUserInfo, GbsiResult } from './types/gbsi';

type SitePage = 'home' | 'team' | 'booking' | 'contact';

const getPathname = () =>
  (typeof window !== 'undefined' ? window.location.pathname : '/') || '/';

const isAuraPath = (p: string) => p.startsWith('/aura-rise-index');
const isAtmPath = (p: string) => p.startsWith('/atm');
const isCalmPath = (p: string) => p.startsWith('/cala');
const isGbsiPath = (p: string) => p.startsWith('/gbsi');
const isConsultationPath = (p: string) => p === '/bookconsultation' || p === '/paymentSuccess';

/** =========================
 *  Referral-safe URL helpers
 *  ========================= */

// current ?query (e.g., ?ref=IN9000000000), or '' if none
const getCurrentSearch = () =>
  (typeof window !== 'undefined' ? window.location.search : '') || '';

const buildUrl = (path: string, hash = '') => {
  const search = getCurrentSearch(); // preserve ?ref and any future params
  // normalize hash to start with '#' or be empty
  const normalizedHash = hash ? (hash.startsWith('#') ? hash : `#${hash}`) : '';
  return `${path}${search}${normalizedHash}`;
};

export default function App() {
  // ---------- Marketing site state ----------
  const [currentPage, setCurrentPage] = useState<SitePage>('home');

  // ---------- AURA state ----------
  const [auraStage, setAuraStage] =
    useState<'landing' | 'quiz' | 'results'>('landing');
  const [answers, setAnswers] = useState<QuizAnswers | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [scores, setScores] = useState<AuraScores | null>(null);

  // ---------- ATM state ----------
  const [atmStage, setAtmStage] =
    useState<'landing' | 'winddown' | 'qualification' | 'dummy-quiz' | 'dummy-results' | 'quiz' | 'results'>('landing');
  const [atmAnswers, setAtmAnswers] = useState<AtmAnswers | null>(null);
  const [atmUserInfo, setAtmUserInfo] = useState<AtmUserInfo | null>(null);
  const [isDummyFlow, setIsDummyFlow] = useState<boolean>(false);
  const [dummyAnswers, setDummyAnswers] = useState<AtmAnswers | null>(null);
  const [dummyUserInfo, setDummyUserInfo] = useState<AtmUserInfo | null>(null);

  // ---------- CALM state ----------
  const [calmStage, setCalmStage] = useState<'landing' | 'quiz' | 'analyzing' | 'results' | 'terms'>('landing');
  const [calmAnswers, setCalmAnswers] = useState<CalmAnswers | null>(null);
  const [calmUserInfo, setCalmUserInfo] = useState<CalmUserInfo | null>(null);
  const [calmResult, setCalmResult] = useState<CalmResult | null>(null);

  // ---------- GBSI state ----------
  const [gbsiStage, setGbsiStage] = useState<'landing' | 'quiz' | 'results'>('landing');
  const [gbsiAnswers, setGbsiAnswers] = useState<GbsiAnswers | null>(null);
  const [gbsiUserInfo, setGbsiUserInfo] = useState<GbsiUserInfo | null>(null);
  const [gbsiResult, setGbsiResult] = useState<GbsiResult | null>(null);

  // Which branch of the app are we on?
  const [isAuraRoute, setIsAuraRoute] = useState<boolean>(
    isAuraPath(getPathname())
  );
  const [isAtmRoute, setIsAtmRoute] = useState<boolean>(
    isAtmPath(getPathname())
  );
  const [isCalmRoute, setIsCalmRoute] = useState<boolean>(
    isCalmPath(getPathname())
  );
  const [isGbsiRoute, setIsGbsiRoute] = useState<boolean>(
    isGbsiPath(getPathname())
  );
  const [isConsultationRoute, setIsConsultationRoute] = useState<boolean>(
    isConsultationPath(getPathname())
  );

  // ---------- Record referral once (captures ?ref=...) ----------
  useEffect(() => {
    trackReferralInit();
  }, []);


  // ---------- Hash routing (marketing pages) ----------
  useEffect(() => {
    if (isAuraRoute || isAtmRoute || isCalmRoute || isGbsiRoute || isConsultationRoute) return;

    const handleHashChange = () => {
      // Ensure /contact#... becomes just /#... to keep single-shell SPA feel
      if (window.location.pathname === '/contact' && window.location.hash) {
        history.replaceState(null, '', buildUrl('/', window.location.hash));
      }

      const hash = window.location.hash;

      if (hash === '#mental-health-team') {
        setCurrentPage('team');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        trackPageView('Mental Health Team', 'CuraGo - Mental Health Team');
      } else if (hash === '#booking') {
        setCurrentPage('booking');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        trackPageView('Booking Form', 'CuraGo - Book Your Consultation');
      } else if (hash === '#home' || hash === '') {
        setCurrentPage('home');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        trackPageView('Home', 'CuraGo - Professional Healthcare At Your Doorstep');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [isAuraRoute, isAtmRoute, isCalmRoute, isGbsiRoute]);

  // ---------- Path routing (/contact and /aura-rise-index*) ----------
  useEffect(() => {
    const syncFromPath = () => {
      const { pathname, hash } = window.location;
      console.log('🔄 syncFromPath:', { pathname, hash, isAuraRoute, isAtmRoute });

      setIsAuraRoute(isAuraPath(pathname));
      setIsAtmRoute(isAtmPath(pathname));
      setIsCalmRoute(isCalmPath(pathname));
      setIsGbsiRoute(isGbsiPath(pathname));
      setIsConsultationRoute(isConsultationPath(pathname));

      // AURA routes
      if (pathname === '/aura-rise-index') {
        setAuraStage('landing');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        trackPageView('AURA Landing', 'CuraGo - A.U.R.A Index');
        return;
      }
      if (pathname === '/aura-rise-index/quiz') {
        setAuraStage('quiz');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        trackPageView('AURA Quiz', 'CuraGo - A.U.R.A Quiz');
        return;
      }
      if (pathname === '/aura-rise-index/results') {
        setAuraStage('results');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        trackPageView('AURA Results', 'CuraGo - A.U.R.A Results');

        // ✅ Developer-added GTM signal for CompleteRegistration (AURA finish)
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'aura_test_finished_signal', // 👈 must match GTM Custom Event trigger name exactly
          page_path: pathname,
          timestamp: new Date().toISOString(),
        });

        console.log('✅ GTM signal fired: aura_test_finished_signal');
        return;
      }

      // ATM routes
      if (pathname === '/atm') {
        setAtmStage('landing');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        trackPageView('ATM Landing', 'CuraGo - Anxiety Trigger Mapping');
        return;
      }
      if (pathname === '/atm/quiz') {
        setAtmStage('quiz');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        trackPageView('ATM Quiz', 'CuraGo - ATM Quiz');
        return;
      }
      if (pathname === '/atm/results') {
        setAtmStage('results');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        trackPageView('ATM Results', 'CuraGo - ATM Results');

        // ✅ Developer-added GTM signal for CompleteRegistration (ATM finish)
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'atm_test_finished_signal', // 👈 must match GTM Custom Event trigger name exactly
          page_path: pathname,
          timestamp: new Date().toISOString(),
        });

        console.log('✅ GTM signal fired: atm_test_finished_signal');
        return;
      }
      if (pathname === '/atm/wind-down') {
        setAtmStage('winddown');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        trackPageView('ATM Wind-down', 'CuraGo - Wind Down');
        return;
      }
      if (pathname === '/atm/qualification') {
        setAtmStage('qualification');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        trackPageView('ATM Qualification', 'CuraGo - Intent Qualification');
        return;
      }
      if (pathname === '/atm/preview') {
        setAtmStage('dummy-quiz');
        setIsDummyFlow(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        trackPageView('ATM Preview', 'CuraGo - Anxiety Assessment Preview');
        return;
      }
      if (pathname === '/atm/preview-results') {
        setAtmStage('dummy-results');
        setIsDummyFlow(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        trackPageView('ATM Preview Results', 'CuraGo - Assessment Preview Results');
        return;
      }

      // CuraGo's Anxiety Loop Assessment Tool 1.0 routes
      if (pathname === '/cala') {
        setCalmStage('landing');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        trackPageView('CuraGo\'s Anxiety Loop Assessment Tool 1.0 Landing', 'CuraGo - Anxiety Loop Assessment Tool 1.0');
        return;
      }
      if (pathname === '/cala/quiz') {
        setCalmStage('quiz');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        trackPageView('CuraGo\'s Anxiety Loop Assessment Tool 1.0 Quiz', 'CuraGo - Anxiety Loop Assessment Tool 1.0 Quiz');
        return;
      }
      if (pathname === '/cala/analyzing') {
        setCalmStage('analyzing');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        trackPageView('CuraGo\'s Anxiety Loop Assessment Tool 1.0 Analyzing', 'CuraGo - Analyzing Anxiety Loop Assessment Results');
        return;
      }
      if (pathname === '/cala/results') {
        setCalmStage('results');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        trackPageView('CuraGo\'s Anxiety Loop Assessment Tool 1.0 Results', 'CuraGo - Anxiety Loop Assessment Tool 1.0 Results');

        // ✅ Developer-added GTM signal for CompleteRegistration (CuraGo's Anxiety Loop Assessment Tool 1.0 finish)
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'cala_test_finished_signal',
          page_path: pathname,
          timestamp: new Date().toISOString(),
        });

        console.log('✅ GTM signal fired: cala_test_finished_signal');
        return;
      }
      if (pathname === '/cala/terms') {
        setCalmStage('terms');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        trackPageView('CuraGo\'s Anxiety Loop Assessment Tool 1.0 Terms & Conditions', 'CuraGo - Anxiety Loop Assessment Tool 1.0 Terms & Conditions');
        return;
      }

      // GBSI (Gut Brain Sensitivity Index) routes
      if (pathname === '/gbsi') {
        setGbsiStage('landing');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        trackPageView('GBSI Landing', 'CuraGo - Gut Brain Sensitivity Index');
        return;
      }
      if (pathname === '/gbsi/quiz') {
        setGbsiStage('quiz');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        trackPageView('GBSI Quiz', 'CuraGo - GBSI Quiz');
        return;
      }
      if (pathname === '/gbsi/results') {
        setGbsiStage('results');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        trackPageView('GBSI Results', 'CuraGo - GBSI Results');

        // ✅ Developer-added GTM signal for CompleteRegistration (GBSI finish)
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'gbsi_test_finished_signal',
          page_path: pathname,
          timestamp: new Date().toISOString(),
        });

        console.log('✅ GTM signal fired: gbsi_test_finished_signal');
        return;
      }

      // Contact route (full page)
      if (pathname === '/contact') {
        setCurrentPage('contact');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        trackPageView('Contact Us', 'CuraGo - Get in Touch');
        return;
      }

      // Book consultation landing page route
      if (pathname === '/bookconsultation') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        trackPageView('Book Consultation', 'CuraGo - Talk to an Anxiety Specialist');
        return;
      }

      // Payment success thank you route
      if (pathname === '/paymentSuccess') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        trackPageView('Payment Success', 'CuraGo - Booking Confirmed');
        return;
      }

      // Handle home route (root path with no hash or #home)
      if (pathname === '/' || pathname === '') {
        if (!window.location.hash || window.location.hash === '#home') {
          setCurrentPage('home');
          trackPageView('Home', 'CuraGo - Professional Healthcare At Your Doorstep');
        }
        return;
      }
      
      // Fallback for other paths
      console.log('🤔 Unhandled path:', pathname, 'hash:', window.location.hash);
    };

    syncFromPath();
    window.addEventListener('popstate', syncFromPath);
    return () => window.removeEventListener('popstate', syncFromPath);
  }, []);

  // ---------- Marketing nav helpers (hash) ----------
  const navigateToBooking = () => {
    trackButtonClick('Book Now', 'navigation', window.location.hash);
    // Redirect to consultation landing page with Razorpay payment
    window.location.href = buildUrl('/bookconsultation');
  };

  const handleNavigate = (page: string) => {
    console.log('🧭 Navigating to:', page, 'from current route:', { isAuraRoute, isAtmRoute, isCalmRoute, isGbsiRoute, currentPage });

    if (page === 'home') {
      history.pushState(null, '', buildUrl('/', '#home'));
      setIsAuraRoute(false);
      setIsAtmRoute(false);
      setIsCalmRoute(false);
      setIsGbsiRoute(false);
      setCurrentPage('home');
      // Force a popstate event to trigger route sync
      window.dispatchEvent(new PopStateEvent('popstate'));
    } else if (page === 'team') {
      history.pushState(null, '', buildUrl('/', '#mental-health-team'));
      setIsAuraRoute(false);
      setIsAtmRoute(false);
      setIsCalmRoute(false);
      setIsGbsiRoute(false);
      setCurrentPage('team');
      window.dispatchEvent(new PopStateEvent('popstate'));
    } else if (page === 'booking') {
      history.pushState(null, '', buildUrl('/', '#booking'));
      setIsAuraRoute(false);
      setIsAtmRoute(false);
      setIsCalmRoute(false);
      setIsGbsiRoute(false);
      setCurrentPage('booking');
      window.dispatchEvent(new PopStateEvent('popstate'));
    } else if (page === 'contact') {
      console.log('🧭 Navigating to contact page from:', { isAuraRoute, isAtmRoute, isCalmRoute, isGbsiRoute, currentPage });
      // Use window.location.href for clean navigation
      const contactUrl = buildUrl('/contact');
      window.location.href = contactUrl;
      return; // Exit early
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ---------- AURA nav helpers (path) ----------
  const goToAura = (stage: 'landing' | 'quiz' | 'results') => {
    const path =
      stage === 'landing'
        ? '/aura-rise-index'
        : stage === 'quiz'
          ? '/aura-rise-index/quiz'
          : '/aura-rise-index/results';

    history.pushState(null, '', buildUrl(path));
    setIsAuraRoute(true);
    setAuraStage(stage);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Optional: immediate measurement for SPA push (we already track in the path effect)
    // trackPageView(`AURA ${stage}`, `CuraGo - A.U.R.A ${stage[0].toUpperCase() + stage.slice(1)}`);
  };

  const handleStartQuiz = () => goToAura('quiz');

  // ✅ NEW: compute scores using 1–5 inputs → 0–100 display
  const handleQuizComplete = (quizAnswers: QuizAnswers, user: UserInfo) => {
    setAnswers(quizAnswers);
    setUserInfo(user);

    const to100 = (v: number) => v * 20;

    // 4 primary pillars shown in current Result screen
    const awarenessScore = to100(quizAnswers.awareness);
    const understandingScore = to100(quizAnswers.understanding);
    const regulationScore = to100(quizAnswers.regulation);
    const alignmentScore = to100(quizAnswers.alignment);

    // keep the rest for radar / future expansion if your AuraScores type includes them
    const reflectionScore = to100(quizAnswers.reflection);
    const intellectScore = to100(quizAnswers.intellect);
    const selfScore = to100(quizAnswers.self);
    const emotionScore = to100(quizAnswers.emotion);

    // overall based on the 4 currently displayed pillars (match your UI)
    const overall =
      (awarenessScore +
        understandingScore +
        regulationScore +
        alignmentScore) / 4;

    const nextScores: AuraScores = {
      awareness: awarenessScore,
      understanding: understandingScore,
      regulation: regulationScore,
      alignment: alignmentScore,
      reflection: reflectionScore,
      intellect: intellectScore,
      self: selfScore,
      emotion: emotionScore,
      overall,
    };


    setScores(nextScores);
    goToAura('results');
  };

  const handleRetake = () => {
    setAnswers(null);
    setUserInfo(null);
    setScores(null);
    goToAura('landing');
  };

  // ---------- ATM nav helpers (path) ----------
  const goToAtm = (stage: 'landing' | 'quiz' | 'results') => {
    const path =
      stage === 'landing'
        ? '/atm'
        : stage === 'quiz'
        ? '/atm/quiz'
        : '/atm/results';

    history.pushState(null, '', buildUrl(path));
    setIsAtmRoute(true);
    setAtmStage(stage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartAtmQuiz = () => goToAtm('quiz');

  const handleAtmQuizComplete = (answers: AtmAnswers, userInfo: AtmUserInfo) => {
    setAtmAnswers(answers);
    setAtmUserInfo(userInfo);
    goToAtm('results');
  };

  const handleAtmRetake = () => {
    setAtmAnswers(null);
    setAtmUserInfo(null);
    setIsDummyFlow(false);
    setDummyAnswers(null);
    setDummyUserInfo(null);
    goToAtm('landing');
  };

  const goToAtmWindDown = () => {
    const path = '/atm/wind-down';
    history.pushState(null, '', buildUrl(path));
    setIsAtmRoute(true);
    setAtmStage('winddown');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToAtmQualification = () => {
    const path = '/atm/qualification';
    history.pushState(null, '', buildUrl(path));
    setIsAtmRoute(true);
    setAtmStage('qualification');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToAtmDummy = (stage: 'dummy-quiz' | 'dummy-results') => {
    const path = stage === 'dummy-quiz' ? '/atm/preview' : '/atm/preview-results';
    history.pushState(null, '', buildUrl(path));
    setIsAtmRoute(true);
    setIsDummyFlow(true);
    setAtmStage(stage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAtmWindDownComplete = () => goToAtmQualification();
  const handleAtmWindDownSkip = () => goToAtmDummy('dummy-quiz');
  const handleQualificationToDummy = () => goToAtmDummy('dummy-quiz');
  const handleQualificationToActual = () => goToAtm('quiz');

  const handleDummyQuizComplete = (answers: AtmAnswers, userInfo: AtmUserInfo) => {
    setDummyAnswers(answers);
    setDummyUserInfo(userInfo);
    goToAtmDummy('dummy-results');
  };

  // ---------- CALM nav helpers (path) ----------
  const goToCalm = (stage: 'landing' | 'quiz' | 'analyzing' | 'results' | 'terms') => {
    const path =
      stage === 'landing'
        ? '/cala'
        : stage === 'quiz'
        ? '/cala/quiz'
        : stage === 'analyzing'
        ? '/cala/analyzing'
        : stage === 'terms'
        ? '/cala/terms'
        : '/cala/results';

    history.pushState(null, '', buildUrl(path));
    setIsCalmRoute(true);
    setCalmStage(stage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartCalmQuiz = () => goToCalm('quiz');

  const handleCalmQuizComplete = async (userInfo: CalmUserInfo, answers: CalmAnswers, paymentId: string) => {
    setCalmUserInfo(userInfo);
    setCalmAnswers(answers);

    // Calculate the result immediately
    const result = calculateCalmResult(answers);
    setCalmResult(result);

    // Navigate to analyzing screen immediately (non-blocking)
    goToCalm('analyzing');

    // Generate event ID for tracking
    const eventId = `cala-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Send webhook with form data and CALA results - FIRES FIRST
    try {
      const webhookPayload = {
        action: "cala_assessment",
        contact: {
          name: userInfo.name,
          whatsapp: userInfo.whatsapp.startsWith('+91') ? userInfo.whatsapp : `+91${userInfo.whatsapp}`,
          email: userInfo.email || ""
        },
        assessment: {
          type: "CALA",
          primaryLoop: result.primaryLoop,
          secondaryLoop: result.secondaryLoop,
          triggerType: result.triggerType,
          reinforcement: result.reinforcement,
          loadCapacityBand: result.loadCapacityBand,
          stability: result.stability,
          loopScores: result.loopScores,
          answers: answers
        },
        timestamp: new Date().toISOString()
      };

      await fetch('https://server.wylto.com/webhook/878qqFtbh3oZYJjbEc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookPayload)
      });

      console.log('✅ CALA assessment webhook sent successfully');
    } catch (error) {
      console.error('❌ Failed to send CALA assessment webhook:', error);
    }

    // Minimum wait time for analyzing screen (5 seconds for better UX)
    const minWaitTime = new Promise(resolve => setTimeout(resolve, 5000));

    // Send to Google Sheets in background (async, non-blocking)
    const apiCall = sendCalaResultsToGoogleSheets({
      testType: 'cala_tool',
      name: userInfo.name,
      email: userInfo.email || '',
      phoneNumber: userInfo.whatsapp,
      primaryLoop: result.primaryLoop,
      secondaryLoop: result.secondaryLoop,
      triggerType: result.triggerType,
      reinforcement: result.reinforcement,
      loadCapacityBand: result.loadCapacityBand,
      stability: result.stability,
      loopScores: result.loopScores,
      eventId: eventId,
    }).then(() => {
      console.log('✅ CALA results sent to Google Sheets');
    }).catch((error) => {
      console.error('❌ Failed to send CALA results:', error);
      // Continue to results even if API fails
    });

    // Mark quiz as completed in parallel with results submission
    const markCompletionCall = sendCalaResultsToGoogleSheets({
      action: 'mark_completion',
      payment_id: paymentId,
      name: userInfo.name,
      email: userInfo.email || '',
      phone: userInfo.whatsapp
    }).then(() => {
      console.log('✅ Quiz marked as completed');
    }).catch((error) => {
      console.error('❌ Failed to mark quiz as completed:', error);
      // Continue to results even if marking fails
    });

    // Wait for minimum time and both API calls to complete
    await Promise.all([minWaitTime, apiCall, markCompletionCall]);

    // Navigate to results
    goToCalm('results');
  };

  const handleCalmRetake = () => {
    setCalmAnswers(null);
    setCalmUserInfo(null);
    setCalmResult(null);
    goToCalm('landing');
  };

  // ---------- GBSI nav helpers (path) ----------
  const goToGbsi = (stage: 'landing' | 'quiz' | 'results') => {
    const path =
      stage === 'landing'
        ? '/gbsi'
        : stage === 'quiz'
        ? '/gbsi/quiz'
        : '/gbsi/results';

    history.pushState(null, '', buildUrl(path));
    setIsGbsiRoute(true);
    setGbsiStage(stage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartGbsiQuiz = () => goToGbsi('quiz');

  const handleGbsiQuizComplete = async (answers: GbsiAnswers, userInfo: GbsiUserInfo) => {
    setGbsiAnswers(answers);
    setGbsiUserInfo(userInfo);

    // Calculate the result
    const result = calculateGbsiResult(answers);
    setGbsiResult(result);

    // Send results to Google Sheets
    const eventId = `gbsi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const gbsiData = {
      testType: 'gbsi_tool' as const,
      name: userInfo.name,
      email: userInfo.email || '',
      phoneNumber: userInfo.whatsapp,
      age: answers.age,
      alarmingSigns: answers.alarmingSigns,
      familyHistory: answers.familyHistory,
      painFrequency: answers.painFrequency,
      reliefFactor: answers.reliefFactor,
      bristolType: answers.bristolType,
      refluxFrequency: answers.refluxFrequency,
      fullnessFactor: answers.fullnessFactor,
      fattyLiver: answers.fattyLiver,
      stressLevel: answers.stressLevel,
      brainFog: answers.brainFog,
      dietaryHabits: answers.dietaryHabits,
      resultType: result.resultType,
      ibsType: result.ibsType,
      hasRedFlags: result.hasRedFlags,
      brainGutSensitivity: result.brainGutSensitivity,
      axisScore: result.axisScore,
      eventId: eventId
    };

    // Send to Google Sheets (non-blocking)
    sendGbsiResultsToGoogleSheets(gbsiData).catch(err => {
      console.error('Failed to send GBSI results to Google Sheets:', err);
    });

    // Send GBSI completion webhook with user data (non-blocking)
    submitGbsiCompletion({
      name: userInfo.name,
      whatsapp: userInfo.whatsapp,
      email: userInfo.email
    }).catch(err => {
      console.error('Failed to send GBSI completion webhook:', err);
    });

    goToGbsi('results');
  };

  const handleGbsiRetake = () => {
    setGbsiAnswers(null);
    setGbsiUserInfo(null);
    setGbsiResult(null);
    goToGbsi('landing');
  };

  // ---------- Handle refresh on results pages without data ----------
  useEffect(() => {
    // If we're on ATM results page but have no answers, redirect to landing
    if (isAtmRoute && atmStage === 'results' && !atmAnswers) {
      console.log('🔄 ATM Results page accessed without data, redirecting to landing');
      goToAtm('landing');
      return;
    }

    // If we're on AURA results page but have no scores, redirect to landing
    if (isAuraRoute && auraStage === 'results' && !scores) {
      console.log('🔄 AURA Results page accessed without data, redirecting to landing');
      goToAura('landing');
      return;
    }

    // If we're on CALM results page but have no result, redirect to landing
    if (isCalmRoute && calmStage === 'results' && !calmResult) {
      console.log('🔄 CALM Results page accessed without data, redirecting to landing');
      goToCalm('landing');
      return;
    }

    // If we're on GBSI results page but have no result, redirect to landing
    if (isGbsiRoute && gbsiStage === 'results' && !gbsiResult) {
      console.log('🔄 GBSI Results page accessed without data, redirecting to landing');
      goToGbsi('landing');
      return;
    }
  }, [isAtmRoute, atmStage, atmAnswers, isAuraRoute, auraStage, scores, isCalmRoute, calmStage, calmResult, isGbsiRoute, gbsiStage, gbsiResult]);

  // Loading fallback component
  const LoadingSpinner = () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-4 border-gray-300 border-t-teal-500 rounded-full mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading...</p>
      </div>
    </div>
  );

  // ---------- Render ----------
  if (isAuraRoute) {
    return (
      <div className="min-h-screen bg-white scroll-smooth">
        <Toaster />
        <Navbar
          onBookAppointment={navigateToBooking}
          currentPage="aura"
          onNavigate={handleNavigate}
        />

        <Suspense fallback={<LoadingSpinner />}>
          {auraStage === 'landing' && <AuraLandingPage onStart={handleStartQuiz} />}
          {auraStage === 'quiz' && <AuraQuizFlow onComplete={handleQuizComplete} />}
          {auraStage === 'results' && scores && userInfo && (
            <AuraResultScreen
              scores={scores}
              userInfo={userInfo}
              onRetake={handleRetake}
              answers={answers || undefined}
            />
          )}
          {auraStage === 'results' && (!scores || !userInfo) && (
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-600 mb-4">Redirecting to start...</p>
                <div className="animate-spin w-8 h-8 border-4 border-gray-300 border-t-teal-500 rounded-full mx-auto"></div>
              </div>
            </div>
          )}
        </Suspense>

        <Footer />
      </div>
    );
  }

  if (isAtmRoute) {
    return (
      <div className="min-h-screen bg-white scroll-smooth">
        <Toaster />
        <Navbar
          onBookAppointment={navigateToBooking}
          currentPage="atm"
          onNavigate={handleNavigate}
        />

        <Suspense fallback={<LoadingSpinner />}>
          {atmStage === 'landing' && (
            <AtmLandingPage
              onStart={handleStartAtmQuiz}
              onNavigateToWindDown={goToAtmWindDown}
              onNavigateToDummy={() => goToAtmDummy('dummy-quiz')}
            />
          )}
          {atmStage === 'winddown' && (
            <AtmWindDownScreen
              onComplete={handleAtmWindDownComplete}
              onSkip={handleAtmWindDownSkip}
            />
          )}
          {atmStage === 'qualification' && (
            <AtmQualificationScreen
              onNavigateToActual={handleQualificationToActual}
              onNavigateToDummy={handleQualificationToDummy}
            />
          )}
          {atmStage === 'dummy-quiz' && (
            <AtmDummyQuizFlow onComplete={handleDummyQuizComplete} />
          )}
          {atmStage === 'dummy-results' && dummyAnswers && dummyUserInfo && (
            <AtmDummyResultScreen
              answers={dummyAnswers}
              userInfo={dummyUserInfo}
              onRetake={handleAtmRetake}
              onUpgradeToFull={() => goToAtm('quiz')}
            />
          )}
          {atmStage === 'quiz' && <AtmQuizFlow onComplete={handleAtmQuizComplete} />}
          {atmStage === 'results' && atmAnswers && atmUserInfo && (
            <AtmResultScreen
              answers={atmAnswers}
              userInfo={atmUserInfo}
              onRetake={handleAtmRetake}
            />
          )}
          {atmStage === 'results' && (!atmAnswers || !atmUserInfo) && (
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-600 mb-4">Redirecting to start...</p>
                <div className="animate-spin w-8 h-8 border-4 border-gray-300 border-t-teal-500 rounded-full mx-auto"></div>
              </div>
            </div>
          )}
        </Suspense>

        <Footer />
      </div>
    );
  }

  // CuraGo's Anxiety Loop Assessment Tool 1.0 route
  if (isCalmRoute) {
    // Quiz stage - full screen, no navbar/footer
    if (calmStage === 'quiz') {
      return (
        <>
          <Toaster />
          <Suspense fallback={<LoadingSpinner />}>
            <QuizFlow onComplete={handleCalmQuizComplete} />
          </Suspense>
        </>
      );
    }

    // Analyzing stage - full screen, no navbar/footer
    if (calmStage === 'analyzing') {
      return (
        <>
          <Toaster />
          <Suspense fallback={<LoadingSpinner />}>
            <AnalyzingScreen userName={calmUserInfo?.name || 'there'} />
          </Suspense>
        </>
      );
    }

    // Landing and results - with navbar/footer but NO white background
    return (
      <>
        <Toaster />
        <Navbar
          onBookAppointment={navigateToBooking}
          currentPage="calm"
          onNavigate={handleNavigate}
        />

        <Suspense fallback={<LoadingSpinner />}>
          {calmStage === 'landing' && (
            <CalmLandingPage onStartAssessment={handleStartCalmQuiz} />
          )}

          {calmStage === 'results' && calmResult && calmUserInfo && (
            <ResultScreen
              result={calmResult}
              userName={calmUserInfo.name}
            />
          )}

          {calmStage === 'results' && (!calmResult || !calmUserInfo) && (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#096b17] via-[#075110] to-[#053d0b]">
              <div className="text-center">
                <p className="text-white mb-4">Redirecting to start...</p>
                <div className="animate-spin w-8 h-8 border-4 border-white/30 border-t-[#64CB81] rounded-full mx-auto"></div>
              </div>
            </div>
          )}

          {calmStage === 'terms' && <CalmTermsAndConditions />}
        </Suspense>

        {(calmStage === 'landing' || calmStage === 'terms') && <Footer />}
      </>
    );
  }

  // GBSI (Gut Brain Sensitivity Index) route
  if (isGbsiRoute) {
    return (
      <div className="min-h-screen bg-white scroll-smooth">
        <Toaster />
        <Navbar
          onBookAppointment={navigateToBooking}
          currentPage="gbsi"
          onNavigate={handleNavigate}
        />

        <Suspense fallback={<LoadingSpinner />}>
          {gbsiStage === 'landing' && (
            <GbsiLandingPage onStart={handleStartGbsiQuiz} />
          )}

          {gbsiStage === 'quiz' && (
            <GbsiQuizFlow onComplete={handleGbsiQuizComplete} />
          )}

          {gbsiStage === 'results' && gbsiResult && gbsiUserInfo && gbsiAnswers && (
            <GbsiResultScreen
              result={gbsiResult}
              answers={gbsiAnswers}
              userName={gbsiUserInfo.name}
              onRetake={handleGbsiRetake}
            />
          )}

          {gbsiStage === 'results' && (!gbsiResult || !gbsiUserInfo || !gbsiAnswers) && (
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-600 mb-4">Redirecting to start...</p>
                <div className="animate-spin w-8 h-8 border-4 border-gray-300 border-t-teal-500 rounded-full mx-auto"></div>
              </div>
            </div>
          )}
        </Suspense>

        <Footer />
      </div>
    );
  }

  // Consultation routes
  if (isConsultationRoute) {
    const pathname = getPathname();
    return (
      <div className="min-h-screen bg-white scroll-smooth">
        <Toaster />
        <Navbar
          onBookAppointment={navigateToBooking}
          currentPage="booking"
          onNavigate={handleNavigate}
        />
        <Suspense fallback={<LoadingSpinner />}>
          {pathname === '/bookconsultation' && <ConsultationLandingPage />}
          {pathname === '/paymentSuccess' && <ConsultationThankYouPage />}
        </Suspense>
        <Footer />
      </div>
    );
  }

  // Marketing site
  return (
    <div className="min-h-screen bg-white scroll-smooth">
      <Toaster />
      <Suspense fallback={null}>
        <FloatingButtons onBookNow={navigateToBooking} />
      </Suspense>

      <Navbar
        onBookAppointment={navigateToBooking}
        currentPage={currentPage}
        onNavigate={handleNavigate}
      />

      <Suspense fallback={<LoadingSpinner />}>
        {currentPage === 'home' ? (
          <>
            <Hero onBookAppointment={navigateToBooking} />
            <Services />
            <ExpertiseScroller />
            <MentalHealthTeam
              onViewAllTeam={() => handleNavigate('team')}
              onBookNow={navigateToBooking}
            />
            <TestimonialsMarquee />
            <About onGetStarted={navigateToBooking} />
            <Contact />
            <Footer />
          </>
        ) : currentPage === 'booking' ? (
          <>
            <BookingFormPage />
            <Footer />
          </>
        ) : currentPage === 'team' ? (
          <>
            <MentalHealthTeamPage onBookAppointment={navigateToBooking} />
            <Footer />
          </>
        ) : currentPage === 'contact' ? (
          <>
            <Contact />
            <Footer />
          </>
        ) : null}
      </Suspense>
    </div>
  );
}
