
'use client';

import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDate: string;
}

export function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const calculateTimeLeft = () => {
    const difference = +new Date(targetDate) - +new Date();
    let timeLeft = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  });

  const timerComponents = Object.entries(timeLeft).map(([interval, value]) => {
    if (value <= 0 && interval !== 'seconds' && timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0) {
        return null;
    }
     if (value <= 0 && interval !== 'seconds' && timeLeft.days === 0 && timeLeft.hours === 0) {
        return null;
    }
     if (value <= 0 && interval !== 'seconds' && timeLeft.days === 0) {
        return null;
    }

    return (
        <div key={interval} className="flex flex-col items-center justify-center bg-primary/20 text-white rounded-lg p-4 w-24">
            <span className="text-4xl font-bold tabular-nums">{String(value).padStart(2, '0')}</span>
            <span className="text-xs uppercase tracking-widest">{interval}</span>
        </div>
    );
  });

  return (
    <div className="flex gap-4">
      {timerComponents.some(component => component !== null) ? timerComponents : <span>Starting soon...</span>}
    </div>
  );
}
