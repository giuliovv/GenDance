
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Stage from './components/Stage';
import AudioAnalyzer from './components/AudioAnalyzer';
import { generateChoreography } from './services/geminiService';
import { AppState, AudioAnalysis, ChoreographyStep } from './types';
import { BarChart, Bar, ResponsiveContainer, Cell } from 'recharts';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [analysis, setAnalysis] = useState<AudioAnalysis | null>(null);
  const [choreography, setChoreography] = useState<ChoreographyStep[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [transitionFactor, setTransitionFactor] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const requestRef = useRef<number>();

  const handleAnalyzed = async (audioAnalysis: AudioAnalysis, file: File) => {
    setAnalysis(audioAnalysis);
    setAppState(AppState.CHOREOGRAPHING);
    
    // Create audio object but don't play yet
    const url = URL.createObjectURL(file);
    audioRef.current = new Audio(url);
    
    try {
      const steps = await generateChoreography(audioAnalysis);
      setChoreography(steps);
      setAppState(AppState.READY);
    } catch (e) {
      console.error(e);
      setAppState(AppState.IDLE);
    }
  };

  const startDance = () => {
    if (!audioRef.current) return;
    audioRef.current.play();
    setAppState(AppState.PLAYING);
  };

  const stopDance = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setAppState(AppState.READY);
    setCurrentStepIndex(0);
  };

  const update = useCallback(() => {
    if (appState === AppState.PLAYING && audioRef.current) {
      const time = audioRef.current.currentTime;
      setCurrentTime(time);

      // Find current pose based on time
      let stepIndex = 0;
      for (let i = 0; i < choreography.length; i++) {
        if (choreography[i].timestamp <= time) {
          stepIndex = i;
        } else {
          break;
        }
      }

      setCurrentStepIndex(stepIndex);

      // Calculate transition factor to next pose
      const currentStep = choreography[stepIndex];
      const nextStep = choreography[stepIndex + 1];

      if (nextStep) {
        const duration = nextStep.timestamp - currentStep.timestamp;
        const elapsed = time - currentStep.timestamp;
        // Speed multiplier: transitions complete in 20% of the duration for punchy, snappy movement
        const speedMultiplier = 5;
        const factor = Math.min(1, Math.max(0, (elapsed / duration) * speedMultiplier));
        setTransitionFactor(factor);
      } else {
        setTransitionFactor(0);
      }
    }
    requestRef.current = requestAnimationFrame(update);
  }, [appState, choreography]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [update]);

  // Show the pose the mannequin is actually displaying (accounts for fast transitions)
  const rawCurrentPose = choreography[currentStepIndex]?.poseName || 'IDLE';
  const rawNextPose = choreography[currentStepIndex + 1]?.poseName || rawCurrentPose;

  // If transition is mostly complete (>0.5), show the next pose name to match what's on screen
  const displayPoseName = transitionFactor > 0.5 ? rawNextPose : rawCurrentPose;
  const displayNextPose = transitionFactor > 0.5
    ? (choreography[currentStepIndex + 2]?.poseName || rawNextPose)
    : rawNextPose;

  // For the mannequin, always use raw values
  const currentPoseName = rawCurrentPose;
  const nextPoseName = rawNextPose;

  return (
    <div className="relative w-screen h-screen flex flex-col overflow-hidden">
      {/* Background Stage */}
      <div className="absolute inset-0 z-0">
        <Stage
          currentPoseName={currentPoseName}
          nextPoseName={nextPoseName}
          transitionFactor={transitionFactor}
          bpm={analysis?.bpm}
          currentTime={currentTime}
        />
      </div>

      {/* UI Overlay */}
      <div className="relative z-10 flex flex-col h-full pointer-events-none">
        {/* Header */}
        <header className="p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center font-bungee text-xl">G</div>
            <h1 className="text-2xl font-bungee tracking-wider">GenDance</h1>
          </div>
          {analysis && (
            <div className="text-right">
              <p className="text-xs text-purple-400 font-bold uppercase tracking-widest">Now Playing</p>
              <p className="text-sm font-semibold truncate max-w-[200px]">{analysis.name}</p>
            </div>
          )}
        </header>

        {/* Main Interaction Area */}
        <main className="flex-1 flex flex-col items-center justify-center p-6">
          {appState === AppState.IDLE && (
            <div className="pointer-events-auto">
              <AudioAnalyzer onAnalyzed={handleAnalyzed} isAnalyzing={false} />
            </div>
          )}

          {(appState === AppState.ANALYZING || appState === AppState.CHOREOGRAPHING) && (
            <div className="flex flex-col items-center gap-4 bg-black/60 p-10 rounded-3xl backdrop-blur-md border border-white/10">
              <div className="w-12 h-12 border-4 border-t-purple-500 border-white/10 rounded-full animate-spin"></div>
              <p className="font-bungee text-xl animate-pulse">
                {appState === AppState.ANALYZING ? "Analyzing Rhythm..." : "Generating Moves..."}
              </p>
              <p className="text-gray-400 text-sm">Gemini AI is choreographing your dance.</p>
            </div>
          )}

          {appState === AppState.READY && (
            <div className="flex flex-col items-center gap-6 pointer-events-auto">
              <div className="bg-black/60 p-8 rounded-3xl backdrop-blur-md border border-white/20 flex flex-col items-center text-center">
                <h2 className="text-3xl font-bungee mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Choreography Ready</h2>
                <div className="flex gap-8 my-4">
                  <div className="text-center">
                    <p className="text-2xl font-bungee">{analysis?.bpm}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">BPM</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bungee">{choreography.length}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Moves</p>
                  </div>
                </div>
                <button 
                  onClick={startDance}
                  className="mt-4 px-12 py-4 bg-white text-black font-bungee text-xl rounded-full hover:bg-purple-500 hover:text-white transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                >
                  Start Show
                </button>
              </div>
              <button 
                onClick={() => setAppState(AppState.IDLE)} 
                className="text-gray-500 hover:text-white transition-colors text-sm underline"
              >
                Choose different song
              </button>
            </div>
          )}

          {appState === AppState.PLAYING && (
            <div className="absolute bottom-32 w-full px-12 flex flex-col items-center">
              <div className="text-6xl font-bungee text-white mb-4 drop-shadow-[0_0_20px_rgba(0,255,255,0.8)] animate-bounce">
                {displayPoseName}
              </div>
              <div className="text-sm font-bold text-cyan-400 uppercase tracking-[0.5em] mb-8">
                Next: {displayNextPose}
              </div>
            </div>
          )}
        </main>

        {/* Footer / Controls */}
        <footer className="p-6 bg-gradient-to-t from-black/80 to-transparent flex flex-col items-center">
          {appState === AppState.PLAYING && (
            <div className="w-full max-w-2xl flex flex-col gap-4 pointer-events-auto">
              {/* Visualizer */}
              <div className="h-16 w-full opacity-50">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analysis?.energy.map((v, i) => ({ value: v, id: i })) || []}>
                    <Bar dataKey="value">
                      { (analysis?.energy || []).map((entry, index) => {
                          const progress = (currentTime / (analysis?.duration || 1));
                          const isActive = index / 100 <= progress;
                          return <Cell key={`cell-${index}`} fill={isActive ? '#0ff' : '#333'} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="flex items-center justify-between w-full">
                <button 
                  onClick={stopDance}
                  className="px-6 py-2 border border-white/20 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-colors"
                >
                  Exit Dance
                </button>
                <div className="text-xl font-bungee text-white">
                  {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')}
                </div>
                <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-cyan-500" 
                    style={{ width: `${(currentTime / (analysis?.duration || 1)) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </footer>
      </div>
    </div>
  );
};

export default App;
