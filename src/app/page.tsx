import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check, Star, Phone, Play, Shield, Target, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/layout/user-menu";

// Hero illustration - tactical case with firearm cutouts (based on reference image)
function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 800 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <defs>
        <linearGradient id="foamGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2d2d2d" />
          <stop offset="100%" stopColor="#1a1a1a" />
        </linearGradient>
        <linearGradient id="cutGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF4D00" />
          <stop offset="100%" stopColor="#FF6B2B" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="innerShadow">
          <feOffset dx="0" dy="2" />
          <feGaussianBlur stdDeviation="3" result="offset-blur" />
          <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse" />
          <feFlood floodColor="black" floodOpacity="0.5" result="color" />
          <feComposite operator="in" in="color" in2="inverse" result="shadow" />
          <feComposite operator="over" in="shadow" in2="SourceGraphic" />
        </filter>
      </defs>

      {/* Grid pattern */}
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,77,0,0.06)" strokeWidth="0.5" />
      </pattern>
      <rect width="800" height="600" fill="url(#grid)" />

      {/* Case outline - Pelican style */}
      <rect x="80" y="80" width="640" height="440" rx="12" fill="#1a1a1a" stroke="#333" strokeWidth="3" />

      {/* Case lip/edge */}
      <rect x="90" y="90" width="620" height="420" rx="8" fill="url(#foamGrad)" />

      {/* Foam interior - charcoal foam texture */}
      <rect x="100" y="100" width="600" height="400" rx="4" fill="#0d0d0d" />

      {/* Ear Protection Cutout (left side) - large rounded rectangle */}
      <rect x="120" y="140" width="180" height="160" rx="20" fill="url(#foamGrad)" stroke="url(#cutGrad)" strokeWidth="2" filter="url(#glow)" />
      {/* Red liner inside ear protection area */}
      <rect x="130" y="150" width="160" height="140" rx="15" fill="none" stroke="#8B0000" strokeWidth="1" opacity="0.5" />

      {/* Magazine slots - 2 rows of 5 */}
      <g>
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={`mag-top-${i}`} x={320 + i * 45} y={140} width="35" height="70" rx="4" fill="url(#foamGrad)" stroke="url(#cutGrad)" strokeWidth="1.5" filter="url(#glow)" />
        ))}
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={`mag-bot-${i}`} x={320 + i * 45} y={220} width="35" height="70" rx="4" fill="url(#foamGrad)" stroke="url(#cutGrad)" strokeWidth="1.5" filter="url(#glow)" />
        ))}
      </g>

      {/* Pistol cutout (right side) - with optic mount */}
      <g filter="url(#glow)">
        {/* Main pistol body */}
        <path
          d="M580 320 L680 320 L680 360 L700 360 L700 420 L680 420 L680 440 L620 440 L620 420 L580 420 L580 460 L540 460 L540 420 L520 420 L520 360 L540 360 L540 340 L580 340 Z"
          fill="url(#foamGrad)"
          stroke="url(#cutGrad)"
          strokeWidth="2"
        />
        {/* Optic mount cutout */}
        <rect x="600" y="300" width="60" height="25" rx="4" fill="url(#foamGrad)" stroke="url(#cutGrad)" strokeWidth="1.5" />
      </g>

      {/* Suppressor cutout (bottom right) */}
      <rect x="520" y="480" width="160" height="35" rx="17" fill="url(#foamGrad)" stroke="url(#cutGrad)" strokeWidth="2" filter="url(#glow)" />

      {/* Accessory slot (bottom left) */}
      <rect x="120" y="340" width="160" height="100" rx="8" fill="url(#foamGrad)" stroke="url(#cutGrad)" strokeWidth="2" filter="url(#glow)" />

      {/* Small tool slots */}
      <rect x="300" y="340" width="80" height="50" rx="4" fill="url(#foamGrad)" stroke="url(#cutGrad)" strokeWidth="1.5" filter="url(#glow)" />
      <rect x="300" y="400" width="80" height="50" rx="4" fill="url(#foamGrad)" stroke="url(#cutGrad)" strokeWidth="1.5" filter="url(#glow)" />

      {/* Corner marks - targeting style */}
      <g stroke="#FF4D00" strokeWidth="2" opacity="0.8">
        <path d="M 80 80 L 80 120 M 80 80 L 120 80" />
        <path d="M 720 80 L 720 120 M 720 80 L 680 80" />
        <path d="M 80 520 L 80 480 M 80 520 L 120 520" />
        <path d="M 720 520 L 720 480 M 720 520 L 680 520" />
      </g>

      {/* Measurement indicator */}
      <g opacity="0.6">
        <line x1="120" y1="550" x2="300" y2="550" stroke="#FF4D00" strokeWidth="1" />
        <line x1="120" y1="545" x2="120" y2="555" stroke="#FF4D00" strokeWidth="1" />
        <line x1="300" y1="545" x2="300" y2="555" stroke="#FF4D00" strokeWidth="1" />
        <text x="210" y="570" fill="#FF4D00" fontSize="11" textAnchor="middle" fontFamily="monospace">180mm</text>
      </g>

      {/* Laser cutting indicator */}
      <line x1="80" y1="130" x2="720" y2="130" stroke="url(#cutGrad)" strokeWidth="1" opacity="0.3" strokeDasharray="4 4" />
      <circle cx="400" cy="130" r="4" fill="#FF4D00" filter="url(#glow)" />
    </svg>
  );
}

// Process step icons
function UploadIcon() {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="100" cy="100" r="80" fill="rgba(255,77,0,0.1)" />
      <rect x="60" y="40" width="80" height="140" rx="12" stroke="#FF4D00" strokeWidth="2" fill="none" />
      <rect x="68" y="55" width="64" height="100" rx="4" stroke="#FF4D00" strokeWidth="1" fill="none" opacity="0.5" />
      <circle cx="100" cy="95" r="20" stroke="#FF4D00" strokeWidth="2" fill="none" />
      <circle cx="100" cy="95" r="8" stroke="#FF4D00" strokeWidth="1.5" fill="none" />
      <path d="M100 170 L100 155 M90 162 L100 152 L110 162" stroke="#FF4D00" strokeWidth="2.5" fill="none" />
    </svg>
  );
}

function AIIcon() {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="100" cy="100" r="80" fill="rgba(255,77,0,0.1)" />
      <rect x="55" y="55" width="90" height="90" rx="8" stroke="#FF4D00" strokeWidth="2" fill="none" />
      <circle cx="100" cy="100" r="25" stroke="#FF4D00" strokeWidth="1.5" fill="none" />
      <circle cx="100" cy="100" r="10" stroke="#FF4D00" strokeWidth="2" fill="none" />
      <line x1="75" y1="100" x2="55" y2="100" stroke="#FF4D00" strokeWidth="1.5" />
      <line x1="125" y1="100" x2="145" y2="100" stroke="#FF4D00" strokeWidth="1.5" />
      <line x1="100" y1="75" x2="100" y2="55" stroke="#FF4D00" strokeWidth="1.5" />
      <line x1="100" y1="125" x2="100" y2="145" stroke="#FF4D00" strokeWidth="1.5" />
      <circle cx="65" cy="65" r="4" stroke="#FF4D00" strokeWidth="1.5" fill="none" />
      <circle cx="135" cy="65" r="4" stroke="#FF4D00" strokeWidth="1.5" fill="none" />
      <circle cx="65" cy="135" r="4" stroke="#FF4D00" strokeWidth="1.5" fill="none" />
      <circle cx="135" cy="135" r="4" stroke="#FF4D00" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

function CNCIcon() {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <filter id="laserGlow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle cx="100" cy="100" r="80" fill="rgba(255,77,0,0.1)" />
      <rect x="40" y="50" width="120" height="100" rx="4" stroke="#FF4D00" strokeWidth="2" fill="none" />
      <rect x="55" y="70" width="90" height="60" rx="2" stroke="#FF4D00" strokeWidth="1.5" fill="none" opacity="0.6" />
      <rect x="70" y="85" width="40" height="30" rx="4" stroke="#FF4D00" strokeWidth="2" fill="none" />
      <circle cx="130" cy="100" r="12" stroke="#FF4D00" strokeWidth="2" fill="none" />
      <rect x="85" y="55" width="30" height="15" rx="2" stroke="#FF4D00" strokeWidth="2" fill="none" />
      <line x1="100" y1="70" x2="100" y2="85" stroke="#FF4D00" strokeWidth="3" filter="url(#laserGlow)" />
      <circle cx="100" cy="85" r="3" fill="#FF4D00" filter="url(#laserGlow)" />
    </svg>
  );
}

// Industry illustration: Photography case with camera body and lenses
function PhotographyIllustration() {
  return (
    <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="photoFoam" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2d2d2d" />
          <stop offset="100%" stopColor="#1a1a1a" />
        </linearGradient>
        <linearGradient id="photoCut" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF4D00" />
          <stop offset="100%" stopColor="#FF6B2B" />
        </linearGradient>
        <filter id="photoGlow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Case background */}
      <rect x="20" y="20" width="360" height="260" rx="8" fill="#0d0d0d" stroke="#333" strokeWidth="2" />

      {/* Camera body cutout */}
      <rect x="40" y="50" width="140" height="100" rx="10" fill="url(#photoFoam)" stroke="url(#photoCut)" strokeWidth="2" filter="url(#photoGlow)" />
      {/* Viewfinder bump */}
      <rect x="100" y="35" width="50" height="25" rx="4" fill="url(#photoFoam)" stroke="url(#photoCut)" strokeWidth="2" filter="url(#photoGlow)" />

      {/* Large lens cutout */}
      <circle cx="260" cy="100" r="55" fill="url(#photoFoam)" stroke="url(#photoCut)" strokeWidth="2" filter="url(#photoGlow)" />
      <circle cx="260" cy="100" r="35" stroke="url(#photoCut)" strokeWidth="1" opacity="0.5" fill="none" />

      {/* Medium lens cutout */}
      <circle cx="340" cy="100" r="35" fill="url(#photoFoam)" stroke="url(#photoCut)" strokeWidth="2" filter="url(#photoGlow)" />
      <circle cx="340" cy="100" r="20" stroke="url(#photoCut)" strokeWidth="1" opacity="0.5" fill="none" />

      {/* Flash unit cutout */}
      <rect x="40" y="170" width="80" height="90" rx="6" fill="url(#photoFoam)" stroke="url(#photoCut)" strokeWidth="2" filter="url(#photoGlow)" />
      {/* Flash head */}
      <rect x="50" y="175" width="60" height="40" rx="4" stroke="url(#photoCut)" strokeWidth="1" opacity="0.5" fill="none" />

      {/* Battery grip */}
      <rect x="140" y="170" width="50" height="90" rx="6" fill="url(#photoFoam)" stroke="url(#photoCut)" strokeWidth="2" filter="url(#photoGlow)" />

      {/* Memory card slots */}
      <rect x="210" y="180" width="30" height="40" rx="3" fill="url(#photoFoam)" stroke="url(#photoCut)" strokeWidth="1.5" filter="url(#photoGlow)" />
      <rect x="250" y="180" width="30" height="40" rx="3" fill="url(#photoFoam)" stroke="url(#photoCut)" strokeWidth="1.5" filter="url(#photoGlow)" />
      <rect x="290" y="180" width="30" height="40" rx="3" fill="url(#photoFoam)" stroke="url(#photoCut)" strokeWidth="1.5" filter="url(#photoGlow)" />

      {/* Small accessory slots */}
      <rect x="210" y="235" width="110" height="30" rx="4" fill="url(#photoFoam)" stroke="url(#photoCut)" strokeWidth="1.5" filter="url(#photoGlow)" />
    </svg>
  );
}

// Industry illustration: Drone case with quadcopter and accessories
function DroneIllustration() {
  return (
    <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="droneFoam" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2d2d2d" />
          <stop offset="100%" stopColor="#1a1a1a" />
        </linearGradient>
        <linearGradient id="droneCut" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF4D00" />
          <stop offset="100%" stopColor="#FF6B2B" />
        </linearGradient>
        <filter id="droneGlow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Case background */}
      <rect x="20" y="20" width="360" height="260" rx="8" fill="#0d0d0d" stroke="#333" strokeWidth="2" />

      {/* Drone body center */}
      <rect x="130" y="80" width="80" height="50" rx="8" fill="url(#droneFoam)" stroke="url(#droneCut)" strokeWidth="2" filter="url(#droneGlow)" />

      {/* Drone arms and motor cutouts */}
      {/* Top left arm */}
      <line x1="130" y1="90" x2="70" y2="50" stroke="url(#droneCut)" strokeWidth="8" strokeLinecap="round" filter="url(#droneGlow)" />
      <circle cx="60" cy="45" r="25" fill="url(#droneFoam)" stroke="url(#droneCut)" strokeWidth="2" filter="url(#droneGlow)" />

      {/* Top right arm */}
      <line x1="210" y1="90" x2="270" y2="50" stroke="url(#droneCut)" strokeWidth="8" strokeLinecap="round" filter="url(#droneGlow)" />
      <circle cx="280" cy="45" r="25" fill="url(#droneFoam)" stroke="url(#droneCut)" strokeWidth="2" filter="url(#droneGlow)" />

      {/* Bottom left arm */}
      <line x1="130" y1="120" x2="70" y2="160" stroke="url(#droneCut)" strokeWidth="8" strokeLinecap="round" filter="url(#droneGlow)" />
      <circle cx="60" cy="165" r="25" fill="url(#droneFoam)" stroke="url(#droneCut)" strokeWidth="2" filter="url(#droneGlow)" />

      {/* Bottom right arm */}
      <line x1="210" y1="120" x2="270" y2="160" stroke="url(#droneCut)" strokeWidth="8" strokeLinecap="round" filter="url(#droneGlow)" />
      <circle cx="280" cy="165" r="25" fill="url(#droneFoam)" stroke="url(#droneCut)" strokeWidth="2" filter="url(#droneGlow)" />

      {/* Controller cutout */}
      <rect x="320" y="40" width="55" height="90" rx="6" fill="url(#droneFoam)" stroke="url(#droneCut)" strokeWidth="2" filter="url(#droneGlow)" />
      {/* Controller sticks */}
      <circle cx="335" cy="70" r="8" stroke="url(#droneCut)" strokeWidth="1" fill="none" opacity="0.6" />
      <circle cx="360" cy="100" r="8" stroke="url(#droneCut)" strokeWidth="1" fill="none" opacity="0.6" />

      {/* Battery slots */}
      <rect x="40" y="200" width="80" height="35" rx="4" fill="url(#droneFoam)" stroke="url(#droneCut)" strokeWidth="2" filter="url(#droneGlow)" />
      <rect x="130" y="200" width="80" height="35" rx="4" fill="url(#droneFoam)" stroke="url(#droneCut)" strokeWidth="2" filter="url(#droneGlow)" />
      <rect x="220" y="200" width="80" height="35" rx="4" fill="url(#droneFoam)" stroke="url(#droneCut)" strokeWidth="2" filter="url(#droneGlow)" />

      {/* Propeller slots */}
      <rect x="40" y="250" width="60" height="20" rx="3" fill="url(#droneFoam)" stroke="url(#droneCut)" strokeWidth="1.5" filter="url(#droneGlow)" />
      <rect x="110" y="250" width="60" height="20" rx="3" fill="url(#droneFoam)" stroke="url(#droneCut)" strokeWidth="1.5" filter="url(#droneGlow)" />
      <rect x="180" y="250" width="60" height="20" rx="3" fill="url(#droneFoam)" stroke="url(#droneCut)" strokeWidth="1.5" filter="url(#droneGlow)" />
      <rect x="250" y="250" width="60" height="20" rx="3" fill="url(#droneFoam)" stroke="url(#droneCut)" strokeWidth="1.5" filter="url(#droneGlow)" />

      {/* Charging cables slot */}
      <rect x="320" y="145" width="55" height="120" rx="4" fill="url(#droneFoam)" stroke="url(#droneCut)" strokeWidth="2" filter="url(#droneGlow)" />
    </svg>
  );
}

// Industry illustration: Tool case with power drill and accessories
function ToolsIllustration() {
  return (
    <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="toolFoam" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2d2d2d" />
          <stop offset="100%" stopColor="#1a1a1a" />
        </linearGradient>
        <linearGradient id="toolCut" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF4D00" />
          <stop offset="100%" stopColor="#FF6B2B" />
        </linearGradient>
        <filter id="toolGlow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Case background */}
      <rect x="20" y="20" width="360" height="260" rx="8" fill="#0d0d0d" stroke="#333" strokeWidth="2" />

      {/* Power drill cutout - angled */}
      <g transform="rotate(-15, 140, 120)">
        {/* Drill body */}
        <rect x="50" y="80" width="120" height="70" rx="8" fill="url(#toolFoam)" stroke="url(#toolCut)" strokeWidth="2" filter="url(#toolGlow)" />
        {/* Drill chuck */}
        <rect x="170" y="95" width="60" height="40" rx="4" fill="url(#toolFoam)" stroke="url(#toolCut)" strokeWidth="2" filter="url(#toolGlow)" />
        {/* Handle */}
        <rect x="70" y="150" width="40" height="60" rx="6" fill="url(#toolFoam)" stroke="url(#toolCut)" strokeWidth="2" filter="url(#toolGlow)" />
      </g>

      {/* Battery slots */}
      <rect x="270" y="40" width="100" height="50" rx="6" fill="url(#toolFoam)" stroke="url(#toolCut)" strokeWidth="2" filter="url(#toolGlow)" />
      <rect x="270" y="100" width="100" height="50" rx="6" fill="url(#toolFoam)" stroke="url(#toolCut)" strokeWidth="2" filter="url(#toolGlow)" />

      {/* Drill bit slots */}
      <rect x="40" y="220" width="20" height="50" rx="3" fill="url(#toolFoam)" stroke="url(#toolCut)" strokeWidth="1.5" filter="url(#toolGlow)" />
      <rect x="65" y="220" width="20" height="50" rx="3" fill="url(#toolFoam)" stroke="url(#toolCut)" strokeWidth="1.5" filter="url(#toolGlow)" />
      <rect x="90" y="220" width="20" height="50" rx="3" fill="url(#toolFoam)" stroke="url(#toolCut)" strokeWidth="1.5" filter="url(#toolGlow)" />
      <rect x="115" y="220" width="20" height="50" rx="3" fill="url(#toolFoam)" stroke="url(#toolCut)" strokeWidth="1.5" filter="url(#toolGlow)" />
      <rect x="140" y="220" width="20" height="50" rx="3" fill="url(#toolFoam)" stroke="url(#toolCut)" strokeWidth="1.5" filter="url(#toolGlow)" />
      <rect x="165" y="220" width="20" height="50" rx="3" fill="url(#toolFoam)" stroke="url(#toolCut)" strokeWidth="1.5" filter="url(#toolGlow)" />

      {/* Screwdriver bits holder */}
      <rect x="200" y="200" width="80" height="70" rx="4" fill="url(#toolFoam)" stroke="url(#toolCut)" strokeWidth="2" filter="url(#toolGlow)" />
      {/* Bit holes */}
      <circle cx="220" cy="220" r="6" stroke="url(#toolCut)" strokeWidth="1" fill="none" opacity="0.6" />
      <circle cx="240" cy="220" r="6" stroke="url(#toolCut)" strokeWidth="1" fill="none" opacity="0.6" />
      <circle cx="260" cy="220" r="6" stroke="url(#toolCut)" strokeWidth="1" fill="none" opacity="0.6" />
      <circle cx="220" cy="245" r="6" stroke="url(#toolCut)" strokeWidth="1" fill="none" opacity="0.6" />
      <circle cx="240" cy="245" r="6" stroke="url(#toolCut)" strokeWidth="1" fill="none" opacity="0.6" />
      <circle cx="260" cy="245" r="6" stroke="url(#toolCut)" strokeWidth="1" fill="none" opacity="0.6" />

      {/* Charger slot */}
      <rect x="300" y="170" width="70" height="100" rx="6" fill="url(#toolFoam)" stroke="url(#toolCut)" strokeWidth="2" filter="url(#toolGlow)" />
    </svg>
  );
}

// Industry illustration: Medical equipment case
function MedicalIllustration() {
  return (
    <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="medFoam" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2d2d2d" />
          <stop offset="100%" stopColor="#1a1a1a" />
        </linearGradient>
        <linearGradient id="medCut" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF4D00" />
          <stop offset="100%" stopColor="#FF6B2B" />
        </linearGradient>
        <filter id="medGlow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Case background */}
      <rect x="20" y="20" width="360" height="260" rx="8" fill="#0d0d0d" stroke="#333" strokeWidth="2" />

      {/* Diagnostic device / monitor cutout */}
      <rect x="40" y="40" width="150" height="120" rx="8" fill="url(#medFoam)" stroke="url(#medCut)" strokeWidth="2" filter="url(#medGlow)" />
      {/* Screen area */}
      <rect x="55" y="55" width="120" height="70" rx="4" stroke="url(#medCut)" strokeWidth="1" fill="none" opacity="0.5" />
      {/* Control buttons */}
      <circle cx="75" cy="140" r="8" stroke="url(#medCut)" strokeWidth="1" fill="none" opacity="0.6" />
      <circle cx="100" cy="140" r="8" stroke="url(#medCut)" strokeWidth="1" fill="none" opacity="0.6" />
      <circle cx="125" cy="140" r="8" stroke="url(#medCut)" strokeWidth="1" fill="none" opacity="0.6" />

      {/* Stethoscope cutout - coiled shape */}
      <circle cx="280" cy="100" r="60" fill="url(#medFoam)" stroke="url(#medCut)" strokeWidth="2" filter="url(#medGlow)" />
      <circle cx="280" cy="100" r="35" stroke="url(#medCut)" strokeWidth="1" fill="none" opacity="0.4" />
      {/* Earpieces */}
      <ellipse cx="320" cy="45" rx="15" ry="10" fill="url(#medFoam)" stroke="url(#medCut)" strokeWidth="1.5" filter="url(#medGlow)" />
      <ellipse cx="350" cy="55" rx="15" ry="10" fill="url(#medFoam)" stroke="url(#medCut)" strokeWidth="1.5" filter="url(#medGlow)" />

      {/* Syringe slots */}
      <rect x="40" y="180" width="15" height="80" rx="7" fill="url(#medFoam)" stroke="url(#medCut)" strokeWidth="1.5" filter="url(#medGlow)" />
      <rect x="60" y="180" width="15" height="80" rx="7" fill="url(#medFoam)" stroke="url(#medCut)" strokeWidth="1.5" filter="url(#medGlow)" />
      <rect x="80" y="180" width="15" height="80" rx="7" fill="url(#medFoam)" stroke="url(#medCut)" strokeWidth="1.5" filter="url(#medGlow)" />
      <rect x="100" y="180" width="15" height="80" rx="7" fill="url(#medFoam)" stroke="url(#medCut)" strokeWidth="1.5" filter="url(#medGlow)" />

      {/* Vial slots */}
      <circle cx="145" cy="200" r="12" fill="url(#medFoam)" stroke="url(#medCut)" strokeWidth="1.5" filter="url(#medGlow)" />
      <circle cx="175" cy="200" r="12" fill="url(#medFoam)" stroke="url(#medCut)" strokeWidth="1.5" filter="url(#medGlow)" />
      <circle cx="145" cy="240" r="12" fill="url(#medFoam)" stroke="url(#medCut)" strokeWidth="1.5" filter="url(#medGlow)" />
      <circle cx="175" cy="240" r="12" fill="url(#medFoam)" stroke="url(#medCut)" strokeWidth="1.5" filter="url(#medGlow)" />

      {/* Thermometer slot */}
      <rect x="210" y="175" width="25" height="90" rx="12" fill="url(#medFoam)" stroke="url(#medCut)" strokeWidth="2" filter="url(#medGlow)" />

      {/* Blood pressure cuff */}
      <rect x="250" y="175" width="120" height="50" rx="6" fill="url(#medFoam)" stroke="url(#medCut)" strokeWidth="2" filter="url(#medGlow)" />

      {/* Accessories */}
      <rect x="250" y="235" width="50" height="30" rx="4" fill="url(#medFoam)" stroke="url(#medCut)" strokeWidth="1.5" filter="url(#medGlow)" />
      <rect x="310" y="235" width="60" height="30" rx="4" fill="url(#medFoam)" stroke="url(#medCut)" strokeWidth="1.5" filter="url(#medGlow)" />
    </svg>
  );
}

// Industry illustration: Audio equipment case
function AudioIllustration() {
  return (
    <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="audioFoam" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2d2d2d" />
          <stop offset="100%" stopColor="#1a1a1a" />
        </linearGradient>
        <linearGradient id="audioCut" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF4D00" />
          <stop offset="100%" stopColor="#FF6B2B" />
        </linearGradient>
        <filter id="audioGlow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Case background */}
      <rect x="20" y="20" width="360" height="260" rx="8" fill="#0d0d0d" stroke="#333" strokeWidth="2" />

      {/* Large condenser microphone cutout */}
      <rect x="40" y="50" width="50" height="180" rx="25" fill="url(#audioFoam)" stroke="url(#audioCut)" strokeWidth="2" filter="url(#audioGlow)" />
      {/* Mic grille detail */}
      <rect x="50" y="60" width="30" height="80" rx="15" stroke="url(#audioCut)" strokeWidth="1" fill="none" opacity="0.5" />

      {/* Second microphone */}
      <rect x="100" y="50" width="50" height="180" rx="25" fill="url(#audioFoam)" stroke="url(#audioCut)" strokeWidth="2" filter="url(#audioGlow)" />
      <rect x="110" y="60" width="30" height="80" rx="15" stroke="url(#audioCut)" strokeWidth="1" fill="none" opacity="0.5" />

      {/* Audio interface / mixer cutout */}
      <rect x="170" y="40" width="150" height="100" rx="6" fill="url(#audioFoam)" stroke="url(#audioCut)" strokeWidth="2" filter="url(#audioGlow)" />
      {/* Faders */}
      <rect x="185" y="55" width="8" height="50" rx="2" stroke="url(#audioCut)" strokeWidth="1" fill="none" opacity="0.6" />
      <rect x="205" y="55" width="8" height="50" rx="2" stroke="url(#audioCut)" strokeWidth="1" fill="none" opacity="0.6" />
      <rect x="225" y="55" width="8" height="50" rx="2" stroke="url(#audioCut)" strokeWidth="1" fill="none" opacity="0.6" />
      <rect x="245" y="55" width="8" height="50" rx="2" stroke="url(#audioCut)" strokeWidth="1" fill="none" opacity="0.6" />
      {/* Knobs */}
      <circle cx="195" cy="120" r="10" stroke="url(#audioCut)" strokeWidth="1" fill="none" opacity="0.6" />
      <circle cx="225" cy="120" r="10" stroke="url(#audioCut)" strokeWidth="1" fill="none" opacity="0.6" />
      <circle cx="255" cy="120" r="10" stroke="url(#audioCut)" strokeWidth="1" fill="none" opacity="0.6" />
      <circle cx="285" cy="120" r="10" stroke="url(#audioCut)" strokeWidth="1" fill="none" opacity="0.6" />

      {/* Headphones cutout */}
      <ellipse cx="340" cy="90" rx="30" ry="50" fill="url(#audioFoam)" stroke="url(#audioCut)" strokeWidth="2" filter="url(#audioGlow)" />
      <ellipse cx="340" cy="60" rx="18" ry="25" stroke="url(#audioCut)" strokeWidth="1" fill="none" opacity="0.5" />
      <ellipse cx="340" cy="120" rx="18" ry="25" stroke="url(#audioCut)" strokeWidth="1" fill="none" opacity="0.5" />

      {/* XLR cables coiled */}
      <circle cx="200" cy="200" r="40" fill="url(#audioFoam)" stroke="url(#audioCut)" strokeWidth="2" filter="url(#audioGlow)" />
      <circle cx="200" cy="200" r="20" stroke="url(#audioCut)" strokeWidth="1" fill="none" opacity="0.4" />

      {/* Shock mount */}
      <circle cx="290" cy="200" r="35" fill="url(#audioFoam)" stroke="url(#audioCut)" strokeWidth="2" filter="url(#audioGlow)" />
      <circle cx="290" cy="200" r="18" stroke="url(#audioCut)" strokeWidth="1" fill="none" opacity="0.5" />

      {/* Pop filter */}
      <circle cx="355" cy="200" r="25" fill="url(#audioFoam)" stroke="url(#audioCut)" strokeWidth="2" filter="url(#audioGlow)" />

      {/* Accessories tray */}
      <rect x="40" y="245" width="100" height="25" rx="4" fill="url(#audioFoam)" stroke="url(#audioCut)" strokeWidth="1.5" filter="url(#audioGlow)" />
    </svg>
  );
}

const industries = [
  { title: "Firearms & Tactical", desc: "Rifles, pistols, magazines, optics", type: "firearms" as const },
  { title: "Photography & Video", desc: "Cameras, lenses, flash units", type: "photography" as const },
  { title: "Drones & UAV", desc: "Drones, controllers, batteries", type: "drone" as const },
  { title: "Professional Tools", desc: "Precision instruments, power tools", type: "tools" as const },
  { title: "Medical Equipment", desc: "Diagnostic devices, instruments", type: "medical" as const },
  { title: "Audio & Visual", desc: "Microphones, mixers, monitors", type: "audio" as const },
];

function IndustryVisual({ type }: { type: "firearms" | "photography" | "drone" | "tools" | "medical" | "audio" }) {
  switch (type) {
    case "photography":
      return <PhotographyIllustration />;
    case "drone":
      return <DroneIllustration />;
    case "tools":
      return <ToolsIllustration />;
    case "medical":
      return <MedicalIllustration />;
    case "audio":
      return <AudioIllustration />;
    default:
      return null;
  }
}

const testimonials = [
  {
    name: "Mike R.",
    role: "Professional Photographer",
    quote: "The AI nailed the dimensions perfectly. My camera gear fits like it was made for it - because it was.",
    rating: 5,
  },
  {
    name: "Sarah T.",
    role: "Firearms Instructor",
    quote: "Ordered foam for 6 different cases. Every single one was perfect. Best foam inserts I've ever used.",
    rating: 5,
  },
  {
    name: "David L.",
    role: "Drone Pilot",
    quote: "Setup was incredibly easy. Took a photo, approved the design, and had my foam in 3 days.",
    rating: 5,
  },
];

const brands = ["Pelican", "Nanuk", "SKB", "Plano", "Apache", "Seahorse", "HPRC", "Explorer"];

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <img
                src="/images/logo.png"
                alt="CutMyCase"
                className="w-10 h-10 rounded"
              />
              <span className="font-bold text-xl tracking-wider">CUTMYCASE</span>
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-sm text-zinc-400 hover:text-orange-500 transition-colors">Home</Link>
              <Link href="/cases" className="text-sm text-zinc-400 hover:text-orange-500 transition-colors">Cases</Link>
              <Link href="/upload" className="text-sm text-zinc-400 hover:text-orange-500 transition-colors">Custom Cut</Link>
            </nav>
            <div className="flex items-center gap-3">
              <UserMenu />
              <Link href="/upload">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,77,0,0.15),transparent_50%)]" />

        {/* Grid background */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `linear-gradient(rgba(255,77,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,77,0,0.1) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text content */}
            <div>
              <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 rounded-full px-4 py-2 mb-6">
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                <span className="text-sm text-orange-500 uppercase tracking-wider">
                  AI-Powered Foam Design
                </span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-2">
                Custom Foam Inserts
              </h1>
              <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-orange-500 mb-6">
                Cut to Perfection
              </h2>

              <p className="text-xl text-zinc-400 max-w-xl mb-8">
                Upload a photo of your gear. Our AI designs the perfect foam insert.
                CNC precision-cut and shipped to your door.
              </p>

              <div className="flex flex-col sm:flex-row items-start gap-4 mb-8">
                <Link href="/upload">
                  <Button size="xl" className="shadow-[0_0_20px_rgba(255,77,0,0.3)]">
                    Start Your Design
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/cases">
                  <Button variant="outline" size="xl">
                    Browse Cases
                  </Button>
                </Link>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center gap-6 text-zinc-500 text-sm">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-orange-500" />
                  <span>Free Design</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-orange-500" />
                  <span>Fast Shipping</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-orange-500" />
                  <span>Perfect Fit Guaranteed</span>
                </div>
              </div>
            </div>

            {/* Hero Illustration */}
            <div className="hidden lg:block relative">
              <div className="aspect-[4/3] relative">
                <HeroIllustration />
              </div>

              {/* Floating stats */}
              <div className="absolute -left-8 top-1/4 bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                <div className="text-3xl font-bold text-orange-500">10K+</div>
                <div className="text-sm text-zinc-400">Cases Designed</div>
              </div>

              <div className="absolute -right-4 bottom-1/4 bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                <div className="text-3xl font-bold text-orange-500">99.8%</div>
                <div className="text-sm text-zinc-400">Perfect Fit Rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-zinc-600 flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-zinc-600 rounded-full" />
          </div>
        </div>
      </section>

      {/* Brand Compatibility */}
      <section className="py-8 bg-zinc-900 border-y border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-zinc-500 text-sm uppercase tracking-wider">
              Compatible with all major case brands
            </span>
            <div className="flex flex-wrap items-center justify-center gap-8">
              {brands.map((brand) => (
                <span key={brand} className="text-zinc-600 hover:text-orange-500 transition-colors font-bold text-lg tracking-wider">
                  {brand}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Showcase - Real Image */}
      <section className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Image */}
            <div className="relative group">
              <div className="aspect-[4/3] relative rounded-lg overflow-hidden border border-zinc-800">
                <Image
                  src="/images/showcase-firearms-1.jpg"
                  alt="Custom foam insert for tactical case with pistol, ear protection, magazines, and suppressor"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              {/* Overlay badge */}
              <div className="absolute bottom-4 left-4 bg-orange-500 text-white px-3 py-1 rounded text-sm font-bold">
                Customer Build
              </div>
            </div>

            {/* Text content */}
            <div>
              <span className="text-orange-500 uppercase tracking-wider text-sm">Featured Build</span>
              <h2 className="text-4xl sm:text-5xl font-bold mt-2 mb-6">
                Tactical Case <span className="text-orange-500">Perfection</span>
              </h2>
              <p className="text-zinc-400 mb-6">
                This custom Pelican case features precision-cut foam for a full tactical loadout:
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-zinc-300">
                  <Check className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  Electronic ear protection with contoured fit
                </li>
                <li className="flex items-center gap-3 text-zinc-300">
                  <Check className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  10 magazine slots for organized storage
                </li>
                <li className="flex items-center gap-3 text-zinc-300">
                  <Check className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  Pistol cutout with optic clearance
                </li>
                <li className="flex items-center gap-3 text-zinc-300">
                  <Check className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  Suppressor slot with secure fit
                </li>
              </ul>
              <Link href="/upload">
                <Button size="lg">
                  Build Your Own
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-orange-500 uppercase tracking-wider text-sm">Simple Process</span>
            <h2 className="text-4xl sm:text-5xl font-bold mt-2 mb-4">How It Works</h2>
            <p className="text-zinc-400 max-w-xl mx-auto">
              From photo to precision-cut foam in three simple steps
            </p>
          </div>

          {/* Step 1 */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div className="order-2 lg:order-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-orange-500 text-white font-bold text-2xl rounded flex items-center justify-center">
                  1
                </div>
                <h3 className="text-3xl font-bold">Upload Your Gear</h3>
              </div>
              <p className="text-zinc-400 text-lg mb-6">
                Take a photo of your equipment laid out with a reference object (like a credit card).
                Our AI automatically detects each item and outlines them with precision.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-zinc-300">
                  <Check className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  AI-powered object detection
                </li>
                <li className="flex items-center gap-3 text-zinc-300">
                  <Check className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  Automatic scale calibration
                </li>
                <li className="flex items-center gap-3 text-zinc-300">
                  <Check className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  Real-world measurements
                </li>
              </ul>
            </div>
            <div className="order-1 lg:order-2 relative">
              <div className="rounded-lg overflow-hidden border border-zinc-700 shadow-2xl">
                <Image
                  src="/images/process/step-calibrate.png"
                  alt="Calibrate step - AI detects items and measures dimensions"
                  width={1110}
                  height={948}
                  className="w-full h-auto"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl -z-10" />
            </div>
          </div>

          {/* Step 2 */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div className="relative">
              <div className="rounded-lg overflow-hidden border border-zinc-700 shadow-2xl">
                <Image
                  src="/images/process/step-layout-1.png"
                  alt="Layout step - Arrange items in your case"
                  width={1110}
                  height={948}
                  className="w-full h-auto"
                />
              </div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl -z-10" />
            </div>
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-orange-500 text-white font-bold text-2xl rounded flex items-center justify-center">
                  2
                </div>
                <h3 className="text-3xl font-bold">Design Your Layout</h3>
              </div>
              <p className="text-zinc-400 text-lg mb-6">
                Drag and arrange your items in the case. Select from popular case sizes or enter custom dimensions.
                Our system ensures proper spacing and a 1" safety margin.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-zinc-300">
                  <Check className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  Compatible with Pelican, Nanuk & more
                </li>
                <li className="flex items-center gap-3 text-zinc-300">
                  <Check className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  Auto-arrange for optimal fit
                </li>
                <li className="flex items-center gap-3 text-zinc-300">
                  <Check className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  Adjustable smoothing
                </li>
              </ul>
            </div>
          </div>

          {/* Step 3 */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-orange-500 text-white font-bold text-2xl rounded flex items-center justify-center">
                  3
                </div>
                <h3 className="text-3xl font-bold">Preview & Order</h3>
              </div>
              <p className="text-zinc-400 text-lg mb-6">
                See exactly how your items will fit with our image preview mode.
                Once you're happy, order your custom CNC-cut foam and we'll ship it to your door.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-zinc-300">
                  <Check className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  Real-time image preview
                </li>
                <li className="flex items-center gap-3 text-zinc-300">
                  <Check className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  Custom depth per item
                </li>
                <li className="flex items-center gap-3 text-zinc-300">
                  <Check className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  CNC precision cutting
                </li>
              </ul>
            </div>
            <div className="order-1 lg:order-2 relative">
              <div className="rounded-lg overflow-hidden border border-zinc-700 shadow-2xl">
                <Image
                  src="/images/process/step-layout-2.png"
                  alt="Preview step - See how your items will fit"
                  width={1110}
                  height={948}
                  className="w-full h-auto"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl -z-10" />
            </div>
          </div>

          <div className="text-center mt-16">
            <Link href="/upload">
              <Button size="lg">
                Try It Now - It&apos;s Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Industries */}
      <section className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-orange-500 uppercase tracking-wider text-sm">Industries We Serve</span>
            <h2 className="text-4xl sm:text-5xl font-bold mt-2 mb-4">Protect What Matters</h2>
            <p className="text-zinc-400 max-w-xl mx-auto">
              Custom foam solutions for every industry and application
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {industries.map((industry) => (
              <Link
                key={industry.title}
                href="/upload"
                className="group relative overflow-hidden rounded aspect-[4/3] bg-zinc-900 border border-zinc-800 hover:border-orange-500/50 transition-all"
              >
                {industry.type === "firearms" ? (
                  <Image
                    src="/images/showcase-firearms-1.jpg"
                    alt={industry.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 transition-transform group-hover:scale-105">
                    <IndustryVisual type={industry.type} />
                  </div>
                )}
                <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                  <h3 className="text-xl font-bold mb-1">{industry.title}</h3>
                  <p className="text-zinc-400 text-sm">{industry.desc}</p>
                </div>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-5 h-5 text-orange-500" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-orange-500 uppercase tracking-wider text-sm">Why CutMyCase</span>
              <h2 className="text-4xl sm:text-5xl font-bold mt-2 mb-6">
                Precision Protection <span className="text-orange-500">Made Simple</span>
              </h2>
              <p className="text-zinc-400 mb-8">
                We combine cutting-edge AI technology with precision CNC manufacturing
                to create custom foam inserts that fit your gear perfectly - every single time.
              </p>

              <div className="space-y-6">
                {[
                  { icon: Target, title: "Precision Fit", desc: "+/- 0.1\" tolerance for perfect protection every time" },
                  { icon: Shield, title: "Premium Foam", desc: "High-density polyethylene foam that lasts for years" },
                  { icon: Zap, title: "Fast Turnaround", desc: "Most orders ship within 48 hours of approval" },
                ].map((feature) => (
                  <div key={feature.title} className="flex gap-4">
                    <div className="w-12 h-12 bg-orange-500/20 rounded flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">{feature.title}</h4>
                      <p className="text-zinc-400 text-sm">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Link href="/upload">
                  <Button size="lg">
                    Start Designing
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Video placeholder */}
            <div className="relative">
              <div className="aspect-video bg-zinc-800 rounded border border-zinc-700 overflow-hidden relative group cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center group-hover:bg-orange-500/30 transition-colors">
                    <Play className="w-8 h-8 text-orange-500 ml-1" />
                  </div>
                </div>
                <div className="absolute bottom-4 left-4">
                  <span className="text-sm text-zinc-400">Watch: How AI designs your foam</span>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-orange-500 uppercase tracking-wider text-sm">Customer Reviews</span>
            <h2 className="text-4xl sm:text-5xl font-bold mt-2 mb-4">Trusted by Professionals</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-zinc-900 border border-zinc-800 rounded p-8 hover:border-orange-500/30 transition-colors">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-orange-500 text-orange-500" />
                  ))}
                </div>
                <p className="text-zinc-400 mb-6 italic">&ldquo;{testimonial.quote}&rdquo;</p>
                <div>
                  <div className="font-bold text-lg">{testimonial.name}</div>
                  <div className="text-zinc-500 text-sm">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile App */}
      <section className="py-24 bg-zinc-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,rgba(255,77,0,0.1),transparent_50%)]" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-orange-500 uppercase tracking-wider text-sm">Coming Soon</span>
              <h2 className="text-4xl sm:text-5xl font-bold mt-2 mb-6">Design On The Go</h2>
              <p className="text-zinc-400 mb-8">
                Our mobile app lets you snap a photo, get an instant AI design,
                and order your custom foam - all from your phone.
              </p>
              <Button variant="secondary" size="lg" className="gap-3">
                <Phone className="w-5 h-5" />
                Get Notified
              </Button>
            </div>

            {/* Phone mockup */}
            <div className="flex justify-center">
              <div className="relative w-64">
                <div className="bg-zinc-800 border-4 border-zinc-700 rounded-[40px] p-2 relative z-10">
                  <div className="bg-black rounded-[32px] overflow-hidden">
                    <div className="h-6 bg-black flex items-center justify-center">
                      <div className="w-20 h-4 bg-zinc-800 rounded-full" />
                    </div>
                    <div className="aspect-[9/16] bg-zinc-900 p-4">
                      <div className="h-8 bg-zinc-800 rounded mb-4" />
                      <div className="aspect-square bg-zinc-800 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                        <Image
                          src="/images/showcase-firearms-1.jpg"
                          alt="App preview"
                          width={200}
                          height={200}
                          className="object-cover"
                        />
                      </div>
                      <div className="h-12 bg-orange-500 rounded-lg" />
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 bg-orange-500/20 rounded-[40px] blur-2xl -z-10" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,77,0,0.2),transparent_70%)]" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">Ready to Protect Your Gear?</h2>
          <p className="text-xl text-zinc-400 mb-8">Start with a photo. We&apos;ll handle the rest.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/upload">
              <Button size="xl" className="shadow-[0_0_20px_rgba(255,77,0,0.3)]">
                Upload Your Gear Photo
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="xl">Contact Sales</Button>
            </Link>
          </div>
          <p className="mt-8 text-zinc-500 text-sm">
            Questions? Call us at{" "}
            <a href="tel:+18005551234" className="text-orange-500 hover:underline">1-800-555-1234</a>
            {" "}or email{" "}
            <a href="mailto:hello@cutmycase.com" className="text-orange-500 hover:underline">hello@cutmycase.com</a>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-900 border-t border-zinc-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <img
                  src="/images/logo.png"
                  alt="CutMyCase"
                  className="w-10 h-10 rounded"
                />
                <span className="font-bold text-xl">CUTMYCASE</span>
              </Link>
              <p className="text-zinc-500 text-sm">
                Precision custom foam inserts for your gear. AI-powered design, CNC cut perfection.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Products</h4>
              <ul className="space-y-2 text-sm text-zinc-500">
                <li><Link href="/cases" className="hover:text-orange-500 transition-colors">All Cases</Link></li>
                <li><Link href="/upload" className="hover:text-orange-500 transition-colors">Custom Foam</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-zinc-500">
                <li><Link href="/faq" className="hover:text-orange-500 transition-colors">FAQ</Link></li>
                <li><Link href="/contact" className="hover:text-orange-500 transition-colors">Contact Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-zinc-500">
                <li><Link href="/privacy" className="hover:text-orange-500 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-orange-500 transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-zinc-500 text-sm">&copy; 2024 CutMyCase. All rights reserved.</p>
            <p className="text-zinc-600 text-sm">Made with precision in Texas</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
