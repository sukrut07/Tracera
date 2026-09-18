'use client';

import React, { useEffect, useRef } from 'react';

type NodeType = 'SYSTEM' | 'WORKFLOW' | 'EXTERNAL' | 'PENDING' | 'COMPLETED' | 'NEUTRAL';

interface NetworkNode {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseRadius: number;
  radius: number;
  type: NodeType;
  color: string;
  pulsePhase: number;
  pulseSpeed: number;
  // Interactive state
  isActivated: boolean;
  activationProgress: number; // 1.0 -> 0.0 fade
  secondaryPulse: number;    // Chain reaction pulse (1.0 -> 0.0)
}

interface TemporaryEdge {
  targetId: number;
  alpha: number;
}

interface ActivePacket {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  targetId: number;
  progress: number;
  speed: number;
  color: string;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}

const COLOR_MAP: Record<NodeType, string> = {
  SYSTEM: '#1A1A1A',     // Core system / black
  WORKFLOW: '#C5301E',   // Muted TRACERA red
  EXTERNAL: '#2563EB',   // Muted blue
  PENDING: '#D97706',    // Muted orange / amber
  COMPLETED: '#059669',  // Muted green
  NEUTRAL: '#888880',    // Subtle gray (majority)
};

export function InteractiveNetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const isMobile = width < 768;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Node count: 50 desktop, 20 mobile
    const NODE_COUNT = prefersReducedMotion ? 18 : isMobile ? 20 : 52;
    const MAX_CONNECTION_DIST = isMobile ? 120 : 155;
    const HOVER_RADIUS = isMobile ? 0 : 130;

    const mouse = { x: -1000, y: -1000, isHovering: false };

    // Most nodes should be neutral gray, with occasional semantic nodes
    const nodeTypesPool: NodeType[] = [
      'NEUTRAL', 'NEUTRAL', 'NEUTRAL', 'NEUTRAL', 'NEUTRAL', 'NEUTRAL',
      'SYSTEM', 'SYSTEM',
      'WORKFLOW', 'WORKFLOW',
      'PENDING',
      'COMPLETED',
      'EXTERNAL'
    ];

    const nodes: NetworkNode[] = Array.from({ length: NODE_COUNT }, (_, i) => {
      const type = nodeTypesPool[Math.floor(Math.random() * nodeTypesPool.length)];
      const baseRadius = type === 'NEUTRAL' ? 2.2 : 3.0;
      const speed = prefersReducedMotion ? 0.04 : 0.16 + Math.random() * 0.18;
      const angle = Math.random() * Math.PI * 2;

      return {
        id: i,
        x: Math.random() * width,
        y: Math.random() * height,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        baseRadius,
        radius: baseRadius,
        type,
        color: COLOR_MAP[type],
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.015 + Math.random() * 0.02,
        isActivated: false,
        activationProgress: 0,
        secondaryPulse: 0,
      };
    });

    // Interactive state
    let activeNodeId: number | null = null;
    let activeEdges: TemporaryEdge[] = [];
    const packets: ActivePacket[] = [];
    const ripples: Ripple[] = [];

    // Ambient background packets (low frequency)
    let lastAmbientPacket = 0;

    // Window resize
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    // Track mouse coordinates
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.isHovering = true;
    };

    const handleMouseLeave = () => {
      mouse.isHovering = false;
      mouse.x = -1000;
      mouse.y = -1000;
    };

    // CLICK INTERACTION: activate nearest node when clicking outside auth cards
    const handleClick = (e: MouseEvent) => {
      if (prefersReducedMotion) return;

      // Ensure clicks inside auth cards or UI elements do NOT trigger background network clicks
      const target = e.target as HTMLElement | null;
      if (target && target.closest('.auth-card, a, button, input, textarea, select, [role="button"], header')) {
        return;
      }

      // Find nearest node within reasonable interaction radius (220px)
      let closestNode: NetworkNode | null = null;
      let minDist = Infinity;

      nodes.forEach((n) => {
        const dist = Math.hypot(n.x - e.clientX, n.y - e.clientY);
        if (dist < minDist) {
          minDist = dist;
          closestNode = n;
        }
      });

      if (closestNode && minDist < 240) {
        // Deactivate previous active node
        if (activeNodeId !== null && nodes[activeNodeId]) {
          nodes[activeNodeId].isActivated = false;
        }

        const activated = closestNode as NetworkNode;
        activeNodeId = activated.id;
        activated.isActivated = true;
        activated.activationProgress = 1.0;

        // 1. Spawn subtle ripple
        ripples.push({
          x: activated.x,
          y: activated.y,
          radius: activated.radius,
          maxRadius: 65,
          alpha: 0.55,
        });

        // 2. Find closest 2 to 4 neighbor nodes
        const sortedNeighbors = nodes
          .filter((n) => n.id !== activated.id)
          .map((n) => ({
            id: n.id,
            dist: Math.hypot(n.x - activated.x, n.y - activated.y),
          }))
          .sort((a, b) => a.dist - b.dist)
          .slice(0, 4);

        activeEdges = sortedNeighbors.map((n) => ({
          targetId: n.id,
          alpha: 1.0,
        }));

        // 3. Dispatch traveling packets along temporary connections (activated -> neighbor)
        sortedNeighbors.forEach((neighbor) => {
          const targetNode = nodes[neighbor.id];
          if (!targetNode) return;

          packets.push({
            sourceX: activated.x,
            sourceY: activated.y,
            targetX: targetNode.x,
            targetY: targetNode.y,
            targetId: neighbor.id,
            progress: 0,
            speed: 0.022 + Math.random() * 0.015,
            color: '#E73520',
          });
        });
      }
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('click', handleClick);

    // Auto-pause when tab is hidden
    let isTabVisible = true;
    const handleVisibility = () => {
      isTabVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Animation Loop
    const render = (time: number) => {
      if (!isTabVisible) {
        animId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // ----------------------------------------------------
      // 1. UPDATE NODES (Position, Hover, Activation, Secondary Pulse)
      // ----------------------------------------------------
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];

        if (!prefersReducedMotion) {
          n.x += n.vx;
          n.y += n.vy;

          // Wrap-around edges with margin
          if (n.x < -20) n.x = width + 20;
          else if (n.x > width + 20) n.x = -20;
          if (n.y < -20) n.y = height + 20;
          else if (n.y > height + 20) n.y = -20;

          // Subtle organic pulsing
          n.pulsePhase += n.pulseSpeed;

          // Mouse proximity reaction (gentle nudge)
          if (mouse.isHovering && HOVER_RADIUS > 0) {
            const dx = n.x - mouse.x;
            const dy = n.y - mouse.y;
            const dist = Math.hypot(dx, dy);

            if (dist < HOVER_RADIUS && dist > 1) {
              const force = (1 - dist / HOVER_RADIUS) * 0.35;
              n.x += (dx / dist) * force;
              n.y += (dy / dist) * force;
            }
          }
        }

        // Handle active state fade (lasts ~1.8 seconds)
        if (n.isActivated) {
          n.activationProgress = Math.max(0, n.activationProgress - 0.009);
          if (n.activationProgress <= 0) {
            n.isActivated = false;
            if (activeNodeId === n.id) {
              activeNodeId = null;
              activeEdges = [];
            }
          }
        }

        // Handle chain reaction secondary pulse fade
        if (n.secondaryPulse > 0) {
          n.secondaryPulse = Math.max(0, n.secondaryPulse - 0.025);
        }

        // Hover scale calculation
        const distToMouse = mouse.isHovering ? Math.hypot(n.x - mouse.x, n.y - mouse.y) : Infinity;
        const hoverBonus = distToMouse < 90 ? (1 - distToMouse / 90) * 1.5 : 0;
        const activeBonus = n.activationProgress * 3.5;
        const chainBonus = n.secondaryPulse * 2.0;

        n.radius = n.baseRadius + Math.sin(n.pulsePhase) * 0.4 + hoverBonus + activeBonus + chainBonus;
      }

      // ----------------------------------------------------
      // 2. DRAW BASE CONNECTIONS (Very subtle, 20–30% visibility)
      // ----------------------------------------------------
      const standardPairs: { n1: NetworkNode; n2: NetworkNode; dist: number }[] = [];

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i];
          const n2 = nodes[j];
          const dist = Math.hypot(n2.x - n1.x, n2.y - n1.y);

          if (dist < MAX_CONNECTION_DIST) {
            standardPairs.push({ n1, n2, dist });

            // Very subtle base connection opacity
            const baseAlpha = (1 - dist / MAX_CONNECTION_DIST) * 0.16;

            // Slight highlight if near cursor
            let mouseBonus = 0;
            if (mouse.isHovering) {
              const midX = (n1.x + n2.x) / 2;
              const midY = (n1.y + n2.y) / 2;
              const mouseDist = Math.hypot(midX - mouse.x, midY - mouse.y);
              if (mouseDist < 100) {
                mouseBonus = (1 - mouseDist / 100) * 0.14;
              }
            }

            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.strokeStyle = `rgba(30, 30, 30, ${baseAlpha + mouseBonus})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // ----------------------------------------------------
      // 3. DRAW TEMPORARY CONNECTIONS FROM ACTIVATED NODE
      // ----------------------------------------------------
      if (activeNodeId !== null && nodes[activeNodeId]) {
        const activeNode = nodes[activeNodeId];
        const progress = activeNode.activationProgress;

        activeEdges.forEach((edge) => {
          const targetNode = nodes[edge.targetId];
          if (!targetNode) return;

          ctx.beginPath();
          ctx.moveTo(activeNode.x, activeNode.y);
          ctx.lineTo(targetNode.x, targetNode.y);
          // Subtle TRACERA red temporary edge
          ctx.strokeStyle = `rgba(231, 53, 32, ${progress * 0.45})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        });
      }

      // ----------------------------------------------------
      // 4. DRAW RIPPLE PULSES
      // ----------------------------------------------------
      for (let r = ripples.length - 1; r >= 0; r--) {
        const rp = ripples[r];
        rp.radius += 1.4;
        rp.alpha *= 0.94;

        if (rp.alpha < 0.02 || rp.radius > rp.maxRadius) {
          ripples.splice(r, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(rp.x, rp.y, rp.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(231, 53, 32, ${rp.alpha})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      // ----------------------------------------------------
      // 5. UPDATE AND DRAW PACKETS / DATA PARTICLES
      // ----------------------------------------------------
      // Ambient packet generation (every 1.5s)
      if (!prefersReducedMotion && standardPairs.length > 0 && time - lastAmbientPacket > 1500) {
        if (packets.length < (isMobile ? 4 : 10)) {
          const pair = standardPairs[Math.floor(Math.random() * standardPairs.length)];
          packets.push({
            sourceX: pair.n1.x,
            sourceY: pair.n1.y,
            targetX: pair.n2.x,
            targetY: pair.n2.y,
            targetId: pair.n2.id,
            progress: 0,
            speed: 0.008 + Math.random() * 0.01,
            color: '#8A8A85',
          });
        }
        lastAmbientPacket = time;
      }

      for (let p = packets.length - 1; p >= 0; p--) {
        const pkt = packets[p];
        pkt.progress += pkt.speed;

        // When packet arrives at destination node
        if (pkt.progress >= 1) {
          // Chain reaction: activate secondary pulse on target node
          if (pkt.color === '#E73520' && nodes[pkt.targetId]) {
            nodes[pkt.targetId].secondaryPulse = 1.0;
          }
          packets.splice(p, 1);
          continue;
        }

        const px = pkt.sourceX + (pkt.targetX - pkt.sourceX) * pkt.progress;
        const py = pkt.sourceY + (pkt.targetY - pkt.sourceY) * pkt.progress;

        // Draw particle dot
        ctx.beginPath();
        ctx.arc(px, py, pkt.color === '#E73520' ? 2.2 : 1.6, 0, Math.PI * 2);
        ctx.fillStyle = pkt.color;
        ctx.fill();

        // Subtle trace halo for active red packets
        if (pkt.color === '#E73520') {
          ctx.beginPath();
          ctx.arc(px, py, 4.2, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(231, 53, 32, 0.22)';
          ctx.fill();
        }
      }

      // ----------------------------------------------------
      // 6. DRAW NODES (Neutral with low alpha, highlights when active/hovered)
      // ----------------------------------------------------
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const isHovered = mouse.isHovering && Math.hypot(n.x - mouse.x, n.y - mouse.y) < 70;

        // Base color handling
        let fillColor = n.color;
        let fillAlpha = n.type === 'NEUTRAL' ? 0.35 : 0.55;

        // Hover effect
        if (isHovered) {
          fillAlpha = 0.85;
        }

        // Activated effect
        if (n.isActivated) {
          fillColor = '#E73520';
          fillAlpha = 0.95;

          // Outer radiating ring
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.radius + 4, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(231, 53, 32, ${n.activationProgress * 0.7})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        } else if (n.secondaryPulse > 0) {
          // Chain reaction pulse ring
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.radius + 2.5, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(231, 53, 32, ${n.secondaryPulse * 0.5})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Solid node core
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = fillColor;
        ctx.globalAlpha = fillAlpha;
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('click', handleClick);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-none w-full h-full"
    />
  );
}
