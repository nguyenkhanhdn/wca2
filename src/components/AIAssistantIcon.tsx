import React from 'react';

interface AIAssistantIconProps {
  className?: string;
  size?: number;
}

/**
 * Custom AI Headset / Robot icon matching the official administrative assistant graphic
 * provided in the prompt: Headset arc, ear cushions, bold "AI" in center, microphone boom.
 */
export const AIAssistantIcon: React.FC<AIAssistantIconProps> = ({
  className = 'w-6 h-6',
  size
}) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Headset Top Headband */}
      <path
        d="M5.5 11.5V8a6.5 6.5 0 0 1 13 0v3.5"
        strokeWidth="2"
      />
      
      {/* Left Ear Cushion */}
      <rect
        x="2.5"
        y="9.5"
        width="3"
        height="6"
        rx="1.5"
        strokeWidth="2"
        fill="currentColor"
        fillOpacity="0.1"
      />

      {/* Right Ear Cushion */}
      <rect
        x="18.5"
        y="9.5"
        width="3"
        height="6"
        rx="1.5"
        strokeWidth="2"
        fill="currentColor"
        fillOpacity="0.1"
      />

      {/* Center "AI" typography */}
      <text
        x="12"
        y="13.2"
        textAnchor="middle"
        fontSize="6.8"
        fontWeight="900"
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="-0.2px"
        fill="currentColor"
        stroke="none"
      >
        AI
      </text>

      {/* Microphone Boom Arm curving to mouth */}
      <path
        d="M5.5 15.5v1.5a5 5 0 0 0 4.5 4.95"
        strokeWidth="2"
      />

      {/* Microphone Capsule */}
      <circle
        cx="12.5"
        cy="21.5"
        r="1.75"
        fill="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
};
