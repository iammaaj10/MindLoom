'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { getKnowledgeGraph } from '@/app/actions/graph';
import dynamic from 'next/dynamic';
import { useTheme } from '@/components/theme/theme-provider';
import * as THREE from 'three';
import SpriteText from 'three-spritetext';

// Dynamically import the 3D graph to prevent SSR hydration errors
const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), { ssr: false });

export default function KnowledgeGraphPage() {
  const [graphData, setGraphData] = useState<{ nodes: any[]; links: any[] }>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    getKnowledgeGraph().then((data) => {
      setGraphData(data);
      setLoading(false);
    });
  }, []);

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'Person': return '#38bdf8'; // sky-400
      case 'Organization': return '#f472b6'; // pink-400
      case 'Location': return '#34d399'; // emerald-400
      case 'Technology': return '#818cf8'; // indigo-400
      case 'Concept': return '#fbbf24'; // amber-400
      default: return '#9ca3af'; // gray-400
    }
  };

  const fgRef = useRef<any>(null);
  const initialZoomDone = useRef(false);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[var(--bg-surface)]">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-[var(--border)] shrink-0 z-10 bg-[var(--bg-surface)]/80 backdrop-blur-md">
        <div>
          <h1 className="text-[15px] font-semibold text-[var(--text-primary)] tracking-tight">
            Knowledge Graph
          </h1>
          <p className="text-xs text-[var(--text-tertiary)]">
            Interactive 3D visualization of your cognitive network
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-xs text-[var(--text-secondary)] font-mono">
            {graphData.nodes.length} Nodes • {graphData.links.length} Edges
          </div>
        </div>
      </header>

      {/* 3D Canvas Container */}
      <div className="flex-1 relative w-full h-full">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : graphData.nodes.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--text-secondary)]">
            <div className="w-16 h-16 mb-4 rounded-2xl bg-[var(--surface-2)] flex items-center justify-center border border-[var(--border)]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4l3 3" />
              </svg>
            </div>
            <p className="text-sm font-medium text-[var(--text-primary)]">Graph Empty</p>
            <p className="text-xs mt-1 max-w-sm text-center">
              Upload documents to auto-extract entities and relationships. The graph will populate here automatically.
            </p>
          </div>
        ) : (
          <div className="w-full h-full absolute inset-0 cursor-move">
            {/* Ambient Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 via-black to-black pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/10 rounded-full blur-[150px] pointer-events-none" />
            <ForceGraph3D
              ref={fgRef}
              graphData={graphData}
              nodeLabel={(node: any) => `<div style="padding: 6px 10px; background: rgba(0,0,0,0.85); border: 1px solid rgba(255,255,255,0.1); color: white; border-radius: 8px; font-family: sans-serif; font-size: 13px; max-width: 250px; text-align: left; backdrop-filter: blur(4px); box-shadow: 0 4px 20px rgba(0,0,0,0.5);"><strong>${node.name}</strong><br/><span style="color: #a1a1aa; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;">${node.type}</span><br/><div style="margin-top: 6px; color: #d4d4d8; line-height: 1.4;">${node.description}</div></div>`}
              nodeThreeObject={(node: any) => {
                const group = new THREE.Group();
                const nodeSize = (node.val || 2) * 1.5;
                
                // Create glowing glass sphere
                const geometry = new THREE.SphereGeometry(nodeSize, 32, 32);
                const material = new THREE.MeshPhysicalMaterial({ 
                  color: getNodeColor(node.type),
                  transparent: true,
                  opacity: 0.8,
                  roughness: 0.2,
                  metalness: 0.1,
                  transmission: 0.5,
                  thickness: 1.5,
                  clearcoat: 1.0,
                  clearcoatRoughness: 0.1,
                });
                const sphere = new THREE.Mesh(geometry, material);
                group.add(sphere);

                // Create text label
                const sprite = new SpriteText(node.name);
                sprite.color = theme === 'light' ? '#18181b' : '#f4f4f5'; 
                sprite.textHeight = 3.5;
                sprite.position.y = -(nodeSize + 4); // Float below
                sprite.renderOrder = 999; // Always render on top
                sprite.material.depthTest = false;
                group.add(sprite);

                return group;
              }}
              nodeColor={(node: any) => getNodeColor(node.type)}
              linkColor={() => theme === 'light' ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.15)'}
              linkWidth={0.8}
              linkDirectionalParticles={3}
              linkDirectionalParticleWidth={2}
              linkDirectionalParticleSpeed={(d: any) => 0.005}
              linkDirectionalParticleColor={(d: any) => getNodeColor(d.source.type || 'Other')}
              backgroundColor="rgba(0,0,0,0)"

              enableNodeDrag={true}
              showNavInfo={false}
              d3AlphaDecay={0.02}
              d3VelocityDecay={0.3}
              onNodeClick={(node: any) => {
                // Focus camera on clicked node
                if (fgRef.current) {
                  const distance = 40;
                  const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);
                  fgRef.current.cameraPosition(
                    { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
                    node,
                    1500
                  );
                }
              }}
              onEngineStop={() => {
                // Only auto-zoom on the very first layout stabilization
                if (fgRef.current && !initialZoomDone.current && graphData.nodes.length > 0) {
                  // Fit graph to screen with 75px padding, taking 800ms
                  fgRef.current.zoomToFit(800, 75, () => true);
                  
                  // Set finite scroll/zoom limits
                  const controls = fgRef.current.controls();
                  if (controls) {
                    controls.minDistance = 25; // Prevent zooming too close (inside a node)
                    controls.maxDistance = 600; // Prevent zooming too far out into the void
                  }
                  
                  initialZoomDone.current = true;
                }
              }}
            />

            {/* Helper Overlay */}
            <div className="absolute bottom-6 right-6 px-4 py-3 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl text-xs text-white/70 font-mono shadow-2xl pointer-events-none">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <span><kbd className="px-1.5 py-0.5 bg-white/10 rounded border border-white/20">Left-Click Drag</kbd> Rotate</span>
                  <span><kbd className="px-1.5 py-0.5 bg-white/10 rounded border border-white/20">Right-Click Drag</kbd> Pan Graph</span>
                </div>
                <div className="flex items-center gap-3">
                  <span><kbd className="px-1.5 py-0.5 bg-white/10 rounded border border-white/20">Scroll</kbd> Zoom</span>
                  <span><kbd className="px-1.5 py-0.5 bg-white/10 rounded border border-white/20">Click Node</kbd> Focus & Drag</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
