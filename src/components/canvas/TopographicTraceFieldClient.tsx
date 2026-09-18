'use client';

import dynamic from 'next/dynamic';

// Client-side only — Three.js / WebGL must not run on the server
const TopographicTraceField = dynamic(
  () =>
    import('@/components/canvas/TopographicTraceField').then(
      (mod) => mod.TopographicTraceField
    ),
  { ssr: false }
);

export { TopographicTraceField };
