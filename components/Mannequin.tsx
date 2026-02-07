
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Pose, JointRotation } from '../types';
import { POSE_LIBRARY } from '../constants';

interface MannequinProps {
  currentPoseName: string;
  nextPoseName: string;
  transitionFactor: number;
}

const Mannequin: React.FC<MannequinProps> = ({ currentPoseName, nextPoseName, transitionFactor }) => {
  const hipsRef = useRef<THREE.Group>(null);
  const spineRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const armLRef = useRef<THREE.Group>(null);
  const armRRef = useRef<THREE.Group>(null);
  const legLRef = useRef<THREE.Group>(null);
  const legRRef = useRef<THREE.Group>(null);

  const lerpRotation = (start: JointRotation, end: JointRotation, t: number) => {
    return new THREE.Euler(
      THREE.MathUtils.lerp(start.x, end.x, t),
      THREE.MathUtils.lerp(start.y, end.y, t),
      THREE.MathUtils.lerp(start.z, end.z, t)
    );
  };

  useFrame(() => {
    const poseA = POSE_LIBRARY[currentPoseName] || POSE_LIBRARY.IDLE;
    const poseB = POSE_LIBRARY[nextPoseName] || poseA;
    const t = THREE.MathUtils.smoothstep(transitionFactor, 0, 1);

    if (hipsRef.current) hipsRef.current.rotation.copy(lerpRotation(poseA.hips, poseB.hips, t));
    if (spineRef.current) spineRef.current.rotation.copy(lerpRotation(poseA.spine, poseB.spine, t));
    if (headRef.current) headRef.current.rotation.copy(lerpRotation(poseA.head, poseB.head, t));
    if (armLRef.current) armLRef.current.rotation.copy(lerpRotation(poseA.armL, poseB.armL, t));
    if (armRRef.current) armRRef.current.rotation.copy(lerpRotation(poseA.armR, poseB.armR, t));
    if (legLRef.current) legLRef.current.rotation.copy(lerpRotation(poseA.legL, poseB.legL, t));
    if (legRRef.current) legRRef.current.rotation.copy(lerpRotation(poseA.legR, poseB.legR, t));
  });

  return (
    <group position={[0, -1, 0]}>
      {/* Hips / Root */}
      <group ref={hipsRef}>
        <mesh position={[0, 1, 0]}>
          <boxGeometry args={[0.4, 0.2, 0.2]} />
          <meshStandardMaterial color="#333" />
        </mesh>

        {/* Spine */}
        <group ref={spineRef} position={[0, 1.1, 0]}>
          <mesh position={[0, 0.2, 0]}>
            <boxGeometry args={[0.3, 0.4, 0.2]} />
            <meshStandardMaterial color="#444" emissive="#00f" emissiveIntensity={0.5} />
          </mesh>

          {/* Head */}
          <mesh ref={headRef} position={[0, 0.55, 0]}>
            <boxGeometry args={[0.2, 0.2, 0.2]} />
            <meshStandardMaterial color="#666" emissive="#0ff" emissiveIntensity={1} />
          </mesh>

          {/* Left Arm */}
          <group ref={armLRef} position={[-0.2, 0.35, 0]}>
            <mesh position={[-0.2, 0, 0]}>
              <capsuleGeometry args={[0.05, 0.4, 4, 8]} />
              <meshStandardMaterial color="#222" />
            </mesh>
          </group>

          {/* Right Arm */}
          <group ref={armRRef} position={[0.2, 0.35, 0]}>
            <mesh position={[0.2, 0, 0]}>
              <capsuleGeometry args={[0.05, 0.4, 4, 8]} />
              <meshStandardMaterial color="#222" />
            </mesh>
          </group>
        </group>

        {/* Left Leg */}
        <group ref={legLRef} position={[-0.12, 0.9, 0]}>
          <mesh position={[0, -0.4, 0]}>
            <capsuleGeometry args={[0.06, 0.5, 4, 8]} />
            <meshStandardMaterial color="#222" />
          </mesh>
        </group>

        {/* Right Leg */}
        <group ref={legRRef} position={[0.12, 0.9, 0]}>
          <mesh position={[0, -0.4, 0]}>
            <capsuleGeometry args={[0.06, 0.5, 4, 8]} />
            <meshStandardMaterial color="#222" />
          </mesh>
        </group>
      </group>
    </group>
  );
};

export default Mannequin;
