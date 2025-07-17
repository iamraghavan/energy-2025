
'use client';

import * as React from 'react';
import { SportQuadrant } from '@/components/big-screen/sport-quadrant';

const sportsToShow = ['Kabaddi', 'Volleyball', 'Basketball', 'Football'];

export default function BigScreenPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white p-4">
       <main className="flex-1 grid grid-cols-1 md:grid-cols-2 grid-rows-2 gap-4 h-full">
            {sportsToShow.map(sport => (
                <SportQuadrant key={sport} sportName={sport} />
            ))}
      </main>
    </div>
  );
}
