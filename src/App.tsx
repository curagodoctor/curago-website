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
  AtmQuizFlow,
  AtmResultScreen,
} from './components/assessment/atm';

// ✅ Single source of truth for types (new 8-pillar model)
import type { QuizAnswers, UserInfo, AuraScores } from './types/aura';
import type { AtmAnswers, AtmUserInfo } from './types/atm';

type SitePage = 'home' | 'team' | 'booking' | 'contact';

const getPathname = () =>
  (typeof window !== 'undefined' ? window.location.pathname : '/') || '/';

const isAuraPath = (p: string) => p.startsWith('/aura-rise-index');
const isAtmPath = (p: string) => p.startsWith('/anxiety-trigger-mapping');

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
    useState<'landing' | 'quiz' | 'results'>('landing');
  const [atmAnswers, setAtmAnswers] = useState<AtmAnswers | null>(null);
  const [atmUserInfo, setAtmUserInfo] = useState<AtmUserInfo | null>(null);

  // Which branch of the app are we on?
  const [isAuraRoute, setIsAuraRoute] = useState<boolean>(
    isAuraPath(getPathname())
  );
  const [isAtmRoute, setIsAtmRoute] = useState<boolean>(
    isAtmPath(getPathname())
  );

  // ---------- Record referral once (captures ?ref=...) ----------
  useEffect(() => {
    trackReferralInit();
  }, []);


  // ---------- Hash routing (marketing pages) ----------
  useEffect(() => {
    if (isAuraRoute) return;

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
  }, [isAuraRoute, isAtmRoute]);

  // ---------- Path routing (/contact and /aura-rise-index*) ----------
  useEffect(() => {
    const syncFromPath = () => {
      const { pathname } = window.location;
      setIsAuraRoute(isAuraPath(pathname));
      setIsAtmRoute(isAtmPath(pathname));

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
      if (pathname === '/anxiety-trigger-mapping') {
        setAtmStage('landing');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        trackPageView('ATM Landing', 'CuraGo - Anxiety Trigger Mapping');
        return;
      }
      if (pathname === '/anxiety-trigger-mapping/quiz') {
        setAtmStage('quiz');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        trackPageView('ATM Quiz', 'CuraGo - ATM Quiz');
        return;
      }
      if (pathname === '/anxiety-trigger-mapping/results') {
        setAtmStage('results');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        trackPageView('ATM Results', 'CuraGo - ATM Results');
        return;
      }

      // Contact route (full page)
      if (pathname === '/contact') {
        setCurrentPage('contact');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        trackPageView('Contact Us', 'CuraGo - Get in Touch');
        return;
      }

      // Default to home (no hash)
      if (!window.location.hash || window.location.hash === '#home') {
        setCurrentPage('home');
      }
    };

    syncFromPath();
    window.addEventListener('popstate', syncFromPath);
    return () => window.removeEventListener('popstate', syncFromPath);
  }, []);

  // ---------- Marketing nav helpers (hash) ----------
  const navigateToBooking = () => {
    trackButtonClick('Book Now', 'navigation', window.location.hash);
    history.pushState(null, '', buildUrl('/', '#booking'));
    setIsAuraRoute(false);
    setCurrentPage('booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (page: string) => {
    if (page === 'home') {
      history.pushState(null, '', buildUrl('/', '#home'));
      setIsAuraRoute(false);
      setCurrentPage('home');
    } else if (page === 'team') {
      history.pushState(null, '', buildUrl('/', '#mental-health-team'));
      setIsAuraRoute(false);
      setCurrentPage('team');
    } else if (page === 'booking') {
      history.pushState(null, '', buildUrl('/', '#booking'));
      setIsAuraRoute(false);
      setCurrentPage('booking');
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
        ? '/anxiety-trigger-mapping'
        : stage === 'quiz'
        ? '/anxiety-trigger-mapping/quiz'
        : '/anxiety-trigger-mapping/results';

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
    goToAtm('landing');
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
  }, [isAtmRoute, atmStage, atmAnswers, isAuraRoute, auraStage, scores]);

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

        {atmStage === 'landing' && <AtmLandingPage onStart={handleStartAtmQuiz} />}
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
