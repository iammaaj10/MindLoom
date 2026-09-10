'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Generate spherical Fibonacci nodes for the neural core (strictly spherical shell)
function generateNodes(count: number, radius: number) {
  const positions: [number, number, number][] = [];
  const goldenRatio = (1 + Math.sqrt(5)) / 2;

  for (let i = 0; i < count; i++) {
    const theta = Math.acos(1 - (2 * (i + 0.5)) / count);
    const phi = (2 * Math.PI * i) / goldenRatio;

    positions.push([
      radius * Math.sin(theta) * Math.cos(phi),
      radius * Math.sin(theta) * Math.sin(phi),
      radius * Math.cos(theta),
    ]);
  }
  return positions;
}

// Generate neural synaptic connections between adjacent nodes
function generateEdges(nodes: [number, number, number][], maxDist: number) {
  const edges: [number, number][] = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i][0] - nodes[j][0];
      const dy = nodes[i][1] - nodes[j][1];
      const dz = nodes[i][2] - nodes[j][2];
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (dist < maxDist) {
        edges.push([i, j]);
      }
    }
  }
  return edges;
}

// Generate floating particles STRICTLY within a spherical boundary to prevent rectangular clipping
function generateAmbientParticles(count: number, maxRadius: number) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    // Cube root distribution for uniform spherical volume density
    const r = Math.cbrt(Math.random()) * maxRadius;
    const sinPhi = Math.sin(phi);

    positions[i * 3] = r * sinPhi * Math.cos(theta);
    positions[i * 3 + 1] = r * sinPhi * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }
  return positions;
}

function AppleNeuralCore({
  scrollProgress,
  activeEngine = 'hybrid',
}: {
  scrollProgress: React.MutableRefObject<number>;
  activeEngine?: 'hybrid' | 'local' | 'cortex';
}) {
  const groupRef = useRef<THREE.Group>(null);
  const outerRingRef = useRef<THREE.Mesh>(null);
  const secondaryRingRef = useRef<THREE.Mesh>(null);
  const innerCoreRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  // Scaled down so the entire structure fits comfortably inside the circular viewport
  const nodeCount = 76;
  const radius = 1.15;
  const nodes = useMemo(() => generateNodes(nodeCount, radius), []);
  const edges = useMemo(() => generateEdges(nodes, 0.66), [nodes]);
  const ambientParticlePositions = useMemo(() => generateAmbientParticles(90, 1.45), []);

  // Edges geometry
  const lineGeometry = useMemo(() => {
    const positions: number[] = [];
    for (const [i, j] of edges) {
      positions.push(...nodes[i], ...nodes[j]);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return geo;
  }, [nodes, edges]);

  // Node color assignments based on active engine
  const nodePalette = useMemo(() => {
    const colors =
      activeEngine === 'local'
        ? ['#22d3ee', '#38bdf8', '#06b6d4', '#67e8f9', '#ffffff', '#34d399']
        : activeEngine === 'cortex'
        ? ['#a855f7', '#818cf8', '#c084fc', '#e879f9', '#ffffff', '#6366f1']
        : ['#38bdf8', '#818cf8', '#c084fc', '#e879f9', '#ffffff', '#34d399'];
    return nodes.map((_, i) => colors[i % colors.length]);
  }, [nodes, activeEngine]);

  const coreColor =
    activeEngine === 'local' ? '#06b6d4' : activeEngine === 'cortex' ? '#818cf8' : '#38bdf8';

  // Smooth lerp state
  const targetRotation = useRef({ x: 0, y: 0, z: 0, scale: 1 });

  useFrame(({ clock, pointer }) => {
    const t = clock.getElapsedTime();
    const scroll = scrollProgress.current;

    // Target dynamic transforms driven smoothly by scroll position and pointer
    targetRotation.current.y = t * 0.14 + scroll * 3.5 + pointer.x * 0.35;
    targetRotation.current.x = Math.sin(t * 0.09) * 0.12 + scroll * 1.5 - pointer.y * 0.25;
    targetRotation.current.z = Math.sin(scroll * 2) * 0.3;
    targetRotation.current.scale = 1 + Math.sin(scroll * Math.PI) * 0.08;

    if (groupRef.current) {
      // Smooth linear interpolation for liquid 3D motion
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetRotation.current.y,
        0.06
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        targetRotation.current.x,
        0.06
      );
      groupRef.current.rotation.z = THREE.MathUtils.lerp(
        groupRef.current.rotation.z,
        targetRotation.current.z,
        0.06
      );

      const s = THREE.MathUtils.lerp(
        groupRef.current.scale.x,
        targetRotation.current.scale * (1 + Math.sin(t * 1.6) * 0.015),
        0.06
      );
      groupRef.current.scale.set(s, s, s);
    }

    // Outer Apple orbital rings rotate with scroll speed
    if (outerRingRef.current) {
      outerRingRef.current.rotation.z = -t * 0.09 - scroll * 4;
      outerRingRef.current.rotation.x = Math.PI / 2 + Math.sin(t * 0.1 + scroll * 2) * 0.18;
    }

    if (secondaryRingRef.current) {
      secondaryRingRef.current.rotation.z = t * 0.07 + scroll * 2.5;
      secondaryRingRef.current.rotation.y = Math.PI / 3 + Math.cos(t * 0.08) * 0.12;
    }

    // Inner core pulse
    if (innerCoreRef.current) {
      const corePulse = 0.55 + Math.sin(t * 2.0) * 0.04 + scroll * 0.12;
      innerCoreRef.current.scale.set(corePulse, corePulse, corePulse);
    }

    // Parallax ambient particles strictly spherical
    if (particlesRef.current) {
      particlesRef.current.rotation.y = t * 0.03 + scroll * 0.6;
      particlesRef.current.rotation.x = Math.sin(t * 0.02) * 0.1;
    }
  });

  return (
    <>
      {/* ─── Spherical Parallax Synaptic Starfield ─── */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[ambientParticlePositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.028}
          color={coreColor}
          transparent
          opacity={0.5}
          sizeAttenuation
        />
      </points>

      <group ref={groupRef}>
        {/* ─── Neural Synaptic Filament Web ─── */}
        <lineSegments geometry={lineGeometry}>
          <lineBasicMaterial
            color={activeEngine === 'local' ? '#0891b2' : activeEngine === 'cortex' ? '#7c3aed' : '#6366f1'}
            transparent
            opacity={0.35}
          />
        </lineSegments>

        {/* ─── Individual Neural Nodes ─── */}
        {nodes.map((pos, i) => (
          <mesh key={i} position={pos}>
            <sphereGeometry args={[i % 5 === 0 ? 0.035 : 0.022, 16, 16]} />
            <meshBasicMaterial color={nodePalette[i]} />
          </mesh>
        ))}

        {/* ─── Inner Luminescent Core (Cortex Ultra Aura) ─── */}
        <mesh ref={innerCoreRef}>
          <sphereGeometry args={[0.75, 32, 32]} />
          <meshBasicMaterial color={coreColor} transparent opacity={0.09} />
        </mesh>

        <mesh>
          <sphereGeometry args={[0.42, 32, 32]} />
          <meshBasicMaterial
            color={activeEngine === 'local' ? '#38bdf8' : activeEngine === 'cortex' ? '#a855f7' : '#818cf8'}
            transparent
            opacity={0.16}
          />
        </mesh>

        <mesh>
          <sphereGeometry args={[0.18, 32, 32]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.55} />
        </mesh>

        {/* ─── Primary Orbital Precision Ring ─── */}
        <mesh ref={outerRingRef}>
          <ringGeometry args={[1.38, 1.405, 64]} />
          <meshBasicMaterial
            color={activeEngine === 'local' ? '#06b6d4' : '#a855f7'}
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* ─── Secondary Gyro Orbital Ring ─── */}
        <mesh ref={secondaryRingRef}>
          <ringGeometry args={[1.52, 1.54, 64]} />
          <meshBasicMaterial
            color={activeEngine === 'cortex' ? '#818cf8' : '#06b6d4'}
            transparent
            opacity={0.25}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
    </>
  );
}

export default function AiOrb({ activeEngine = 'hybrid' }: { activeEngine?: 'hybrid' | 'local' | 'cortex' }) {
  const scrollProgress = useRef(0);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const maxScroll = Math.max(
            document.documentElement.scrollHeight - window.innerHeight,
            1000
          );
          scrollProgress.current = Math.min(Math.max(window.scrollY / maxScroll, 0), 1);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const glowGradient =
    activeEngine === 'local'
      ? 'from-cyan-500/35 via-teal-500/25 to-blue-500/20'
      : activeEngine === 'cortex'
      ? 'from-indigo-600/35 via-purple-500/25 to-fuchsia-500/25'
      : 'from-indigo-500/30 via-cyan-500/25 to-fuchsia-500/25';

  return (
    <div className="w-full h-full flex items-center justify-center relative select-none">
      {/* Ambient Iridescent Underglow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-700">
        <div className={`w-[280px] h-[280px] rounded-full bg-gradient-to-tr ${glowGradient} blur-[75px] animate-pulse`} />
      </div>

      <Canvas
        camera={{ position: [0, 0, 4.4], fov: 44 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <AppleNeuralCore scrollProgress={scrollProgress} activeEngine={activeEngine} />
      </Canvas>
    </div>
  );
}
