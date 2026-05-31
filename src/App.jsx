import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { FinancialProvider, useFinancial } from './context/FinancialContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import OnboardingRoute from './components/OnBoardingRoute';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import MoneySnapshot from './pages/MoneySnapshot';
import StrategyTracks from './pages/StrategyTracks';
import TrackDetail from './pages/TrackDetail';
import SimulationLab from './pages/SimulationLab';
import Learn from './pages/Learn';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import './styles/globals.css';

const TRACK_LABELS = {
  property:   'First Property Path',
  balanced:   'Balanced Lifestyle',
  aggressive: 'Aggressive Global',
};

function AppShell({ children }) {
  const { financial } = useFinancial();
  const [collapsed, setCollapsed] = useState(false);
  const userTrack = TRACK_LABELS[financial.selectedTrack] || 'First Property Path';
  return (
    <div className="app-layout">
      <Sidebar
        userTrack={userTrack}
        collapsed={collapsed}
        onToggle={() => setCollapsed(c => !c)}
      />
      <main className={`main-content${collapsed ? ' collapsed' : ''}`}>
        {children}
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
