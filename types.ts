export type NodeType = 'start' | 'end' | 'basic' | 'prism' | 'anchor';

export interface Point {
  x: number;
  y: number;
}

export interface GameNode {
  id: string;
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
  interval: number; // Pulse interval in ms
  offset: number; // Time offset in ms
  type: NodeType;
  color: string; // Tailwind color class or hex
}

export interface Connection {
  id: string;
  from: string;
  to: string;
  active: boolean; // Is energy flowing?
  color: string;
  createdAt?: number; // Relative game time
}

export interface LevelConfig {
  id: string;
  name: string;
  description: string;
  nodes: GameNode[];
  connections?: Connection[]; // Pre-existing connections (optional)
}

export interface GameState {
  status: 'idle' | 'playing' | 'won';
  activeConnections: Connection[];
  lastActiveNodeId: string | null;
}