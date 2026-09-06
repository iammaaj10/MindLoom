'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Generate points on a sphere surface for the neural network nodes
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

// Find edges: connect nodes that are within a distance threshold
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

function NeuralNetwork() {
  const groupRef = useRef<THREE.Group>(null);

  const nodes = useMemo(() => generateNodes(60, 1.6), []);
  const edges = useMemo(() => generateEdges(nodes, 0.9), [nodes]);

  // Build a single BufferGeometry for all edges
  const lineGeometry = useMemo(() => {
    const positions: number[] = [];
    for (const [i, j] of edges) {
      positions.push(...nodes[i], ...nodes[j]);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return geo;
  }, [nodes, edges]);

  // Slow, smooth auto-rotation
  useFrame(({ clock }) => {
    if (groupRef.current) {
      const t = clock.getElapsedTime();
      groupRef.current.rotation.y = t * 0.08;
      groupRef.current.rotation.x = Math.sin(t * 0.05) * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Edges */}
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial color="#333333" transparent opacity={0.35} />
      </lineSegments>

      {/* Nodes */}
      {nodes.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.025, 12, 12]} />
          <meshBasicMaterial color="#888888" />
        </mesh>
      ))}

      {/* Inner core glow */}
      <mesh>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.04} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.08} />
      </mesh>
    </group>
  );
}

export default function AiOrb() {
  return (
    <div className="w-full h-full min-h-[400px] md:min-h-[500px]">
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 40 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <NeuralNetwork />
      </Canvas>
    </div>
  );
}
