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

  const backgroundColor = theme === 'light' ? '#f8f9fa' : '#0a0a0a';

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
            <ForceGraph3D
              graphData={graphData}
              nodeLabel={(node: any) => `<div style="padding: 4px 8px; background: rgba(0,0,0,0.8); color: white; border-radius: 4px; font-family: sans-serif; font-size: 12px; max-width: 200px; text-align: center;"><strong>${node.name}</strong><br/><span style="color: #a1a1aa; font-size: 10px;">${node.type}</span><br/><br/>${node.description}</div>`}
              nodeThreeObject={(node: any) => {
                const group = new THREE.Group();
                
                // Create glowing sphere
                const geometry = new THREE.SphereGeometry(node.val * 4, 16, 16);
                const material = new THREE.MeshPhongMaterial({ 
                  color: getNodeColor(node.type),
                  transparent: true,
                  opacity: 0.9,
                  shininess: 100,
                });
                const sphere = new THREE.Mesh(geometry, material);
                group.add(sphere);

                // Create text label
                const sprite = new SpriteText(node.name);
                sprite.color = theme === 'light' ? '#3f3f46' : '#f4f4f5'; // zinc-700 or zinc-100
                sprite.textHeight = 3;
                sprite.position.y = (node.val * 4) + 4; // Float above
                group.add(sprite);

                return group;
              }}
              nodeColor={(node: any) => getNodeColor(node.type)}
              linkColor={() => theme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'}
              linkWidth={0.5}
              linkDirectionalParticles={2}
              linkDirectionalParticleWidth={1.5}
              linkDirectionalParticleSpeed={(d: any) => d.value * 0.003}
              linkDirectionalParticleColor={(d: any) => getNodeColor(d.source.type || 'Other')}
              backgroundColor={backgroundColor}
              enableNodeDrag={true}
              showNavInfo={false}
              d3AlphaDecay={0.02}
              d3VelocityDecay={0.3}
            />
          </div>
        )}
      </div>
    </div>
  );
}
