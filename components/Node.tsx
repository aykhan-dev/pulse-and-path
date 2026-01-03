import React, { useRef } from 'react';
import { GameNode } from '../types';
import { PULSE_WINDOW_MS } from '../constants';

interface NodeProps {
  node: GameNode;
  time: number;
  isSelected: boolean;
  isConnected: boolean;
  isTargetReady?: boolean; // Highlight when hovering with a valid connection
}

const Node: React.FC<NodeProps> = ({ node, time, isSelected, isConnected, isTargetReady }) => {
  // Ensure we don't exceed 70% of the interval for fast nodes
  const effectiveWindow = Math.min(PULSE_WINDOW_MS, node.interval * 0.7);
  
  const phase = ((time + node.offset) % node.interval) / node.interval;
  const timeInCycle = (time + node.offset) % node.interval;
  const halfWindow = effectiveWindow / 2;
  const isActive = timeInCycle < halfWindow || timeInCycle > (node.interval - halfWindow);

  const sine = Math.sin(phase * Math.PI * 2);
  
  // Dynamic Styles
  let scale = isActive ? 1.3 : 1 + (sine * 0.1); 
  let opacity = isActive ? 1 : 0.6;
  const ringScale = (timeInCycle / node.interval); 

  // Override visuals if this is a ready target (Lock-on effect)
  if (isTargetReady) {
      scale = 1.5;
      opacity = 1;
  }

  const getNodeColor = () => {
    if (isTargetReady) return '#ffffff'; // Flash bright white if ready to connect
    if (isConnected) return node.color;
    if (isActive) return '#ffffff'; // Pulse white on beat
    return node.color;
  };

  const getRotation = () => {
      if (node.type === 'prism') return `rotate(${time / 50}deg)`; // Slow spin for Prism
      return 'rotate(0deg)';
  };

  // SVG Shape Helpers
  const renderShape = (props: React.SVGProps<SVGElement>) => {
      switch(node.type) {
          case 'prism':
              // Centered Equilateral-ish Triangle
              // Reduced size (50,25 -> 78,75 -> 22,75) to prevent stroke clipping at viewbox edges
              return <polygon points="50,25 78,75 22,75" strokeLinejoin="round" {...props as any} />;
          case 'anchor':
              // Rounded Square
              return <rect x="22" y="22" width="56" height="56" rx="12" {...props as any} />;
          default:
              // Circle
              return <circle cx="50" cy="50" r="28" {...props as any} />;
      }
  };

  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none"
      style={{
        left: `${node.x}%`,
        top: `${node.y}%`,
        width: '80px',
        height: '80px',
        zIndex: isSelected || isTargetReady ? 10 : 1
      }}
    >
      <svg width="100%" height="100%" viewBox="0 0 100 100" className="overflow-visible">
          
          {/* Expanding Ripple Ring */}
          <g style={{
             transformOrigin: '50px 50px',
             transform: `scale(${0.8 + ringScale * 0.5}) ${getRotation()}`, 
             opacity: isTargetReady ? 0.8 : (1 - ringScale) * 0.5,
             transition: 'transform 0.1s linear'
          }}>
             {renderShape({
                 fill: 'none',
                 stroke: isTargetReady ? '#ffffff' : node.color,
                 strokeWidth: isTargetReady ? 3 : 1.5
             })}
          </g>

          {/* Core Node */}
          <g style={{
              transformOrigin: '50px 50px',
              transform: `scale(${scale}) ${getRotation()}`,
              opacity: opacity,
              transition: 'transform 0.1s linear'
          }}>
              {/* Main Shape Fill */}
              {renderShape({
                  fill: getNodeColor(),
                  stroke: node.type === 'start' || node.type === 'end' ? '#ffffff' : 'none',
                  strokeWidth: node.type === 'end' ? 3 : 4,
                  strokeDasharray: node.type === 'end' ? '6 4' : 'none',
                  // Apply shadow filter or simple drop-shadow via style
                  style: { filter: `drop-shadow(0 0 8px ${node.color})` }
              })}

              {/* Inner Detail Icons */}
              {node.type === 'start' && <circle cx="50" cy="50" r="8" fill="white" />}
              {node.type === 'anchor' && <rect x="42" y="42" width="16" height="16" rx="2" fill="white" fillOpacity="0.5" />}
          </g>
      </svg>
    </div>
  );
};

export default React.memo(Node);