'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { getKnowledgeGraph, getNodeDetails } from '@/app/actions/graph';
import dynamic from 'next/dynamic';
import { useTheme } from '@/components/theme/theme-provider';
import * as THREE from 'three';
import SpriteText from 'three-spritetext';

// Dynamically import the 3D graph to prevent SSR hydration errors
const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), { ssr: false });

export default function KnowledgeGraphPage() {
  const [graphData, setGraphData] = useState<{ nodes: any[]; links: any[] }>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [nodeDetails, setNodeDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [highlightNodes, setHighlightNodes] = useState<Set<string>>(new Set());
  const [highlightLinks, setHighlightLinks] = useState<Set<any>>(new Set());
  const [hoverNode, setHoverNode] = useState<any>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const { theme } = useTheme();
  const fgRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const initialZoomDone = useRef(false);

  useEffect(() => {
    getKnowledgeGraph().then((data) => {
      // Scale node sizes by connection count
      const linkCounts: Record<string, number> = {};
      data.links.forEach((link: any) => {
        const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
        const targetId = typeof link.target === 'object' ? link.target.id : link.target;
        linkCounts[sourceId] = (linkCounts[sourceId] || 0) + 1;
        linkCounts[targetId] = (linkCounts[targetId] || 0) + 1;
      });

      const scaledNodes = data.nodes.map((n: any) => ({
        ...n,
        val: Math.max(2, (linkCounts[n.id] || 0) + 1),
      }));

      setGraphData({ nodes: scaledNodes, links: data.links });
      setLoading(false);
    });
  }, []);

  // Responsive sizing
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [loading]);

  const getNodeColor = useCallback((type: string) => {
    switch (type) {
      case 'Person': return '#38bdf8';
      case 'Organization': return '#f472b6';
      case 'Location': return '#34d399';
      case 'Technology': return '#818cf8';
      case 'Concept': return '#fbbf24';
      default: return '#9ca3af';
    }
  }, []);

  const handleNodeHover = useCallback((node: any) => {
    const newHighlightNodes = new Set<string>();
    const newHighlightLinks = new Set<any>();

    if (node) {
      newHighlightNodes.add(node.id);
      graphData.links.forEach((link: any) => {
        const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
        const targetId = typeof link.target === 'object' ? link.target.id : link.target;
        if (sourceId === node.id || targetId === node.id) {
          newHighlightLinks.add(link);
          newHighlightNodes.add(sourceId);
          newHighlightNodes.add(targetId);
        }
      });
    }

    setHighlightNodes(newHighlightNodes);
    setHighlightLinks(newHighlightLinks);
    setHoverNode(node || null);
  }, [graphData.links]);

  const handleNodeClick = useCallback((node: any) => {
    if (!fgRef.current || !node) return;

    // Smooth camera fly-to
    const distance = 100;
    const distRatio = 1 + distance / Math.hypot(node.x || 1, node.y || 1, node.z || 1);
    fgRef.current.cameraPosition(
      { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
      node,
      1200
    );

    if (node.id) {
      setSelectedNodeId(node.id);
      setLoadingDetails(true);
      setNodeDetails(null);
      getNodeDetails(node.id).then(res => {
        if (res.success) setNodeDetails(res);
        setLoadingDetails(false);
      });
    }
  }, []);

  const legendItems = [
    { type: 'Person', color: '#38bdf8' },
    { type: 'Organization', color: '#f472b6' },
    { type: 'Location', color: '#34d399' },
    { type: 'Technology', color: '#818cf8' },
    { type: 'Concept', color: '#fbbf24' },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-5.5rem)] overflow-hidden rounded-2xl border border-white/[0.06] bg-black">
      {/* Header */}
      <header className="h-14 flex items-center justify-between px-5 border-b border-white/[0.06] shrink-0 z-10 bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-fuchsia-400 shadow-[0_0_8px_rgba(217,70,239,0.6)]" />
          <h1 className="text-[14px] font-semibold text-white tracking-tight">Knowledge Graph</h1>
          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20">3D</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-[11px] text-zinc-500 font-mono">
            {graphData.nodes.length} nodes • {graphData.links.length} edges
          </div>
          {graphData.nodes.length > 0 && (
            <button
              onClick={() => {
                if (fgRef.current) {
                  fgRef.current.zoomToFit(800, 75);
                }
              }}
              className="px-2.5 py-1 text-[10px] font-mono text-zinc-400 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
            >
              Reset View
            </button>
          )}
        </div>
      </header>

      {/* 3D Canvas Container */}
      <div ref={containerRef} className="flex-1 relative w-full overflow-hidden">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-fuchsia-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-zinc-500 font-mono">Loading neural network...</span>
          </div>
        ) : graphData.nodes.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400">
            <div className="w-16 h-16 mb-4 rounded-2xl bg-white/[0.03] flex items-center justify-center border border-white/10">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-600">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </div>
            <p className="text-sm font-medium text-white">No Connections Yet</p>
            <p className="text-xs mt-1 max-w-sm text-center text-zinc-500">
              Upload documents to auto-extract entities and relationships. Your knowledge graph will grow here.
            </p>
          </div>
        ) : (
          <>
            {/* Ambient glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-fuchsia-500/5 rounded-full blur-[120px] pointer-events-none" />

            <ForceGraph3D
              ref={fgRef}
              width={dimensions.width}
              height={dimensions.height}
              graphData={graphData}
              nodeLabel={() => ''}
              nodeThreeObject={(node: any) => {
                const group = new THREE.Group();
                const isHighlighted = highlightNodes.has(node.id);
                const isHovered = hoverNode?.id === node.id;
                const baseSize = (node.val || 2) * 1.2;
                const nodeSize = isHovered ? baseSize * 1.4 : baseSize;

                // Core sphere
                const geometry = new THREE.SphereGeometry(nodeSize, 24, 24);
                const material = new THREE.MeshPhongMaterial({
                  color: getNodeColor(node.type),
                  transparent: true,
                  opacity: isHighlighted || highlightNodes.size === 0 ? 0.9 : 0.25,
                  shininess: 80,
                  emissive: isHovered ? getNodeColor(node.type) : '#000000',
                  emissiveIntensity: isHovered ? 0.4 : 0,
                });
                const sphere = new THREE.Mesh(geometry, material);
                group.add(sphere);

                // Outer glow ring for hovered node
                if (isHovered) {
                  const ringGeo = new THREE.RingGeometry(nodeSize * 1.6, nodeSize * 2, 32);
                  const ringMat = new THREE.MeshBasicMaterial({
                    color: getNodeColor(node.type),
                    transparent: true,
                    opacity: 0.3,
                    side: THREE.DoubleSide,
                  });
                  const ring = new THREE.Mesh(ringGeo, ringMat);
                  ring.lookAt(0, 0, 1);
                  group.add(ring);
                }

                // Text label
                const sprite = new SpriteText(node.name);
                sprite.color = isHighlighted || highlightNodes.size === 0 ? '#f4f4f5' : '#52525b';
                sprite.textHeight = isHovered ? 4 : 3;
                sprite.position.y = -(nodeSize + 5);
                sprite.renderOrder = 999;
                sprite.material.depthTest = false;
                group.add(sprite);

                return group;
              }}
              linkColor={(link: any) => {
                if (highlightLinks.has(link)) return '#818cf8';
                return highlightNodes.size > 0 ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.12)';
              }}
              linkWidth={(link: any) => highlightLinks.has(link) ? 2 : 0.5}
              linkDirectionalParticles={(link: any) => highlightLinks.has(link) ? 4 : 1}
              linkDirectionalParticleWidth={(link: any) => highlightLinks.has(link) ? 3 : 1.5}
              linkDirectionalParticleSpeed={() => 0.004}
              linkDirectionalParticleColor={(link: any) => {
                if (highlightLinks.has(link)) return '#818cf8';
                const sourceType = typeof link.source === 'object' ? link.source.type : 'Other';
                return getNodeColor(sourceType);
              }}
              backgroundColor="rgba(0,0,0,0)"
              enableNodeDrag={true}
              showNavInfo={false}
              d3AlphaDecay={0.025}
              d3VelocityDecay={0.35}
              warmupTicks={80}
              cooldownTicks={200}
              onNodeHover={handleNodeHover}
              onNodeClick={handleNodeClick}
              onEngineStop={() => {
                if (fgRef.current && !initialZoomDone.current && graphData.nodes.length > 0) {
                  fgRef.current.zoomToFit(1000, 100, () => true);
                  const controls = fgRef.current.controls();
                  if (controls) {
                    controls.minDistance = 30;
                    controls.maxDistance = 500;
                  }
                  initialZoomDone.current = true;
                }
              }}
            />

            {/* Legend */}
            <div className="absolute top-4 left-4 px-3 py-2.5 bg-black/50 backdrop-blur-md border border-white/10 rounded-xl z-10">
              <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-2">Entity Types</div>
              <div className="flex flex-col gap-1.5">
                {legendItems.map(item => (
                  <div key={item.type} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color, boxShadow: `0 0 6px ${item.color}60` }} />
                    <span className="text-[10px] text-zinc-400">{item.type}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hover Tooltip */}
            {hoverNode && (
              <div className="absolute top-4 right-4 px-4 py-3 bg-black/70 backdrop-blur-xl border border-white/10 rounded-xl z-10 max-w-[260px] pointer-events-none">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getNodeColor(hoverNode.type), boxShadow: `0 0 8px ${getNodeColor(hoverNode.type)}` }} />
                  <span className="text-sm font-bold text-white">{hoverNode.name}</span>
                </div>
                <div className="text-[10px] font-mono text-zinc-400 uppercase mb-1">{hoverNode.type}</div>
                {hoverNode.description && (
                  <div className="text-[11px] text-zinc-400 leading-relaxed line-clamp-3 mt-1">{hoverNode.description}</div>
                )}
              </div>
            )}

            {/* Controls Helper */}
            <div className="absolute bottom-4 left-4 px-3 py-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-lg text-[10px] text-white/40 font-mono pointer-events-none flex gap-4">
              <span><kbd className="px-1 py-0.5 bg-white/10 rounded text-[9px]">L-Drag</kbd> Rotate</span>
              <span><kbd className="px-1 py-0.5 bg-white/10 rounded text-[9px]">R-Drag</kbd> Pan</span>
              <span><kbd className="px-1 py-0.5 bg-white/10 rounded text-[9px]">Scroll</kbd> Zoom</span>
              <span><kbd className="px-1 py-0.5 bg-white/10 rounded text-[9px]">Click</kbd> Inspect</span>
            </div>
          </>
        )}

        {/* Node Details Sidebar */}
        {selectedNodeId && (
          <div className="absolute top-0 right-0 h-full w-[340px] bg-black/70 backdrop-blur-2xl border-l border-white/10 shadow-2xl z-20 flex flex-col">
            <div className="p-4 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-[13px] font-bold text-white tracking-tight">Entity Inspector</h2>
              <button
                onClick={() => { setSelectedNodeId(null); setNodeDetails(null); }}
                className="p-1 rounded-md hover:bg-white/10 text-white/40 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
              {loadingDetails ? (
                <div className="space-y-3 animate-pulse">
                  <div className="h-5 w-2/3 bg-white/10 rounded" />
                  <div className="h-3 w-1/3 bg-white/5 rounded" />
                  <div className="h-16 w-full bg-white/5 rounded-lg" />
                </div>
              ) : nodeDetails?.node ? (
                <>
                  {/* Node Identity */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getNodeColor(nodeDetails.node.type), boxShadow: `0 0 10px ${getNodeColor(nodeDetails.node.type)}` }} />
                      <h3 className="text-lg font-black tracking-tight text-white">{nodeDetails.node.name}</h3>
                    </div>
                    <div className="inline-block px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-widest uppercase border" style={{ borderColor: getNodeColor(nodeDetails.node.type) + '40', color: getNodeColor(nodeDetails.node.type), backgroundColor: getNodeColor(nodeDetails.node.type) + '10' }}>
                      {nodeDetails.node.type}
                    </div>
                  </div>

                  {/* Description */}
                  {nodeDetails.node.description && (
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-3 text-[12px] leading-relaxed text-zinc-300">
                      {nodeDetails.node.description}
                    </div>
                  )}

                  {/* Connections */}
                  {nodeDetails.edges && nodeDetails.edges.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase mb-2 flex items-center gap-2">
                        Connections
                        <span className="px-1.5 py-0.5 rounded bg-white/5 text-[9px] font-mono">{nodeDetails.edges.length}</span>
                      </h4>
                      <div className="space-y-1.5">
                        {nodeDetails.edges.map((edge: any) => {
                          const isSource = edge.source.id === nodeDetails.node.id;
                          const targetEntity = isSource ? edge.target : edge.source;

                          return (
                            <div
                              key={edge.id}
                              className="p-2.5 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] rounded-lg transition-all cursor-pointer group"
                              onClick={() => {
                                setSelectedNodeId(targetEntity.id);
                                setLoadingDetails(true);
                                setNodeDetails(null);
                                getNodeDetails(targetEntity.id).then(res => {
                                  if (res.success) setNodeDetails(res);
                                  setLoadingDetails(false);
                                });
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <svg className="w-3 h-3 text-zinc-600 group-hover:text-indigo-400 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  {isSource ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                  ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                  )}
                                </svg>
                                <div className="min-w-0">
                                  <div className="text-[9px] font-mono text-zinc-500 truncate">{edge.relationship}</div>
                                  <div className="text-[12px] font-semibold text-white tracking-tight truncate">{targetEntity.name}</div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-zinc-500 text-xs">Could not load entity details.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
