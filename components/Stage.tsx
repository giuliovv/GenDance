
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Stars, PerspectiveCamera, Environment } from '@react-three/drei';
import Mannequin from './Mannequin';

interface StageProps {
  currentPoseName: string;
  nextPoseName: string;
  transitionFactor: number;
  bpm?: number;
  currentTime?: number;
}

const Stage: React.FC<StageProps> = ({ currentPoseName, nextPoseName, transitionFactor, bpm = 120, currentTime = 0 }) => {
  return (
    <div className="w-full h-full">
      <Canvas shadows>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 1.5, 4]} fov={50} />
          <OrbitControls enablePan={false} maxDistance={10} minDistance={2} />
          
          <color attach="background" args={['#050505']} />
          <fog attach="fog" args={['#050505', 5, 15]} />
          
          <ambientLight intensity={0.4} />
          <spotLight position={[5, 10, 5]} angle={0.3} penumbra={1} intensity={2} castShadow color="#ff00ff" />
          <spotLight position={[-5, 10, 5]} angle={0.3} penumbra={1} intensity={2} castShadow color="#00ffff" />
          <pointLight position={[0, 2, -2]} intensity={1} color="#ffffff" />

          <Mannequin
            currentPoseName={currentPoseName}
            nextPoseName={nextPoseName}
            transitionFactor={transitionFactor}
            bpm={bpm}
            currentTime={currentTime}
          />

          <Grid 
            infiniteGrid 
            fadeDistance={20} 
            sectionColor="#111" 
            cellColor="#222" 
            sectionThickness={1.5} 
          />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
            <planeGeometry args={[100, 100]} />
            <meshStandardMaterial color="#050505" />
          </mesh>

          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Stage;
