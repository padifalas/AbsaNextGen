import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { FinancialProvider } from './context/FinancialContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import MoneySnapshot from './pages/MoneySnapshot';
import StrategyTracks from './pages/StrategyTracks';
import SimulationLab from './pages/SimulationLab';
import Learn from './pages/Learn';
import Login from './pages/Login';
import './styles/globals.css';

/* ── Authenticated shell with sidebar + nav ── */
function AppShell({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="app-layout">
      <Sidebar
        userTrack="First Property Path"
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
            {/* ── Public routes ── */}
            <Route path="/login" element={<Login />} />

            {/* ── Protected routes — wrapped in AppShell ── */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppShell>
                    <MoneySnapshot />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/tracks"
              element={
                <ProtectedRoute>
                  <AppShell>
                    <StrategyTracks />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/simulation"
              element={
                <ProtectedRoute>
                  <AppShell>
                    <SimulationLab />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/learn"
              element={
                <ProtectedRoute>
                  <AppShell>
                    <Learn />
                  </AppShell>
                </ProtectedRoute>
              }
            />

            {/* ── Catch-all ── */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </FinancialProvider>
    </AuthProvider>
  );
}
