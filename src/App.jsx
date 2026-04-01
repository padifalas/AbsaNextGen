import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { FinancialProvider } from './context/FinancialContext';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import MoneySnapshot from './pages/MoneySnapshot';
import StrategyTracks from './pages/StrategyTracks';
import SimulationLab from './pages/SimulationLab';
import Learn from './pages/Learn';
import './styles/globals.css';

export default function App() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <FinancialProvider>
      <BrowserRouter>
        <div className="app-layout">
          <Sidebar
            userTrack="First Property Path"
            collapsed={collapsed}
            onToggle={() => setCollapsed(c => !c)}
          />
          <main className={`main-content${collapsed ? ' collapsed' : ''}`}>
            <Routes>
              <Route path="/" element={<MoneySnapshot />} />
              <Route path="/tracks" element={<StrategyTracks />} />
              <Route path="/simulation" element={<SimulationLab />} />
              <Route path="/learn" element={<Learn />} />
            </Routes>
          </main>
          <MobileNav />
        </div>
      </BrowserRouter>
    </FinancialProvider>
  );
}
