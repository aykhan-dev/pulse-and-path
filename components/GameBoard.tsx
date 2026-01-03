import React, { useRef, useState, useEffect, useCallback } from 'react';
import { GameNode, Connection, Point, LevelConfig } from '../types';
import Node from './Node';
import ConnectionLine from './ConnectionLine';
import { PULSE_WINDOW_MS } from '../constants';

interface GameBoardProps {
  level: LevelConfig;
  onLevelComplete: (mistakes: number) => void;
}

interface Particle {
    id: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    color: string;
    size: number;
}

const GameBoard: React.FC<GameBoardProps> = ({ level, onLevelComplete }) => {
  const [time, setTime] = useState(0);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [dragStart, setDragStart] = useState<GameNode | null>(null);
  const [dragCurrent, setDragCurrent] = useState<Point | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GameNode | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  
  const requestRef = useRef<number>(0);
  const startTimeRef = useRef<number>(Date.now());
  const lastFrameRef = useRef<number>(Date.now());
  const boardRef = useRef<HTMLDivElement>(null);
  const rectRef = useRef<DOMRect | null>(null);

  // Initialize state when level changes
  useEffect(() => {
    setConnections(level.connections || []);
    setDragStart(null);
    setDragCurrent(null);
    setHoveredNode(null);
    setMistakes(0);
    setParticles([]);
    startTimeRef.current = Date.now();
    lastFrameRef.current = Date.now();
  }, [level]);

  // Game Loop
  const animate = useCallback(() => {
    const now = Date.now();
    const elapsed = now - startTimeRef.current;
    
    // Delta time for physics
    const delta = now - lastFrameRef.current;
    lastFrameRef.current = now;

    setTime(elapsed);

    // Update Particles
    setParticles(prev => {
        if (prev.length === 0) return prev;
        const safeDelta = Math.min(delta, 100); 

        return prev.map(p => ({
            ...p,
            x: p.x + p.vx * (safeDelta * 0.05),
            y: p.y + p.vy * (safeDelta * 0.05),
            life: p.life - (safeDelta / 800)
        })).filter(p => p.life > 0);
    });

    requestRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [animate]);

  // Helper: Check if a node is currently active
  const isNodeActive = (node: GameNode, currentTime: number) => {
    // Anchor Logic: If connected, stay active for 3 seconds
    if (node.type === 'anchor') {
        const incoming = connections.find(c => c.to === node.id);
        if (incoming && incoming.createdAt) {
             const age = currentTime - incoming.createdAt;
             if (age < 3000) return true; // Stays active for 3s after connection
        }
    }

    // Standard Pulse Logic
    const effectiveWindow = Math.min(PULSE_WINDOW_MS, node.interval * 0.7);
    const timeInCycle = (currentTime + node.offset) % node.interval;
    const halfWindow = effectiveWindow / 2;
    return timeInCycle < halfWindow || timeInCycle > (node.interval - halfWindow);
  };

  // Helper: Get coordinate from event
  const getPointFromEvent = (e: React.PointerEvent): Point | null => {
    let rect = rectRef.current;
    if (!rect && boardRef.current) {
         rect = boardRef.current.getBoundingClientRect();
    }
    if (!rect) return null;

    return {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    };
  };

  // Helper: Find node at point
  const getNodeAtPoint = (point: Point): GameNode | undefined => {
    if (!boardRef.current) return undefined;
    const threshold = 8;
    return level.nodes.find(n => {
      const dx = n.x - point.x;
      const dy = n.y - point.y;
      return Math.sqrt(dx*dx + dy*dy) < threshold;
    });
  };

  const spawnParticles = (x: number, y: number, color: string) => {
      const count = 12;
      const newParticles: Particle[] = [];
      for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 0.5 + 0.2;
          newParticles.push({
              id: Math.random().toString(36).substr(2, 9),
              x,
              y,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              life: 1.0,
              color: color,
              size: Math.random() * 4 + 2
          });
      }
      setParticles(prev => [...prev, ...newParticles]);
  };

  // Interaction Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (boardRef.current) {
        rectRef.current = boardRef.current.getBoundingClientRect();
    }

    const point = getPointFromEvent(e);
    if (!point) return;

    const node = getNodeAtPoint(point);
    if (node) {
        const isStart = node.type === 'start';
        const isConnected = connections.some(c => c.to === node.id || c.from === node.id);
        
        if (isStart || isConnected) {
            setDragStart(node);
            setDragCurrent(point);
            if (navigator.vibrate) navigator.vibrate(10);
        }
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragStart) return;
    const point = getPointFromEvent(e);
    if (point) {
        setDragCurrent(point);
        const node = getNodeAtPoint(point);
        
        if (node && node.id !== dragStart.id) {
             const exists = connections.some(c => 
                (c.from === dragStart.id && c.to === node.id) ||
                (c.from === node.id && c.to === dragStart.id)
            );
            if (!exists) {
                setHoveredNode(node);
                return;
            }
        }
        setHoveredNode(null);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!dragStart) {
        setHoveredNode(null);
        rectRef.current = null;
        return;
    }

    const point = getPointFromEvent(e);
    if (point) {
      const targetNode = getNodeAtPoint(point);
      
      if (targetNode && targetNode.id !== dragStart.id) {
        const exists = connections.some(c => 
            (c.from === dragStart.id && c.to === targetNode.id) ||
            (c.from === targetNode.id && c.to === dragStart.id)
        );

        if (!exists) {
            const startActive = isNodeActive(dragStart, time);
            const targetActive = isNodeActive(targetNode, time);

            // COLOR MATCH LOGIC
            // 1. Source color is established by the node you drag FROM.
            // 2. Target must match Source, UNLESS Target is a Prism (accepts anything).
            const isColorMatch = 
                dragStart.color === targetNode.color || 
                targetNode.type === 'prism';

            if (startActive && targetActive && isColorMatch) {
                // SUCCESS
                const newConnection: Connection = {
                    id: `${dragStart.id}-${targetNode.id}`,
                    from: dragStart.id,
                    to: targetNode.id,
                    active: true,
                    color: dragStart.color,
                    createdAt: time // Store game time
                };
                
                const newConnections = [...connections, newConnection];
                setConnections(newConnections);
                
                spawnParticles(targetNode.x, targetNode.y, '#ffffff'); 
                spawnParticles(targetNode.x, targetNode.y, targetNode.color); // Spark with target color
                
                if (navigator.vibrate) navigator.vibrate([20, 50, 20]);

                if (checkWinCondition(newConnections)) {
                    setTimeout(() => onLevelComplete(mistakes), 800);
                }

            } else {
                // FAILURE
                if (navigator.vibrate) navigator.vibrate(100);
                setMistakes(m => m + 1);
            }
        }
      }
    }

    setDragStart(null);
    setDragCurrent(null);
    setHoveredNode(null);
    rectRef.current = null; 
  };

  const checkWinCondition = (currentConnections: Connection[]): boolean => {
      const startNodes = level.nodes.filter(n => n.type === 'start');
      const visited = new Set<string>();
      const queue = startNodes.map(n => n.id);

      while(queue.length > 0) {
          const currentId = queue.shift()!;
          if(visited.has(currentId)) continue;
          visited.add(currentId);

          const currentNode = level.nodes.find(n => n.id === currentId);
          if (currentNode?.type === 'end') return true;

          currentConnections.forEach(c => {
              if (c.from === currentId && !visited.has(c.to)) queue.push(c.to);
              if (c.to === currentId && !visited.has(c.from)) queue.push(c.from);
          });
      }
      return false;
  };

  // Render State Logic
  const isDragSourceActive = dragStart ? isNodeActive(dragStart, time) : false;
  const isTargetActive = hoveredNode ? isNodeActive(hoveredNode, time) : false;
  
  // Color Check for UI Feedback
  const isColorValid = hoveredNode ? (dragStart?.color === hoveredNode.color || hoveredNode.type === 'prism') : false;

  const isConnectionReady = isDragSourceActive && isTargetActive && isColorValid;

  let dragLineVariant: 'dragging' | 'weak' | 'success' = 'dragging';
  if (dragStart) {
      if (!isDragSourceActive) {
          dragLineVariant = 'weak';
      } else if (isConnectionReady) {
          dragLineVariant = 'success';
      }
  }

  return (
    <div 
        ref={boardRef}
        className="relative w-full aspect-square max-w-lg mx-auto bg-slate-900 rounded-xl shadow-2xl border border-slate-800 overflow-hidden touch-none select-none animate-in fade-in duration-700"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
    >
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-10" 
             style={{ 
                 backgroundImage: 'radial-gradient(circle, #334155 1px, transparent 1px)',
                 backgroundSize: '20px 20px'
             }}>
        </div>

        {/* SVG Layer */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            {connections.map(c => {
                const fromNode = level.nodes.find(n => n.id === c.from);
                const toNode = level.nodes.find(n => n.id === c.to);
                if (!fromNode || !toNode) return null;
                return (
                    <ConnectionLine 
                        key={c.id} 
                        start={{ x: fromNode.x, y: fromNode.y }} 
                        end={{ x: toNode.x, y: toNode.y }} 
                        color={c.color} 
                    />
                );
            })}
            
            {dragStart && dragCurrent && (
                <ConnectionLine 
                    start={{ x: dragStart.x, y: dragStart.y }} 
                    end={dragCurrent} 
                    color={dragStart.color}
                    variant={dragLineVariant}
                />
            )}
        </svg>

        {/* Particles Layer */}
        {particles.map(p => (
            <div 
                key={p.id}
                className="absolute rounded-full pointer-events-none"
                style={{
                    left: `${p.x}%`,
                    top: `${p.y}%`,
                    width: `${p.size}px`,
                    height: `${p.size}px`,
                    backgroundColor: p.color,
                    opacity: p.life,
                    transform: `translate(-50%, -50%) scale(${p.life})`,
                    boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
                    transition: 'none'
                }}
            />
        ))}

        {/* Nodes Layer */}
        {level.nodes.map(node => (
            <Node 
                key={node.id} 
                node={node} 
                time={time} 
                isSelected={dragStart?.id === node.id}
                isConnected={connections.some(c => c.from === node.id || c.to === node.id)}
                isTargetReady={hoveredNode?.id === node.id && isConnectionReady}
            />
        ))}
    </div>
  );
};

export default GameBoard;