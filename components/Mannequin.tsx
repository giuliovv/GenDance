
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { JointRotation } from '../types';
import { POSE_LIBRARY } from '../constants';

interface MannequinProps {
  currentPoseName: string;
  nextPoseName: string;
  transitionFactor: number;
  bpm?: number;
  currentTime?: number;
}

// Just Dance style neon silhouette dancer
const Mannequin: React.FC<MannequinProps> = ({
  currentPoseName,
  nextPoseName,
  transitionFactor,
  bpm = 120,
  currentTime = 0
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const hipsRef = useRef<THREE.Group>(null);
  const spineRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const armLRef = useRef<THREE.Group>(null);
  const armRRef = useRef<THREE.Group>(null);
  const legLRef = useRef<THREE.Group>(null);
  const legRRef = useRef<THREE.Group>(null);

  // Refs for materials that will pulse
  const bodyMaterialsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const handMaterialsRef = useRef<THREE.MeshStandardMaterial[]>([]);

  const lerpRotation = (start: JointRotation, end: JointRotation, t: number) => {
    return new THREE.Euler(
      THREE.MathUtils.lerp(start.x, end.x, t),
      THREE.MathUtils.lerp(start.y, end.y, t),
      THREE.MathUtils.lerp(start.z, end.z, t)
    );
  };

  // Calculate beat phase (0-1) based on BPM and current time
  const getBeatPulse = (time: number, beatsPerMinute: number) => {
    const beatsPerSecond = beatsPerMinute / 60;
    const beatPhase = (time * beatsPerSecond) % 1;
    // Sharp attack, smooth decay for punchy feel
    const pulse = Math.pow(1 - beatPhase, 3);
    return pulse;
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

    // Beat pulse effect
    const pulse = getBeatPulse(currentTime, bpm);
    const baseScale = 1 + pulse * 0.05; // Subtle scale pulse

    if (groupRef.current) {
      groupRef.current.scale.setScalar(baseScale);
    }

    // Pulse emissive intensity on body
    const bodyIntensity = 0.4 + pulse * 0.6;
    const handIntensity = 2 + pulse * 2;

    bodyMaterialsRef.current.forEach(mat => {
      if (mat) mat.emissiveIntensity = bodyIntensity;
    });

    handMaterialsRef.current.forEach(mat => {
      if (mat) mat.emissiveIntensity = handIntensity;
    });
  });

  // Neon colors
  const bodyColor = "#1a0a2e";
  const glowColor = "#ff00ff";
  const handGlowColor = "#00ffff";

  // Create materials with refs for animation
  const bodyMaterial = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: bodyColor,
      emissive: glowColor,
      emissiveIntensity: 0.4
    });
    bodyMaterialsRef.current.push(mat);
    return mat;
  }, []);

  const handMaterial = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: handGlowColor,
      emissive: handGlowColor,
      emissiveIntensity: 2
    });
    handMaterialsRef.current.push(mat);
    return mat;
  }, []);

  return (
    <group ref={groupRef} position={[0, -1, 0]}>
      {/* Hips / Root */}
      <group ref={hipsRef}>
        {/* Pelvis - wider rounded shape */}
        <mesh position={[0, 1, 0]}>
          <sphereGeometry args={[0.18, 16, 16]} />
          <primitive object={bodyMaterial} attach="material" />
        </mesh>

        {/* Spine / Torso */}
        <group ref={spineRef} position={[0, 1.05, 0]}>
          {/* Torso - tapered capsule shape */}
          <mesh position={[0, 0.22, 0]}>
            <capsuleGeometry args={[0.14, 0.35, 8, 16]} />
            <primitive object={bodyMaterial} attach="material" />
          </mesh>

          {/* Chest accent */}
          <mesh position={[0, 0.35, 0.05]}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <primitive object={bodyMaterial} attach="material" />
          </mesh>

          {/* Neck */}
          <mesh position={[0, 0.5, 0]}>
            <capsuleGeometry args={[0.04, 0.08, 4, 8]} />
            <primitive object={bodyMaterial} attach="material" />
          </mesh>

          {/* Head */}
          <mesh ref={headRef} position={[0, 0.65, 0]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <primitive object={handMaterial} attach="material" />
          </mesh>

          {/* Left Arm */}
          <group ref={armLRef} position={[-0.18, 0.38, 0]}>
            {/* Upper arm */}
            <mesh position={[-0.12, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <capsuleGeometry args={[0.045, 0.18, 4, 8]} />
              <primitive object={bodyMaterial} attach="material" />
            </mesh>
            {/* Forearm */}
            <mesh position={[-0.32, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <capsuleGeometry args={[0.038, 0.16, 4, 8]} />
              <primitive object={bodyMaterial} attach="material" />
            </mesh>
            {/* Hand - glowing orb */}
            <mesh position={[-0.48, 0, 0]}>
              <sphereGeometry args={[0.055, 16, 16]} />
              <primitive object={handMaterial} attach="material" />
            </mesh>
          </group>

          {/* Right Arm */}
          <group ref={armRRef} position={[0.18, 0.38, 0]}>
            {/* Upper arm */}
            <mesh position={[0.12, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <capsuleGeometry args={[0.045, 0.18, 4, 8]} />
              <primitive object={bodyMaterial} attach="material" />
            </mesh>
            {/* Forearm */}
            <mesh position={[0.32, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <capsuleGeometry args={[0.038, 0.16, 4, 8]} />
              <primitive object={bodyMaterial} attach="material" />
            </mesh>
            {/* Hand - glowing orb */}
            <mesh position={[0.48, 0, 0]}>
              <sphereGeometry args={[0.055, 16, 16]} />
              <primitive object={handMaterial} attach="material" />
            </mesh>
          </group>
        </group>

        {/* Left Leg */}
        <group ref={legLRef} position={[-0.09, 0.92, 0]}>
          {/* Thigh */}
          <mesh position={[0, -0.18, 0]}>
            <capsuleGeometry args={[0.055, 0.22, 4, 8]} />
            <primitive object={bodyMaterial} attach="material" />
          </mesh>
          {/* Calf */}
          <mesh position={[0, -0.48, 0]}>
            <capsuleGeometry args={[0.045, 0.22, 4, 8]} />
            <primitive object={bodyMaterial} attach="material" />
          </mesh>
          {/* Foot */}
          <mesh position={[0, -0.72, 0.03]}>
            <boxGeometry args={[0.07, 0.04, 0.14]} />
            <primitive object={bodyMaterial} attach="material" />
          </mesh>
        </group>

        {/* Right Leg */}
        <group ref={legRRef} position={[0.09, 0.92, 0]}>
          {/* Thigh */}
          <mesh position={[0, -0.18, 0]}>
            <capsuleGeometry args={[0.055, 0.22, 4, 8]} />
            <primitive object={bodyMaterial} attach="material" />
          </mesh>
          {/* Calf */}
          <mesh position={[0, -0.48, 0]}>
            <capsuleGeometry args={[0.045, 0.22, 4, 8]} />
            <primitive object={bodyMaterial} attach="material" />
          </mesh>
          {/* Foot */}
          <mesh position={[0, -0.72, 0.03]}>
            <boxGeometry args={[0.07, 0.04, 0.14]} />
            <primitive object={bodyMaterial} attach="material" />
          </mesh>
        </group>
      </group>
    </group>
  );
};

export default Mannequin;
