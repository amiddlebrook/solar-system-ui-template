import React, { useState } from 'react';
import { SolarNavigation } from './components/SolarNavigation';
import { Dashboard } from './components/Dashboard';
import { DataGrid } from './components/DataGrid';
import { Analytics } from './components/Analytics';
import { ProcessFlow } from './components/ProcessFlow';
import { ControlPanel } from './components/ControlPanel';
import { ViewState } from './types';
import { motion, AnimatePresence } from 'framer-motion';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewState>(ViewState.DASHBOARD);

  // Content Renderer based on active view
  const renderContent = () => {
    switch (activeView) {
      case ViewState.DASHBOARD:
        return <Dashboard />;
      case ViewState.ANALYTICS:
        return <Analytics />;
      case ViewState.DATA_GRID:
        return <DataGrid />;
      case ViewState.PROCESS:
        return <ProcessFlow />;
      case ViewState.CONTROLS:
        return <ControlPanel />;
      default:
        return (
            <div className="flex flex-col items-center justify-center h-full text-app-muted">
                <div className="text-4xl mb-4 opacity-20 font-mono">404</div>
                <div className="text-sm font-mono tracking-widest uppercase">Module Not Found</div>
            </div>
        );
    }
  };

  return (
    <div className="flex h-screen w-screen bg-app-bg overflow-hidden text-app-text selection:bg-app-primary selection:text-white">
      {/* Left: Solar Navigation (Fixed Width) */}
      <div className="w-[500px] h-full relative flex items-center justify-center border-r border-app-border/30 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
        {/* Background Grid Effect */}
        <div className="absolute inset-0 z-0 opacity-5" 
             style={{ backgroundImage: 'linear-gradient(#272B36 1px, transparent 1px), linear-gradient(90deg, #272B36 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
        </div>
        
        <div className="relative z-10 scale-75 transform-gpu">
             <SolarNavigation activeView={activeView} onViewChange={setActiveView} />
        </div>

        {/* Brand / Logo Area */}
        <div className="absolute top-8 left-8 z-20">
            <h1 className="text-2xl font-bold font-sans tracking-tight text-white">SOLAR<span className="text-app-primary">UI</span></h1>
            <p className="text-[10px] text-app-muted tracking-widest uppercase mt-1">React Template v1.0</p>
        </div>
      </div>

      {/* Right: Content Area (Fluid) */}
      <div className="flex-1 h-full relative flex flex-col">
        {/* Top Bar */}
        <div className="h-16 border-b border-app-border/30 flex items-center justify-between px-8 bg-app-surface/50 backdrop-blur-sm z-20">
            <div className="flex items-center gap-4">
                <span className="text-xs font-mono text-app-muted">SESSION ID:</span>
                <span className="text-xs font-mono text-app-primary">XE-92-01</span>
            </div>
            <div className="flex items-center gap-4">
                 <button className="text-xs font-medium text-app-muted hover:text-white transition-colors">Help</button>
                 <button className="text-xs font-medium text-app-muted hover:text-white transition-colors">Settings</button>
                 <div className="w-2 h-2 rounded-full bg-app-success animate-pulse"></div>
            </div>
        </div>

        {/* Main Content Container with Transitions */}
        <div className="flex-1 p-8 overflow-hidden relative">
             <AnimatePresence mode="wait">
                <motion.div
                    key={activeView}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="h-full w-full"
                >
                    {renderContent()}
                </motion.div>
             </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default App;