import React, { useState, useEffect } from "react";
import { Smartphone, Monitor, Battery, Wifi, Signal } from "lucide-react";

interface AndroidFrameProps {
  children: React.ReactNode;
}

export default function AndroidFrame({ children }: AndroidFrameProps) {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [timeStr, setTimeStr] = useState<string>("12:00");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours().toString().padStart(2, "0");
      let minutes = now.getMinutes().toString().padStart(2, "0");
      setTimeStr(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div id="android-container" className="min-h-screen bg-[#F0FDF4] flex flex-col items-center justify-start p-2 sm:p-6 transition-all duration-300">
      {/* Mode Control Bar */}
      <div id="mode-control" className="w-full max-w-md bg-white rounded-3xl shadow-xl border-4 border-emerald-100 p-3 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-xs font-black text-slate-800 font-sans tracking-tight uppercase">
            Aplikasi Madrasah • Android
          </span>
        </div>
        <button
          id="btn-toggle-fullscreen"
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-2xl text-xs font-bold transition-all"
        >
          {isFullscreen ? (
            <>
              <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
              <span>Mode Android</span>
            </>
          ) : (
            <>
              <Monitor className="w-3.5 h-3.5 text-emerald-600" />
              <span>Layar Penuh</span>
            </>
          )}
        </button>
      </div>

      {isFullscreen ? (
        /* Fullscreen Web Mode */
        <div id="app-fullscreen" className="w-full max-w-6xl bg-[#F0FDF4] rounded-3xl shadow-2xl border-4 border-emerald-100 overflow-hidden flex flex-col h-[85vh] transition-all duration-300">
          {children}
        </div>
      ) : (
        /* Android Smartphone Mockup Mode */
        <div id="app-smartphone-frame" className="relative mx-auto bg-slate-950 p-3.5 rounded-[3.2rem] shadow-[0_25px_60px_-15px_rgba(4,120,87,0.25)] border-4 border-slate-800 w-full max-w-[410px] h-[820px] flex flex-col overflow-hidden transition-all duration-300">
          {/* Phone Ear Speaker / Camera Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-36 bg-slate-950 rounded-b-2xl z-50 flex items-center justify-center">
            <div className="w-12 h-1 bg-slate-800 rounded-full mb-1"></div>
            <div className="w-2.5 h-2.5 bg-slate-900 rounded-full absolute right-6 top-1.5 border border-slate-800"></div>
          </div>

          {/* Android Screen Area */}
          <div id="phone-screen" className="w-full h-full bg-[#F0FDF4] rounded-[2.4rem] overflow-hidden flex flex-col relative">
            {/* Android Status Bar */}
            <div id="android-status-bar" className="h-7 bg-emerald-600 text-white flex items-center justify-between px-6 text-[10px] font-semibold select-none z-40">
              <span className="font-mono tracking-tight">{timeStr}</span>
              <div className="flex items-center gap-1.5">
                <Signal className="w-3 h-3" />
                <Wifi className="w-3 h-3" />
                <div className="flex items-center gap-0.5">
                  <Battery className="w-3.5 h-3.5 rotate-90" />
                  <span className="text-[9px]">98%</span>
                </div>
              </div>
            </div>

            {/* Inner Content App Workspace */}
            <div className="flex-1 overflow-hidden flex flex-col bg-[#F0FDF4]">
              {children}
            </div>

            {/* Android System Navigation Bar */}
            <div id="android-nav-bar" className="h-10 bg-slate-900 flex items-center justify-around px-12 select-none z-40">
              <button className="text-slate-400 hover:text-white transition-colors">
                {/* Back triangle */}
                <svg className="w-3 h-3 fill-current rotate-180" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
              <button className="text-slate-400 hover:text-white transition-colors">
                {/* Home circle */}
                <div className="w-3.5 h-3.5 rounded-full border-2 border-current"></div>
              </button>
              <button className="text-slate-400 hover:text-white transition-colors">
                {/* Recent apps square */}
                <div className="w-3 h-3 border-2 border-current rounded-sm"></div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
