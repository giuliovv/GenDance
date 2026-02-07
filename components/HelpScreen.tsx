
import React, { useState } from 'react';
import Stage from './Stage';
import { POSE_LIBRARY } from '../constants';

interface HelpScreenProps {
    onBack: () => void;
}

const HelpScreen: React.FC<HelpScreenProps> = ({ onBack }) => {
    const poseNames = Object.keys(POSE_LIBRARY);
    const [selectedPose, setSelectedPose] = useState<string>(poseNames[0]);

    return (
        <div className="flex flex-col md:flex-row w-full h-full bg-black text-white overflow-hidden absolute inset-0 z-50">
            {/* Sidebar / List */}
            <div className="w-full md:w-1/3 lg:w-1/4 flex flex-col border-b md:border-b-0 md:border-r border-white/20 bg-gray-900/90 backdrop-blur-md h-1/3 md:h-full">
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <h2 className="text-xl font-bungee text-purple-400">Pose Library</h2>
                    <button
                        onClick={onBack}
                        className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full text-xs font-bold uppercase transition-colors"
                    >
                        Close
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-transparent">
                    <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
                        {poseNames.map((pose) => (
                            <button
                                key={pose}
                                onClick={() => setSelectedPose(pose)}
                                className={`text-left px-4 py-3 rounded-lg text-sm font-semibold transition-all ${selectedPose === pose
                                        ? 'bg-purple-600 text-white shadow-lg scale-105'
                                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                {pose}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="p-4 bg-black/40 text-xs text-gray-500 text-center border-t border-white/10">
                    Select a pose to visualize it on the mannequin.
                </div>
            </div>

            {/* Main Preview */}
            <div className="flex-1 relative bg-gradient-to-br from-black via-gray-900 to-purple-900/20">
                <div className="absolute top-4 left-4 z-10">
                    <h3 className="text-4xl font-bungee text-white opacity-20 select-none uppercase pointer-events-none">
                        {selectedPose.replace(/_/g, ' ')}
                    </h3>
                </div>

                {/* Stage */}
                <div className="w-full h-full">
                    <Stage
                        currentPoseName={selectedPose}
                        nextPoseName={selectedPose}
                        transitionFactor={0} // No transition, static pose
                        bpm={120}
                        currentTime={0}
                    />
                </div>

                {/* Description overlay if needed */}
                <div className="absolute bottom-6 right-6 z-10 max-w-xs text-right opacity-60">
                    <p className="text-xs font-mono">
                        Joint rotations debug view.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default HelpScreen;
