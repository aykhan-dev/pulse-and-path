import React, { useMemo } from 'react';
import { Point } from '../types';

interface ConnectionLineProps {
  start: Point;
  end: Point;
  color: string;
  variant?: 'default' | 'dragging' | 'weak' | 'success';
}

const ConnectionLine: React.FC<ConnectionLineProps> = ({ start, end, color, variant = 'default' }) => {
  // Styles based on variant
  let strokeOpacity = "0.9";
  let strokeWidth = "1.5";
  let blurOpacity = "0.3";
  let dashArray = "none";
  let coreColor = color;
  
  // Dragging but source lost rhythm
  if (variant === 'weak') {
      strokeOpacity = "0.3";
      dashArray = "4 4";
  } 
  // Normal dragging
  else if (variant === 'dragging') {
      strokeOpacity = "0.6";
      dashArray = "2 2";
      coreColor = 'white';
      strokeWidth = "1";
  } 
  // Ready to connect (hovering valid target)
  else if (variant === 'success') {
      strokeOpacity = "1";
      strokeWidth = "3";
      coreColor = '#ffffff'; // Bright white
      blurOpacity = "0.8";
  }

  const pathD = `M${start.x},${start.y} L${end.x},${end.y}`;
  const length = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
  const animationDuration = Math.max(1, length / 20) + 's'; // Slower for longer lines

  // Explicitly transition only visual properties, NOT 'd' (geometry) to prevent drag lag
  const transitionStyle: React.CSSProperties = {
    transitionProperty: 'stroke, stroke-width, opacity, stroke-opacity, filter',
    transitionDuration: '300ms',
    transitionTimingFunction: 'ease-out'
  };

  return (
    <g className="pointer-events-none">
      {/* Outer Glow */}
      <path
        d={pathD}
        stroke={variant === 'success' ? '#ffffff' : color}
        strokeWidth={variant === 'success' ? "8" : "3"}
        strokeLinecap="round"
        fill="none"
        style={{ 
            ...transitionStyle,
            opacity: blurOpacity, 
            filter: 'blur(4px)' 
        }}
      />
      
      {/* Inner Core */}
      <path
        d={pathD}
        stroke={coreColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={dashArray}
        fill="none"
        style={{ 
            ...transitionStyle,
            opacity: strokeOpacity 
        }}
      >
          {variant === 'default' && (
              <animate attributeName="stroke-opacity" values="0.7;1;0.7" dur="3s" repeatCount="indefinite" />
          )}
      </path>

      {/* Energy Flow Particle (Only for established connections) */}
      {variant === 'default' && (
        <circle r="2" fill="white" filter="blur(1px)">
            <animateMotion 
                dur={animationDuration} 
                repeatCount="indefinite" 
                path={pathD}
                keyPoints="0;1"
                keyTimes="0;1"
                calcMode="linear"
            />
             <animate attributeName="opacity" values="0;1;0" dur={animationDuration} repeatCount="indefinite" />
        </circle>
      )}
    </g>
  );
};

export default React.memo(ConnectionLine);