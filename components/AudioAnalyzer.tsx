
import React, { useState } from 'react';
import { AudioAnalysis } from '../types';

interface AudioAnalyzerProps {
  onAnalyzed: (analysis: AudioAnalysis, file: File) => void;
  isAnalyzing: boolean;
}

const AudioAnalyzer: React.FC<AudioAnalyzerProps> = ({ onAnalyzed, isAnalyzing }) => {
  const [error, setError] = useState<string | null>(null);
  const [loadingDemo, setLoadingDemo] = useState(false);

  const processAudio = async (arrayBuffer: ArrayBuffer, fileName: string) => {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    // Clone the ArrayBuffer before decoding since decodeAudioData detaches it
    const arrayBufferCopy = arrayBuffer.slice(0);
    const audioBuffer = await audioCtx.decodeAudioData(arrayBufferCopy);

    // Simple Peak-based BPM Detection
    const data = audioBuffer.getChannelData(0);
    const step = 200;
    const peaks: number[] = [];
    const threshold = 0.8;

    for (let i = 0; i < data.length; i += step) {
      if (Math.abs(data[i]) > threshold) {
        peaks.push(i / audioBuffer.sampleRate);
        i += 10000;
      }
    }

    let bpm = 120;
    if (peaks.length > 2) {
      const intervals = [];
      for (let j = 1; j < peaks.length; j++) {
        intervals.push(peaks[j] - peaks[j - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      bpm = Math.round(60 / avgInterval);
    }

    const energy: number[] = [];
    const buckets = 100;
    const bucketSize = Math.floor(data.length / buckets);
    for (let i = 0; i < buckets; i++) {
      let sum = 0;
      for (let j = 0; j < bucketSize; j++) {
        sum += data[i * bucketSize + j] ** 2;
      }
      energy.push(Math.sqrt(sum / bucketSize) * 255);
    }

    const file = new File([arrayBuffer], fileName, { type: 'audio/mpeg' });
    onAnalyzed({
      bpm,
      energy,
      duration: audioBuffer.duration,
      name: fileName
    }, file);
  };

  const handleDemoClick = async () => {
    try {
      setError(null);
      setLoadingDemo(true);
      const response = await fetch('/demo.mp3');
      const arrayBuffer = await response.arrayBuffer();
      await processAudio(arrayBuffer, 'Dua Lipa - Houdini');
    } catch (err) {
      console.error(err);
      setError("Failed to load demo. Please try uploading a file.");
    } finally {
      setLoadingDemo(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setError(null);
      const arrayBuffer = await file.arrayBuffer();
      await processAudio(arrayBuffer, file.name);
    } catch (err) {
      console.error(err);
      setError("Failed to process audio. Please try another file.");
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-8 border-2 border-dashed border-gray-700 rounded-3xl bg-black/40 backdrop-blur-sm">
      <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center animate-pulse">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      </div>
      <h3 className="text-2xl font-bungee text-center">Ready to Dance?</h3>
      <p className="text-gray-400 text-center text-sm max-w-xs">
        Upload your favorite track. Our AI will analyze the rhythm and generate a unique choreography.
      </p>
      
      <div className="flex gap-3">
        <label className="cursor-pointer group relative overflow-hidden px-8 py-3 bg-white text-black font-bold rounded-full transition-all hover:scale-105 active:scale-95">
          <span className="relative z-10">{isAnalyzing ? "Processing..." : "Select Song"}</span>
          <input
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={isAnalyzing || loadingDemo}
          />
        </label>

        <button
          onClick={handleDemoClick}
          disabled={isAnalyzing || loadingDemo}
          className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold rounded-full transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          {loadingDemo ? "Loading..." : "Try Demo"}
        </button>
      </div>

      <p className="text-gray-500 text-xs">or try with Dua Lipa - Houdini</p>

      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
    </div>
  );
};

export default AudioAnalyzer;
