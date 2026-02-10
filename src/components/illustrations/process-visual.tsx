"use client";

interface ProcessVisualProps {
  step: "upload" | "ai" | "cut";
}

export function ProcessVisual({ step }: ProcessVisualProps) {
  const visuals = {
    upload: (
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <linearGradient id="upload-glow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF4D00" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#FF4D00" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Background circle */}
        <circle cx="100" cy="100" r="80" fill="url(#upload-glow)" />

        {/* Phone outline */}
        <rect x="60" y="40" width="80" height="140" rx="12" stroke="#FF4D00" strokeWidth="2" fill="none" />

        {/* Screen */}
        <rect x="68" y="55" width="64" height="100" rx="4" stroke="#FF4D00" strokeWidth="1" fill="none" opacity="0.5" />

        {/* Camera icon on screen */}
        <circle cx="100" cy="95" r="20" stroke="#FF4D00" strokeWidth="2" fill="none" />
        <circle cx="100" cy="95" r="8" stroke="#FF4D00" strokeWidth="1.5" fill="none" />

        {/* Flash */}
        <path d="M105 70 L100 80 L108 78 L103 90" stroke="#FF4D00" strokeWidth="1.5" fill="none" />

        {/* Photo being taken effect */}
        <rect x="72" y="58" width="56" height="75" rx="2" stroke="#FF4D00" strokeWidth="1" strokeDasharray="4 2" fill="none" opacity="0.4" />

        {/* Upload arrow */}
        <path d="M100 170 L100 155 M90 162 L100 152 L110 162" stroke="#FF4D00" strokeWidth="2.5" fill="none" />

        {/* Home button */}
        <circle cx="100" cy="165" r="5" stroke="#FF4D00" strokeWidth="1" fill="none" opacity="0.5" />
      </svg>
    ),

    ai: (
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <linearGradient id="ai-glow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF4D00" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#FF4D00" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Background */}
        <circle cx="100" cy="100" r="80" fill="url(#ai-glow)" />

        {/* Brain/chip shape */}
        <rect x="55" y="55" width="90" height="90" rx="8" stroke="#FF4D00" strokeWidth="2" fill="none" />

        {/* Circuit pattern */}
        <circle cx="100" cy="100" r="25" stroke="#FF4D00" strokeWidth="1.5" fill="none" />
        <circle cx="100" cy="100" r="10" stroke="#FF4D00" strokeWidth="2" fill="none" />

        {/* Connection lines */}
        <line x1="75" y1="100" x2="55" y2="100" stroke="#FF4D00" strokeWidth="1.5" />
        <line x1="125" y1="100" x2="145" y2="100" stroke="#FF4D00" strokeWidth="1.5" />
        <line x1="100" y1="75" x2="100" y2="55" stroke="#FF4D00" strokeWidth="1.5" />
        <line x1="100" y1="125" x2="100" y2="145" stroke="#FF4D00" strokeWidth="1.5" />

        {/* Diagonal connections */}
        <line x1="82" y1="82" x2="65" y2="65" stroke="#FF4D00" strokeWidth="1" opacity="0.7" />
        <line x1="118" y1="82" x2="135" y2="65" stroke="#FF4D00" strokeWidth="1" opacity="0.7" />
        <line x1="82" y1="118" x2="65" y2="135" stroke="#FF4D00" strokeWidth="1" opacity="0.7" />
        <line x1="118" y1="118" x2="135" y2="135" stroke="#FF4D00" strokeWidth="1" opacity="0.7" />

        {/* Corner nodes */}
        <circle cx="65" cy="65" r="4" stroke="#FF4D00" strokeWidth="1.5" fill="none" />
        <circle cx="135" cy="65" r="4" stroke="#FF4D00" strokeWidth="1.5" fill="none" />
        <circle cx="65" cy="135" r="4" stroke="#FF4D00" strokeWidth="1.5" fill="none" />
        <circle cx="135" cy="135" r="4" stroke="#FF4D00" strokeWidth="1.5" fill="none" />

        {/* Pin connections on edges */}
        <g opacity="0.6">
          <rect x="70" y="50" width="8" height="5" fill="#FF4D00" />
          <rect x="90" y="50" width="8" height="5" fill="#FF4D00" />
          <rect x="110" y="50" width="8" height="5" fill="#FF4D00" />
          <rect x="70" y="145" width="8" height="5" fill="#FF4D00" />
          <rect x="90" y="145" width="8" height="5" fill="#FF4D00" />
          <rect x="110" y="145" width="8" height="5" fill="#FF4D00" />
        </g>

        {/* Scanning animation indicator */}
        <line x1="55" y1="90" x2="145" y2="90" stroke="#FF4D00" strokeWidth="1" strokeDasharray="2 4" opacity="0.5" />
        <line x1="55" y1="110" x2="145" y2="110" stroke="#FF4D00" strokeWidth="1" strokeDasharray="2 4" opacity="0.5" />
      </svg>
    ),

    cut: (
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <linearGradient id="cut-glow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF4D00" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#FF4D00" stopOpacity="0" />
          </linearGradient>
          <filter id="laser-glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background */}
        <circle cx="100" cy="100" r="80" fill="url(#cut-glow)" />

        {/* CNC machine frame */}
        <rect x="40" y="50" width="120" height="100" rx="4" stroke="#FF4D00" strokeWidth="2" fill="none" />

        {/* Foam block */}
        <rect x="55" y="70" width="90" height="60" rx="2" stroke="#FF4D00" strokeWidth="1.5" fill="none" opacity="0.6" />

        {/* Cut shape in foam */}
        <rect x="70" y="85" width="40" height="30" rx="4" stroke="#FF4D00" strokeWidth="2" fill="none" />
        <circle cx="130" cy="100" r="12" stroke="#FF4D00" strokeWidth="2" fill="none" />

        {/* CNC head */}
        <rect x="85" y="55" width="30" height="15" rx="2" stroke="#FF4D00" strokeWidth="2" fill="none" />

        {/* Laser beam */}
        <line x1="100" y1="70" x2="100" y2="85" stroke="#FF4D00" strokeWidth="3" filter="url(#laser-glow)" />
        <circle cx="100" cy="85" r="3" fill="#FF4D00" filter="url(#laser-glow)" />

        {/* Motion rails */}
        <line x1="45" y1="55" x2="155" y2="55" stroke="#FF4D00" strokeWidth="1" opacity="0.4" />
        <line x1="45" y1="145" x2="155" y2="145" stroke="#FF4D00" strokeWidth="1" opacity="0.4" />

        {/* Control panel */}
        <rect x="50" y="155" width="40" height="20" rx="2" stroke="#FF4D00" strokeWidth="1" fill="none" opacity="0.5" />
        <circle cx="60" cy="165" r="3" fill="#FF4D00" opacity="0.6" />
        <rect x="70" y="162" width="15" height="6" rx="1" stroke="#FF4D00" strokeWidth="0.5" fill="none" opacity="0.4" />

        {/* Cut path indicator */}
        <path d="M70 85 L70 115 L110 115 L110 85 Z" stroke="#FF4D00" strokeWidth="0.5" strokeDasharray="3 3" fill="none" opacity="0.3" />
      </svg>
    ),
  };

  return visuals[step] || null;
}
