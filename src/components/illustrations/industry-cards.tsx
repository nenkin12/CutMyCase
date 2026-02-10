"use client";

interface IndustryCardProps {
  type: "firearms" | "camera" | "drone" | "tools" | "medical" | "audio";
}

export function IndustryIllustration({ type }: IndustryCardProps) {
  const illustrations = {
    firearms: (
      <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <linearGradient id="firearms-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1a1a1a" />
            <stop offset="100%" stopColor="#0d0d0d" />
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill="url(#firearms-grad)" />

        {/* Pistol outline */}
        <g stroke="#FF4D00" strokeWidth="2" fill="none" opacity="0.8">
          <path d="M80 120 L200 120 L200 140 L220 140 L220 180 L200 180 L200 200 L180 200 L180 180 L100 180 L100 200 L80 200 L80 180 L60 180 L60 140 L80 140 Z" />
          {/* Trigger guard */}
          <path d="M140 180 L140 220 Q140 240 160 240 L180 240 Q200 240 200 220 L200 180" />
          {/* Grip texture */}
          <line x1="100" y1="200" x2="100" y2="240" />
          <line x1="110" y1="200" x2="110" y2="240" />
          <line x1="120" y1="200" x2="120" y2="240" />
        </g>

        {/* Magazine */}
        <rect x="250" y="140" width="40" height="80" rx="4" stroke="#FF4D00" strokeWidth="2" fill="none" opacity="0.6" />
        <line x1="255" y1="160" x2="285" y2="160" stroke="#FF4D00" strokeWidth="1" opacity="0.4" />
        <line x1="255" y1="180" x2="285" y2="180" stroke="#FF4D00" strokeWidth="1" opacity="0.4" />
        <line x1="255" y1="200" x2="285" y2="200" stroke="#FF4D00" strokeWidth="1" opacity="0.4" />

        {/* Optic */}
        <rect x="310" y="100" width="60" height="40" rx="8" stroke="#FF4D00" strokeWidth="2" fill="none" opacity="0.6" />
        <circle cx="340" cy="120" r="12" stroke="#FF4D00" strokeWidth="1.5" fill="none" opacity="0.4" />

        {/* Foam cutout indicator */}
        <rect x="60" y="100" width="180" height="180" rx="4" stroke="#FF4D00" strokeWidth="1" strokeDasharray="4 4" fill="none" opacity="0.3" />
      </svg>
    ),

    camera: (
      <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <linearGradient id="camera-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1a1a1a" />
            <stop offset="100%" stopColor="#0d0d0d" />
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill="url(#camera-grad)" />

        {/* Camera body */}
        <rect x="50" y="100" width="140" height="100" rx="8" stroke="#FF4D00" strokeWidth="2" fill="none" opacity="0.8" />
        {/* Viewfinder */}
        <rect x="150" y="80" width="30" height="25" rx="2" stroke="#FF4D00" strokeWidth="1.5" fill="none" opacity="0.6" />
        {/* Lens mount */}
        <circle cx="100" cy="150" r="35" stroke="#FF4D00" strokeWidth="2" fill="none" opacity="0.7" />
        <circle cx="100" cy="150" r="25" stroke="#FF4D00" strokeWidth="1" fill="none" opacity="0.4" />
        {/* Controls */}
        <circle cx="160" cy="115" r="8" stroke="#FF4D00" strokeWidth="1.5" fill="none" opacity="0.5" />
        <rect x="55" y="105" width="20" height="8" rx="2" stroke="#FF4D00" strokeWidth="1" fill="none" opacity="0.4" />

        {/* Lens */}
        <ellipse cx="280" cy="150" rx="45" ry="55" stroke="#FF4D00" strokeWidth="2" fill="none" opacity="0.8" />
        <ellipse cx="280" cy="150" rx="35" ry="45" stroke="#FF4D00" strokeWidth="1.5" fill="none" opacity="0.5" />
        <ellipse cx="280" cy="150" rx="20" ry="25" stroke="#FF4D00" strokeWidth="1" fill="none" opacity="0.3" />
        {/* Focus ring */}
        <ellipse cx="280" cy="120" rx="40" ry="8" stroke="#FF4D00" strokeWidth="1" fill="none" opacity="0.4" />

        {/* Memory cards */}
        <rect x="340" y="120" width="30" height="40" rx="2" stroke="#FF4D00" strokeWidth="1.5" fill="none" opacity="0.6" />
        <rect x="340" y="180" width="30" height="40" rx="2" stroke="#FF4D00" strokeWidth="1.5" fill="none" opacity="0.6" />

        {/* Foam cutout */}
        <rect x="40" y="70" width="170" height="150" rx="4" stroke="#FF4D00" strokeWidth="1" strokeDasharray="4 4" fill="none" opacity="0.3" />
      </svg>
    ),

    drone: (
      <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <linearGradient id="drone-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1a1a1a" />
            <stop offset="100%" stopColor="#0d0d0d" />
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill="url(#drone-grad)" />

        {/* Drone body */}
        <ellipse cx="200" cy="150" rx="60" ry="25" stroke="#FF4D00" strokeWidth="2" fill="none" opacity="0.8" />

        {/* Arms */}
        <line x1="160" y1="135" x2="100" y2="90" stroke="#FF4D00" strokeWidth="2" opacity="0.7" />
        <line x1="240" y1="135" x2="300" y2="90" stroke="#FF4D00" strokeWidth="2" opacity="0.7" />
        <line x1="160" y1="165" x2="100" y2="210" stroke="#FF4D00" strokeWidth="2" opacity="0.7" />
        <line x1="240" y1="165" x2="300" y2="210" stroke="#FF4D00" strokeWidth="2" opacity="0.7" />

        {/* Propellers */}
        <circle cx="100" cy="90" r="35" stroke="#FF4D00" strokeWidth="1.5" fill="none" opacity="0.5" />
        <circle cx="300" cy="90" r="35" stroke="#FF4D00" strokeWidth="1.5" fill="none" opacity="0.5" />
        <circle cx="100" cy="210" r="35" stroke="#FF4D00" strokeWidth="1.5" fill="none" opacity="0.5" />
        <circle cx="300" cy="210" r="35" stroke="#FF4D00" strokeWidth="1.5" fill="none" opacity="0.5" />

        {/* Motors */}
        <circle cx="100" cy="90" r="8" stroke="#FF4D00" strokeWidth="2" fill="none" opacity="0.8" />
        <circle cx="300" cy="90" r="8" stroke="#FF4D00" strokeWidth="2" fill="none" opacity="0.8" />
        <circle cx="100" cy="210" r="8" stroke="#FF4D00" strokeWidth="2" fill="none" opacity="0.8" />
        <circle cx="300" cy="210" r="8" stroke="#FF4D00" strokeWidth="2" fill="none" opacity="0.8" />

        {/* Camera gimbal */}
        <rect x="185" y="165" width="30" height="20" rx="4" stroke="#FF4D00" strokeWidth="1.5" fill="none" opacity="0.6" />
        <circle cx="200" cy="175" r="6" stroke="#FF4D00" strokeWidth="1" fill="none" opacity="0.4" />

        {/* Foam cutout */}
        <path d="M60 60 L140 60 L200 120 L260 60 L340 60 L340 90 L340 240 L260 240 L200 180 L140 240 L60 240 Z"
              stroke="#FF4D00" strokeWidth="1" strokeDasharray="4 4" fill="none" opacity="0.3" />
      </svg>
    ),

    tools: (
      <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <linearGradient id="tools-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1a1a1a" />
            <stop offset="100%" stopColor="#0d0d0d" />
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill="url(#tools-grad)" />

        {/* Wrench */}
        <g stroke="#FF4D00" strokeWidth="2" fill="none" opacity="0.8">
          <path d="M60 80 L60 100 L80 120 L80 200 L60 200 L60 220 L100 220 L100 200 L120 200 L120 120 L100 100 L100 80 Z" />
        </g>

        {/* Screwdriver */}
        <g stroke="#FF4D00" strokeWidth="2" fill="none" opacity="0.7">
          <rect x="150" y="60" width="20" height="180" rx="2" />
          <path d="M155 240 L165 240 L160 270 Z" />
        </g>

        {/* Pliers */}
        <g stroke="#FF4D00" strokeWidth="2" fill="none" opacity="0.8">
          <ellipse cx="240" cy="100" rx="25" ry="40" />
          <rect x="220" y="140" width="15" height="100" rx="4" />
          <rect x="245" y="140" width="15" height="100" rx="4" />
        </g>

        {/* Multimeter */}
        <g stroke="#FF4D00" strokeWidth="2" fill="none" opacity="0.7">
          <rect x="300" y="80" width="70" height="120" rx="8" />
          <rect x="315" y="100" width="40" height="30" rx="2" strokeWidth="1.5" opacity="0.5" />
          <circle cx="320" cy="160" r="8" strokeWidth="1.5" opacity="0.5" />
          <circle cx="350" cy="160" r="8" strokeWidth="1.5" opacity="0.5" />
        </g>

        {/* Foam cutouts */}
        <rect x="50" y="70" width="80" height="170" rx="4" stroke="#FF4D00" strokeWidth="1" strokeDasharray="4 4" fill="none" opacity="0.3" />
        <rect x="140" y="50" width="40" height="230" rx="4" stroke="#FF4D00" strokeWidth="1" strokeDasharray="4 4" fill="none" opacity="0.3" />
      </svg>
    ),

    medical: (
      <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <linearGradient id="medical-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1a1a1a" />
            <stop offset="100%" stopColor="#0d0d0d" />
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill="url(#medical-grad)" />

        {/* Stethoscope */}
        <g stroke="#FF4D00" strokeWidth="2" fill="none" opacity="0.8">
          <circle cx="100" cy="200" r="30" />
          <path d="M100 170 Q100 100 150 80" />
          <path d="M100 170 Q100 100 50 80" />
          <ellipse cx="150" cy="70" rx="8" ry="12" />
          <ellipse cx="50" cy="70" rx="8" ry="12" />
        </g>

        {/* Syringe */}
        <g stroke="#FF4D00" strokeWidth="2" fill="none" opacity="0.7">
          <rect x="200" y="80" width="30" height="120" rx="2" />
          <rect x="195" y="80" width="40" height="15" rx="2" />
          <line x1="215" y1="200" x2="215" y2="240" />
          <path d="M210 240 L220 240 L215 260 Z" />
        </g>

        {/* Vials */}
        <g stroke="#FF4D00" strokeWidth="1.5" fill="none" opacity="0.6">
          <rect x="280" y="100" width="25" height="60" rx="4" />
          <rect x="315" y="100" width="25" height="60" rx="4" />
          <rect x="350" y="100" width="25" height="60" rx="4" />
          <rect x="283" y="90" width="19" height="15" rx="2" />
          <rect x="318" y="90" width="19" height="15" rx="2" />
          <rect x="353" y="90" width="19" height="15" rx="2" />
        </g>

        {/* First aid cross */}
        <g stroke="#FF4D00" strokeWidth="2" fill="none" opacity="0.5">
          <rect x="290" y="190" width="80" height="80" rx="8" />
          <path d="M330 205 L330 255 M305 230 L355 230" strokeWidth="3" />
        </g>

        {/* Foam cutout */}
        <circle cx="100" cy="180" r="60" stroke="#FF4D00" strokeWidth="1" strokeDasharray="4 4" fill="none" opacity="0.3" />
      </svg>
    ),

    audio: (
      <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <linearGradient id="audio-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1a1a1a" />
            <stop offset="100%" stopColor="#0d0d0d" />
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill="url(#audio-grad)" />

        {/* Microphone */}
        <g stroke="#FF4D00" strokeWidth="2" fill="none" opacity="0.8">
          <ellipse cx="100" cy="100" rx="25" ry="50" />
          <path d="M60 100 Q60 180 100 200" />
          <path d="M140 100 Q140 180 100 200" />
          <line x1="100" y1="200" x2="100" y2="250" />
          <ellipse cx="100" cy="260" rx="30" ry="8" />
          {/* Mesh pattern */}
          <line x1="80" y1="70" x2="120" y2="70" opacity="0.4" />
          <line x1="80" y1="90" x2="120" y2="90" opacity="0.4" />
          <line x1="80" y1="110" x2="120" y2="110" opacity="0.4" />
        </g>

        {/* Headphones */}
        <g stroke="#FF4D00" strokeWidth="2" fill="none" opacity="0.7">
          <path d="M200 120 Q200 60 260 60 Q320 60 320 120" />
          <ellipse cx="200" cy="140" rx="20" ry="35" />
          <ellipse cx="320" cy="140" rx="20" ry="35" />
          <ellipse cx="200" cy="140" rx="12" ry="25" strokeWidth="1" opacity="0.5" />
          <ellipse cx="320" cy="140" rx="12" ry="25" strokeWidth="1" opacity="0.5" />
        </g>

        {/* Audio interface / Mixer */}
        <g stroke="#FF4D00" strokeWidth="2" fill="none" opacity="0.7">
          <rect x="180" y="200" width="160" height="70" rx="8" />
          {/* Knobs */}
          <circle cx="210" cy="235" r="12" strokeWidth="1.5" opacity="0.6" />
          <circle cx="260" cy="235" r="12" strokeWidth="1.5" opacity="0.6" />
          <circle cx="310" cy="235" r="12" strokeWidth="1.5" opacity="0.6" />
          {/* LEDs */}
          <rect x="200" y="210" width="4" height="8" rx="1" opacity="0.5" />
          <rect x="250" y="210" width="4" height="8" rx="1" opacity="0.5" />
          <rect x="300" y="210" width="4" height="8" rx="1" opacity="0.5" />
        </g>

        {/* Foam cutout */}
        <ellipse cx="100" cy="150" rx="50" ry="130" stroke="#FF4D00" strokeWidth="1" strokeDasharray="4 4" fill="none" opacity="0.3" />
      </svg>
    ),
  };

  return illustrations[type] || null;
}
