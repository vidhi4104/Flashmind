import React from 'react';

export function FloatingParticles() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/20 rounded-full animate-pulse"
            style={{
              left: `${10 + i * 15}%`,
              top: `${20 + i * 10}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + i * 0.5}s`,
            }}
          >
            <div 
              className="absolute inset-0 bg-blue-400/30 rounded-full animate-ping"
              style={{
                animationDelay: `${i * 0.7}s`,
                animationDuration: `${4 + i * 0.3}s`,
              }}
            />
          </div>
        ))}
        
        {/* Floating circles - using the animate-float class from globals.css */}
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={`circle-${i}`}
            className="absolute w-2 h-2 border border-purple-300/20 rounded-full animate-float"
            style={{
              left: `${70 + i * 8}%`,
              top: `${15 + i * 20}%`,
              animationDelay: `${i * 1}s`,
              animationDuration: `${6 + i * 2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}