import React from 'react';

export default function BubblesBg() {
  const bubbles = [
    { left: '8%', size: '24px', duration: '14s', delay: '0s', drift: '25px' },
    { left: '22%', size: '36px', duration: '18s', delay: '3s', drift: '-30px' },
    { left: '38%', size: '14px', duration: '12s', delay: '1s', drift: '15px' },
    { left: '52%', size: '40px', duration: '22s', delay: '7s', drift: '45px' },
    { left: '68%', size: '18px', duration: '15s', delay: '2s', drift: '-15px' },
    { left: '79%', size: '28px', duration: '19s', delay: '9s', drift: '30px' },
    { left: '91%', size: '32px', duration: '16s', delay: '5s', drift: '-20px' },
    { left: '15%', size: '12px', duration: '13s', delay: '11s', drift: '10px' },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {bubbles.map((b, idx) => (
        <span
          key={idx}
          className="ambient-bubble"
          style={{
            left: b.left,
            width: b.size,
            height: b.size,
            '--duration': b.duration,
            '--delay': b.delay,
            '--drift': b.drift,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
