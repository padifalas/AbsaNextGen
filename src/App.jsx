import { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { FinancialProvider, useFinancial } from './context/FinancialContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import OnboardingRoute from './components/OnBoardingRoute';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import Footer from './components/Footer';
import MoneySnapshot from './pages/MoneySnapshot';
import StrategyTracks from './pages/StrategyTracks';
import TrackDetail from './pages/TrackDetail';
import SimulationLab from './pages/SimulationLab';
import Learn from './pages/Learn';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import './styles/globals.css';

const TRACK_LABELS = {
  property:   'First Property Path',
  balanced:   'Balanced Lifestyle',
  aggressive: 'Aggressive Global',
};

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function AppShell({ children }) {
  const { financial } = useFinancial();
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const mainRef = useRef(null);
  const userTrack = TRACK_LABELS[financial.selectedTrack] || 'First Property Path';

  useEffect(() => {
    if (!mainRef.current) return;
    gsap.fromTo(
      mainRef.current,
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }
    );
  }, [location]);

  return (
    <div className="app-layout">
      <Sidebar
        userTrack={userTrack}
        collapsed={collapsed}
        onToggle={() => setCollapsed(c => !c)}
      />
      <main ref={mainRef} className={`main-content${collapsed ? ' collapsed' : ''}`}>
        <div className="main-content__body">{children}</div>
        <Footer />
      </main>
      <MobileNav />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <FinancialProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/*Public routes  */}
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* ── Onboarding — auth required, not yet onboarded ── */}
            <Route
              path="/onboarding"
              element={
                <OnboardingRoute>
                  <Onboarding />
                </OnboardingRoute>
              }
            />

            {/* pprotected routes  */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppShell><MoneySnapshot /></AppShell>
                </ProtectedRoute>
              }
            />

            {/* /tracks — overview (select + compare) */}
            <Route
              path="/tracks"
              element={
                <ProtectedRoute>
                  <AppShell><StrategyTracks /></AppShell>
                </ProtectedRoute>
              }
            />

            {/*
              /tracks/:slug — individual track detail page
              Slugs: first-property-path and the balanced-lifestyle and the aggressive-global
              the the full slug id mapping stuff is inn the src/data/tracksData.js
            */}
            <Route
              path="/tracks/:slug"
              element={
                <ProtectedRoute>
                  <AppShell><TrackDetail /></AppShell>
                </ProtectedRoute>
              }
            />

            <Route
              path="/simulation"
              element={
                <ProtectedRoute>
                  <AppShell><SimulationLab /></AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <AppShell><Profile /></AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/learn"
              element={
                <ProtectedRoute>
                  <AppShell><Learn /></AppShell>
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </FinancialProvider>
    </AuthProvider>
  );
}
