// src/App.tsx
import { useEffect, useState } from 'react';
import { Toaster } from './components/ui/sonner';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Services } from './components/Services';
import { ExpertiseScroller } from './components/ExpertiseScroller';
import { MentalHealthTeam } from './components/MentalHealthTeam';
import { MentalHealthTeamPage } from './components/MentalHealthTeamPage';
import { BookingFormPage } from './components/BookingFormPage';
import { About } from './components/About';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { FloatingButtons } from './components/FloatingButtons';
import {
  trackPageView,
  trackButtonClick,
  trackReferralInit, // ✅ new
} from './utils/tracking';
import TestimonialsMarquee from './components/Testimonials';

// AURA bundle (barrel also brings its CSS)
import {
  AuraLandingPage,
  AuraQuizFlow,
  AuraResultScreen,
} from './components/assessment';
import {
  AtmLandingPage,
  AtmWindDownScreen,
  AtmQualificationScreen,
  AtmDummyQuizFlow,
  AtmDummyResultScreen,
  AtmQuizFlow,
  AtmResultScreen,
} from './components/assessment/atm';
import ConsultationThankYouPage from './components/ConsultationThankYouPage';
import ConsultationLandingPage from './components/ConsultationLandingPage';
import CalmLandingPage from './components/CalmLandingPage';
import QuizFlow from './components/assessment/calm/QuizFlow';
import AnalyzingScreen from './components/assessment/calm/AnalyzingScreen';
import ResultScreen from './components/assessment/calm/ResultScreen';
import CalmTermsAndConditions from './components/CalmTermsAndConditions';
import { calculateCalmResult } from './components/assessment/calm/scoringEngine';
import { sendCalmResultsToGoogleSheets } from './utils/googleSheets';

// ✅ Single source of truth for types (new 8-pillar model)
import type { QuizAnswers, UserInfo, AuraScores } from './types/aura';
import type { AtmAnswers, AtmUserInfo } from './types/atm';
import type { CalmAnswers, CalmUserInfo, CalmResult } from './types/calm';

type SitePage = 'home' | 'team' | 'booking' | 'contact';

const getPathname = () =>
  (typeof window !== 'undefined' ? window.location.pathname : '/') || '/';

const isAuraPath = (p: string) => p.startsWith('/aura-rise-index');
const isAtmPath = (p: string) => p.startsWith('/atm');
const isCalmPath = (p: string) => p.startsWith('/calm');
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
  const [isConsultationRoute, setIsConsultationRoute] = useState<boolean>(
    isConsultationPath(getPathname())
  );

  // ---------- Record referral once (captures ?ref=...) ----------
  useEffect(() => {
    trackReferralInit();
  }, []);


  // ---------- Hash routing (marketing pages) ----------
  useEffect(() => {
    if (isAuraRoute || isAtmRoute || isCalmRoute || isConsultationRoute) return;

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
  }, [isAuraRoute, isAtmRoute, isCalmRoute]);

  // ---------- Path routing (/contact and /aura-rise-index*) ----------
  useEffect(() => {
    const syncFromPath = () => {
      const { pathname, hash } = window.location;
      console.log('🔄 syncFromPath:', { pathname, hash, isAuraRoute, isAtmRoute });

      setIsAuraRoute(isAuraPath(pathname));
      setIsAtmRoute(isAtmPath(pathname));
      setIsCalmRoute(isCalmPath(pathname));
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

      // CALM 1.0 routes
      if (pathname === '/calm') {
        setCalmStage('landing');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        trackPageView('CALM Landing', 'CuraGo - Clinical Anxiety Loop Mapping');
        return;
      }
      if (pathname === '/calm/quiz') {
        setCalmStage('quiz');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        trackPageView('CALM Quiz', 'CuraGo - CALM Quiz');
        return;
      }
      if (pathname === '/calm/analyzing') {
        setCalmStage('analyzing');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        trackPageView('CALM Analyzing', 'CuraGo - Analyzing CALM Results');
        return;
      }
      if (pathname === '/calm/results') {
        setCalmStage('results');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        trackPageView('CALM Results', 'CuraGo - CALM Results');

        // ✅ Developer-added GTM signal for CompleteRegistration (CALM finish)
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'calm_test_finished_signal',
          page_path: pathname,
          timestamp: new Date().toISOString(),
        });

        console.log('✅ GTM signal fired: calm_test_finished_signal');
        return;
      }
      if (pathname === '/calm/terms') {
        setCalmStage('terms');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        trackPageView('CALM Terms & Conditions', 'CuraGo - CALM 1.0 Terms & Conditions');
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
    console.log('🧭 Navigating to:', page, 'from current route:', { isAuraRoute, isAtmRoute, isCalmRoute, currentPage });

    if (page === 'home') {
      history.pushState(null, '', buildUrl('/', '#home'));
      setIsAuraRoute(false);
      setIsAtmRoute(false);
      setIsCalmRoute(false);
      setCurrentPage('home');
      // Force a popstate event to trigger route sync
      window.dispatchEvent(new PopStateEvent('popstate'));
    } else if (page === 'team') {
      history.pushState(null, '', buildUrl('/', '#mental-health-team'));
      setIsAuraRoute(false);
      setIsAtmRoute(false);
      setIsCalmRoute(false);
      setCurrentPage('team');
      window.dispatchEvent(new PopStateEvent('popstate'));
    } else if (page === 'booking') {
      history.pushState(null, '', buildUrl('/', '#booking'));
      setIsAuraRoute(false);
      setIsAtmRoute(false);
      setIsCalmRoute(false);
      setCurrentPage('booking');
      window.dispatchEvent(new PopStateEvent('popstate'));
    } else if (page === 'contact') {
      console.log('🧭 Navigating to contact page from:', { isAuraRoute, isAtmRoute, isCalmRoute, currentPage });
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
        ? '/calm'
        : stage === 'quiz'
        ? '/calm/quiz'
        : stage === 'analyzing'
        ? '/calm/analyzing'
        : stage === 'terms'
        ? '/calm/terms'
        : '/calm/results';

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
    const eventId = `calm-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Send webhook with form data and CALM results - FIRES FIRST
    try {
      const webhookPayload = {
        action: "calm_assessment",
        contact: {
          name: userInfo.name,
          whatsapp: userInfo.whatsapp.startsWith('+91') ? userInfo.whatsapp : `+91${userInfo.whatsapp}`,
          email: userInfo.email || ""
        },
        assessment: {
          type: "CALM",
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

      console.log('✅ CALM assessment webhook sent successfully');
    } catch (error) {
      console.error('❌ Failed to send CALM assessment webhook:', error);
    }

    // Minimum wait time for analyzing screen (5 seconds for better UX)
    const minWaitTime = new Promise(resolve => setTimeout(resolve, 5000));

    // Send to Google Sheets in background (async, non-blocking)
    const apiCall = sendCalmResultsToGoogleSheets({
      testType: 'calm_tool',
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
      console.log('✅ CALM results sent to Google Sheets');
    }).catch((error) => {
      console.error('❌ Failed to send CALM results:', error);
      // Continue to results even if API fails
    });

    // Mark quiz as completed in parallel with results submission
    const markCompletionCall = sendCalmResultsToGoogleSheets({
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
  }, [isAtmRoute, atmStage, atmAnswers, isAuraRoute, auraStage, scores, isCalmRoute, calmStage, calmResult]);

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

        <Footer />
      </div>
    );
  }

  // CALM 1.0 route
  if (isCalmRoute) {
    // Quiz stage - full screen, no navbar/footer
    if (calmStage === 'quiz') {
      return (
        <>
          <Toaster />
          <QuizFlow onComplete={handleCalmQuizComplete} />
        </>
      );
    }

    // Analyzing stage - full screen, no navbar/footer
    if (calmStage === 'analyzing') {
      return (
        <>
          <Toaster />
          <AnalyzingScreen userName={calmUserInfo?.name || 'there'} />
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

        {(calmStage === 'landing' || calmStage === 'terms') && <Footer />}
      </>
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
        {pathname === '/bookconsultation' && <ConsultationLandingPage />}
        {pathname === '/paymentSuccess' && <ConsultationThankYouPage />}
        <Footer />
      </div>
    );
  }

  // Marketing site
  return (
    <div className="min-h-screen bg-white scroll-smooth">
      <Toaster />
      <FloatingButtons onBookNow={navigateToBooking} />

      <Navbar
        onBookAppointment={navigateToBooking}
        currentPage={currentPage}
        onNavigate={handleNavigate}
      />

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
    </div>
  );
}
