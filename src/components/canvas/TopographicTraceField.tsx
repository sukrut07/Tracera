'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export function TopographicTraceField() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check prefers-reduced-motion or low power
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 768;

    if (prefersReducedMotion || isMobile) {
      setIsSupported(false);
      return;
    }

    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // Three.js Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    camera.position.set(0, -22, 28);
    camera.lookAt(0, 4, 0);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      container.appendChild(renderer.domElement);
    } catch {
      setIsSupported(false);
      return;
    }

    // Topographic Grid Plane Geometry
    const gridX = 54;
    const gridY = 36;
    const planeGeo = new THREE.PlaneGeometry(80, 50, gridX, gridY);
    const pos = planeGeo.attributes.position;

    // Store original coordinate base
    const initialZ = new Float32Array(pos.count);
    for (let i = 0; i < pos.count; i++) {
      initialZ[i] = 0;
    }

    // Wireframe Material with thin dark contour lines
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0x0a0a0a,
      wireframe: true,
      transparent: true,
      opacity: 0.055, // extremely subtle monochrome
    });

    const terrainMesh = new THREE.Mesh(planeGeo, wireframeMat);
    scene.add(terrainMesh);

    // Dynamic Red Trace Curves across the Topographic Surface
    const tracePointsCount = 40;
    const traceGeo = new THREE.BufferGeometry();
    const tracePositions = new Float32Array(tracePointsCount * 3);
    for (let i = 0; i < tracePointsCount; i++) {
      const u = (i / (tracePointsCount - 1)) * 2 - 1;
      tracePositions[i * 3] = u * 35; // X
      tracePositions[i * 3 + 1] = Math.sin(u * 2.5) * 12; // Y
      tracePositions[i * 3 + 2] = 2; // Z
    }
    traceGeo.setAttribute('position', new THREE.BufferAttribute(tracePositions, 3));

    const traceMat = new THREE.LineBasicMaterial({
      color: 0xe73520,
      transparent: true,
      opacity: 0.28,
      linewidth: 2,
    });
    const traceLine = new THREE.Line(traceGeo, traceMat);
    scene.add(traceLine);

    // Mouse Tracking for Parallax
    let targetRotX = 0;
    let targetRotY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      targetRotY = nx * 0.08;
      targetRotX = -ny * 0.06;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Window Resize
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animId: number;
    let clock = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      clock += 0.012;

      // Gentle procedural wave height updates
      const positions = planeGeo.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        // Harmonic topographic ripples
        const z =
          Math.sin(x * 0.12 + clock * 0.5) * 1.8 +
          Math.cos(y * 0.14 + clock * 0.4) * 1.6 +
          Math.sin((x + y) * 0.08 + clock * 0.3) * 1.2;
        positions.setZ(i, z);
      }
      positions.needsUpdate = true;

      // Update Red Trace Path Z to glide across the wave
      const tracePos = traceGeo.attributes.position;
      for (let i = 0; i < tracePointsCount; i++) {
        const tx = tracePos.getX(i);
        const ty = tracePos.getY(i);
        const tz =
          Math.sin(tx * 0.12 + clock * 0.5) * 1.8 +
          Math.cos(ty * 0.14 + clock * 0.4) * 1.6 +
          2.0;
        tracePos.setZ(i, tz);
      }
      tracePos.needsUpdate = true;

      // Camera Parallax damping
      terrainMesh.rotation.z += (targetRotY - terrainMesh.rotation.z) * 0.04;
      terrainMesh.rotation.x += (targetRotX - terrainMesh.rotation.x) * 0.04;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      if (renderer?.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer?.dispose();
      planeGeo.dispose();
      wireframeMat.dispose();
      traceGeo.dispose();
      traceMat.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 pointer-events-none overflow-hidden z-0"
      aria-hidden="true"
    >
      {/* Fallback subtle topographic contour lines if WebGL is disabled or reduced motion */}
      {!isSupported && (
        <svg
          className="w-full h-full opacity-10"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 800"
          preserveAspectRatio="none"
        >
          <path
            d="M0,200 Q300,120 600,240 T1200,180"
            fill="none"
            stroke="#0A0A0A"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <path
            d="M0,320 Q350,260 700,360 T1200,300"
            fill="none"
            stroke="#0A0A0A"
            strokeWidth="1.5"
          />
          <path
            d="M0,450 Q400,380 800,480 T1200,420"
            fill="none"
            stroke="#E73520"
            strokeWidth="2"
            strokeDasharray="8 6"
          />
          <path
            d="M0,580 Q450,520 900,600 T1200,550"
            fill="none"
            stroke="#0A0A0A"
            strokeWidth="1.5"
          />
        </svg>
      )}
    </div>
  );
}
