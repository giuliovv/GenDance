
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { JointRotation } from '../types';
import { POSE_LIBRARY } from '../constants';

interface MannequinProps {
  currentPoseName: string;
  nextPoseName: string;
  transitionFactor: number;
}

// Just Dance style neon silhouette dancer
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

  // Neon colors
  const bodyColor = "#1a0a2e";
  const glowColor = "#ff00ff";
  const handGlowColor = "#00ffff";

  return (
    <group position={[0, -1, 0]}>
      {/* Hips / Root */}
      <group ref={hipsRef}>
        {/* Pelvis - wider rounded shape */}
        <mesh position={[0, 1, 0]}>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshStandardMaterial color={bodyColor} emissive={glowColor} emissiveIntensity={0.3} />
        </mesh>

        {/* Spine / Torso */}
        <group ref={spineRef} position={[0, 1.05, 0]}>
          {/* Torso - tapered capsule shape */}
          <mesh position={[0, 0.22, 0]}>
            <capsuleGeometry args={[0.14, 0.35, 8, 16]} />
            <meshStandardMaterial color={bodyColor} emissive={glowColor} emissiveIntensity={0.4} />
          </mesh>

          {/* Chest accent */}
          <mesh position={[0, 0.35, 0.05]}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial color={bodyColor} emissive={glowColor} emissiveIntensity={0.5} />
          </mesh>

          {/* Neck */}
          <mesh position={[0, 0.5, 0]}>
            <capsuleGeometry args={[0.04, 0.08, 4, 8]} />
            <meshStandardMaterial color={bodyColor} emissive={glowColor} emissiveIntensity={0.3} />
          </mesh>

          {/* Head */}
          <mesh ref={headRef} position={[0, 0.65, 0]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color={bodyColor} emissive={handGlowColor} emissiveIntensity={1.2} />
          </mesh>

          {/* Left Arm */}
          <group ref={armLRef} position={[-0.18, 0.38, 0]}>
            {/* Upper arm */}
            <mesh position={[-0.12, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <capsuleGeometry args={[0.045, 0.18, 4, 8]} />
              <meshStandardMaterial color={bodyColor} emissive={glowColor} emissiveIntensity={0.4} />
            </mesh>
            {/* Forearm */}
            <mesh position={[-0.32, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <capsuleGeometry args={[0.038, 0.16, 4, 8]} />
              <meshStandardMaterial color={bodyColor} emissive={glowColor} emissiveIntensity={0.4} />
            </mesh>
            {/* Hand - glowing orb */}
            <mesh position={[-0.48, 0, 0]}>
              <sphereGeometry args={[0.055, 16, 16]} />
              <meshStandardMaterial color={handGlowColor} emissive={handGlowColor} emissiveIntensity={2} />
            </mesh>
          </group>

          {/* Right Arm */}
          <group ref={armRRef} position={[0.18, 0.38, 0]}>
            {/* Upper arm */}
            <mesh position={[0.12, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <capsuleGeometry args={[0.045, 0.18, 4, 8]} />
              <meshStandardMaterial color={bodyColor} emissive={glowColor} emissiveIntensity={0.4} />
            </mesh>
            {/* Forearm */}
            <mesh position={[0.32, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <capsuleGeometry args={[0.038, 0.16, 4, 8]} />
              <meshStandardMaterial color={bodyColor} emissive={glowColor} emissiveIntensity={0.4} />
            </mesh>
            {/* Hand - glowing orb */}
            <mesh position={[0.48, 0, 0]}>
              <sphereGeometry args={[0.055, 16, 16]} />
              <meshStandardMaterial color={handGlowColor} emissive={handGlowColor} emissiveIntensity={2} />
            </mesh>
          </group>
        </group>

        {/* Left Leg */}
        <group ref={legLRef} position={[-0.09, 0.92, 0]}>
          {/* Thigh */}
          <mesh position={[0, -0.18, 0]}>
            <capsuleGeometry args={[0.055, 0.22, 4, 8]} />
            <meshStandardMaterial color={bodyColor} emissive={glowColor} emissiveIntensity={0.35} />
          </mesh>
          {/* Calf */}
          <mesh position={[0, -0.48, 0]}>
            <capsuleGeometry args={[0.045, 0.22, 4, 8]} />
            <meshStandardMaterial color={bodyColor} emissive={glowColor} emissiveIntensity={0.35} />
          </mesh>
          {/* Foot */}
          <mesh position={[0, -0.72, 0.03]}>
            <boxGeometry args={[0.07, 0.04, 0.14]} />
            <meshStandardMaterial color={bodyColor} emissive={glowColor} emissiveIntensity={0.5} />
          </mesh>
        </group>

        {/* Right Leg */}
        <group ref={legRRef} position={[0.09, 0.92, 0]}>
          {/* Thigh */}
          <mesh position={[0, -0.18, 0]}>
            <capsuleGeometry args={[0.055, 0.22, 4, 8]} />
            <meshStandardMaterial color={bodyColor} emissive={glowColor} emissiveIntensity={0.35} />
          </mesh>
          {/* Calf */}
          <mesh position={[0, -0.48, 0]}>
            <capsuleGeometry args={[0.045, 0.22, 4, 8]} />
            <meshStandardMaterial color={bodyColor} emissive={glowColor} emissiveIntensity={0.35} />
          </mesh>
          {/* Foot */}
          <mesh position={[0, -0.72, 0.03]}>
            <boxGeometry args={[0.07, 0.04, 0.14]} />
            <meshStandardMaterial color={bodyColor} emissive={glowColor} emissiveIntensity={0.5} />
          </mesh>
        </group>
      </group>
    </group>
  );
};

export default Mannequin;
