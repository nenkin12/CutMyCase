"use client";

import { useEffect, useState } from "react";

export function HeroVisual() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative w-full h-full">
      <svg
        viewBox="0 0 800 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Background grid pattern */}
        <defs>
          <pattern
            id="grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="rgba(255,77,0,0.1)"
              strokeWidth="0.5"
            />
          </pattern>
          <linearGradient id="foamGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1a1a1a" />
            <stop offset="100%" stopColor="#2a2a2a" />
          </linearGradient>
          <linearGradient id="cutGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF4D00" />
            <stop offset="100%" stopColor="#FF6B2B" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width="800" height="600" fill="url(#grid)" />

        {/* Main foam block - Pelican-style case */}
        <g className={mounted ? "animate-fade-in" : "opacity-0"}>
          {/* Case exterior */}
          <rect
            x="100"
            y="100"
            width="600"
            height="400"
            rx="8"
            fill="url(#foamGradient)"
            stroke="#FF4D00"
            strokeWidth="2"
          />

          {/* Foam interior */}
          <rect
            x="120"
            y="120"
            width="560"
            height="360"
            rx="4"
            fill="#0d0d0d"
          />

          {/* Cut out shapes - Camera equipment */}
          {/* Camera body */}
          <rect
            x="150"
            y="180"
            width="180"
            height="120"
            rx="8"
            fill="url(#foamGradient)"
            stroke="url(#cutGradient)"
            strokeWidth="2"
            strokeDasharray={mounted ? "0" : "400"}
            className="transition-all duration-1000"
            filter="url(#glow)"
          />

          {/* Lens 1 */}
          <circle
            cx="420"
            cy="240"
            r="60"
            fill="url(#foamGradient)"
            stroke="url(#cutGradient)"
            strokeWidth="2"
            filter="url(#glow)"
          />

          {/* Lens 2 */}
          <circle
            cx="560"
            cy="240"
            r="45"
            fill="url(#foamGradient)"
            stroke="url(#cutGradient)"
            strokeWidth="2"
            filter="url(#glow)"
          />

          {/* Accessories tray */}
          <rect
            x="150"
            y="330"
            width="200"
            height="80"
            rx="4"
            fill="url(#foamGradient)"
            stroke="url(#cutGradient)"
            strokeWidth="2"
            filter="url(#glow)"
          />

          {/* Battery slots */}
          <rect
            x="380"
            y="340"
            width="60"
            height="60"
            rx="4"
            fill="url(#foamGradient)"
            stroke="url(#cutGradient)"
            strokeWidth="2"
            filter="url(#glow)"
          />
          <rect
            x="460"
            y="340"
            width="60"
            height="60"
            rx="4"
            fill="url(#foamGradient)"
            stroke="url(#cutGradient)"
            strokeWidth="2"
            filter="url(#glow)"
          />
          <rect
            x="540"
            y="340"
            width="60"
            height="60"
            rx="4"
            fill="url(#foamGradient)"
            stroke="url(#cutGradient)"
            strokeWidth="2"
            filter="url(#glow)"
          />
        </g>

        {/* Animated cutting laser line */}
        <g className={mounted ? "animate-pulse" : ""}>
          <line
            x1="100"
            y1="150"
            x2="700"
            y2="150"
            stroke="url(#cutGradient)"
            strokeWidth="1"
            opacity="0.5"
          />
          <circle cx="400" cy="150" r="4" fill="#FF4D00" filter="url(#glow)" />
        </g>

        {/* Measurement lines */}
        <g opacity="0.4">
          {/* Horizontal */}
          <line
            x1="150"
            y1="510"
            x2="330"
            y2="510"
            stroke="#FF4D00"
            strokeWidth="1"
          />
          <line
            x1="150"
            y1="505"
            x2="150"
            y2="515"
            stroke="#FF4D00"
            strokeWidth="1"
          />
          <line
            x1="330"
            y1="505"
            x2="330"
            y2="515"
            stroke="#FF4D00"
            strokeWidth="1"
          />
          <text x="220" y="530" fill="#FF4D00" fontSize="12" textAnchor="middle">
            180mm
          </text>

          {/* Vertical */}
          <line
            x1="80"
            y1="180"
            x2="80"
            y2="300"
            stroke="#FF4D00"
            strokeWidth="1"
          />
          <line
            x1="75"
            y1="180"
            x2="85"
            y2="180"
            stroke="#FF4D00"
            strokeWidth="1"
          />
          <line
            x1="75"
            y1="300"
            x2="85"
            y2="300"
            stroke="#FF4D00"
            strokeWidth="1"
          />
          <text
            x="60"
            y="245"
            fill="#FF4D00"
            fontSize="12"
            textAnchor="middle"
            transform="rotate(-90, 60, 245)"
          >
            120mm
          </text>
        </g>

        {/* Corner decorations */}
        <path
          d="M 100 100 L 100 130 M 100 100 L 130 100"
          stroke="#FF4D00"
          strokeWidth="3"
        />
        <path
          d="M 700 100 L 700 130 M 700 100 L 670 100"
          stroke="#FF4D00"
          strokeWidth="3"
        />
        <path
          d="M 100 500 L 100 470 M 100 500 L 130 500"
          stroke="#FF4D00"
          strokeWidth="3"
        />
        <path
          d="M 700 500 L 700 470 M 700 500 L 670 500"
          stroke="#FF4D00"
          strokeWidth="3"
        />
      </svg>
    </div>
  );
}
