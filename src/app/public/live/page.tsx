
'use client';

import * as React from 'react';
import { SportQuadrant } from '@/components/public/sport-quadrant';

export default function PublicLiveDisplayPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans antialiased overflow-hidden">
      <main className="grid grid-cols-1 md:grid-cols-2 grid-rows-2 h-screen">
        <SportQuadrant sportName="Kabaddi" />
        <SportQuadrant sportName="Volleyball" />
        <SportQuadrant sportName="Basketball" />
        <SportQuadrant sportName="Football" />
      </main>
    </div>
  );
}
