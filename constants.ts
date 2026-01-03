import { LevelConfig } from './types';

export const PULSE_WINDOW_MS = 1200; // Significantly increased for better tolerance
export const NODE_RADIUS_PX = 40; // Larger visual radius

export const COLORS = {
  cyan: '#06b6d4',
  amber: '#f59e0b',
  purple: '#8b5cf6',
  green: '#10b981',
  slate: '#64748b',
  red: '#ef4444',
  blue: '#3b82f6',
  pink: '#ec4899'
};

export const INITIAL_LEVELS: LevelConfig[] = [
  {
    id: 'tutorial-1',
    name: 'First Breath',
    description: 'Wait for the sync. Connect Start to End.',
    nodes: [
      { id: 'n1', x: 20, y: 50, interval: 2000, offset: 0, type: 'start', color: COLORS.cyan },
      { id: 'n2', x: 50, y: 50, interval: 2000, offset: 0, type: 'basic', color: COLORS.cyan },
      { id: 'n3', x: 80, y: 50, interval: 3000, offset: 2000, type: 'end', color: COLORS.cyan } // Syncs at 4000ms
    ]
  },
  {
    id: 'tutorial-2',
    name: 'Polyrhythm',
    description: 'Different pulse speeds require patience.',
    nodes: [
      { id: 'n1', x: 20, y: 80, interval: 3000, offset: 0, type: 'start', color: COLORS.purple },
      { id: 'n2', x: 50, y: 50, interval: 2000, offset: 500, type: 'basic', color: COLORS.purple },
      { id: 'n3', x: 80, y: 20, interval: 4000, offset: 0, type: 'end', color: COLORS.purple }
    ]
  },
  {
    id: 'level-3',
    name: 'The Cascade',
    description: 'Follow the rhythm down the line.',
    nodes: [
      { id: 's', x: 20, y: 20, interval: 2500, offset: 0, type: 'start', color: COLORS.green },
      { id: 'b1', x: 40, y: 40, interval: 2500, offset: 625, type: 'basic', color: COLORS.green },
      { id: 'b2', x: 60, y: 60, interval: 2500, offset: 1250, type: 'basic', color: COLORS.green },
      { id: 'e', x: 80, y: 80, interval: 2500, offset: 1875, type: 'end', color: COLORS.green }
    ]
  },
  {
    id: 'level-4',
    name: 'Triangle Theory',
    description: 'Three beats, one path.',
    nodes: [
      { id: 's', x: 50, y: 20, interval: 2000, offset: 0, type: 'start', color: COLORS.amber },
      { id: 'b1', x: 20, y: 70, interval: 3000, offset: 0, type: 'basic', color: COLORS.amber },
      { id: 'b2', x: 80, y: 70, interval: 3000, offset: 1500, type: 'basic', color: COLORS.amber },
      { id: 'e', x: 50, y: 50, interval: 1500, offset: 0, type: 'end', color: COLORS.amber }
    ]
  },
  {
    id: 'level-5',
    name: 'The Cross',
    description: 'Timing is everything where paths meet.',
    nodes: [
      { id: 's', x: 20, y: 50, interval: 2000, offset: 0, type: 'start', color: COLORS.blue },
      { id: 'mid', x: 50, y: 50, interval: 1000, offset: 500, type: 'basic', color: COLORS.blue },
      { id: 'b1', x: 50, y: 20, interval: 2000, offset: 1000, type: 'basic', color: COLORS.blue },
      { id: 'b2', x: 50, y: 80, interval: 2000, offset: 1000, type: 'basic', color: COLORS.blue },
      { id: 'e', x: 80, y: 50, interval: 4000, offset: 0, type: 'end', color: COLORS.blue }
    ]
  },
  {
    id: 'level-6',
    name: 'Orbit',
    description: 'Catch the satellite as it passes.',
    nodes: [
      { id: 's', x: 50, y: 50, interval: 4000, offset: 0, type: 'start', color: COLORS.purple },
      { id: 'b1', x: 50, y: 20, interval: 2000, offset: 0, type: 'basic', color: COLORS.purple },
      { id: 'b2', x: 80, y: 50, interval: 2000, offset: 500, type: 'basic', color: COLORS.purple },
      { id: 'b3', x: 50, y: 80, interval: 2000, offset: 1000, type: 'basic', color: COLORS.purple },
      { id: 'b4', x: 20, y: 50, interval: 2000, offset: 1500, type: 'basic', color: COLORS.purple },
      { id: 'e', x: 20, y: 20, interval: 4000, offset: 2000, type: 'end', color: COLORS.purple }
    ]
  },
  {
    id: 'level-7',
    name: 'Binary Systems',
    description: 'Two separate rhythms.',
    nodes: [
      { id: 's', x: 10, y: 50, interval: 2000, offset: 0, type: 'start', color: COLORS.red },
      { id: 'u1', x: 30, y: 30, interval: 2000, offset: 1000, type: 'basic', color: COLORS.red },
      { id: 'd1', x: 30, y: 70, interval: 3000, offset: 0, type: 'basic', color: COLORS.red }, // Fixed color
      { id: 'mid', x: 50, y: 50, interval: 6000, offset: 0, type: 'basic', color: COLORS.red },
      { id: 'u2', x: 70, y: 30, interval: 2000, offset: 0, type: 'basic', color: COLORS.red },
      { id: 'd2', x: 70, y: 70, interval: 3000, offset: 1500, type: 'basic', color: COLORS.red },
      { id: 'e', x: 90, y: 50, interval: 4000, offset: 0, type: 'end', color: COLORS.red }
    ]
  },
  {
    id: 'level-8',
    name: 'The Serpent',
    description: 'A long winding road with a fast heartbeat.',
    nodes: [
      { id: 's', x: 10, y: 10, interval: 1500, offset: 0, type: 'start', color: COLORS.green },
      { id: 'b1', x: 30, y: 20, interval: 1500, offset: 500, type: 'basic', color: COLORS.green },
      { id: 'b2', x: 10, y: 40, interval: 1500, offset: 1000, type: 'basic', color: COLORS.green },
      { id: 'b3', x: 30, y: 60, interval: 1500, offset: 0, type: 'basic', color: COLORS.green },
      { id: 'b4', x: 10, y: 80, interval: 1500, offset: 500, type: 'basic', color: COLORS.green },
      { id: 'b5', x: 50, y: 90, interval: 3000, offset: 0, type: 'basic', color: COLORS.green },
      { id: 'b6', x: 90, y: 90, interval: 3000, offset: 1500, type: 'basic', color: COLORS.green },
      { id: 'e', x: 90, y: 10, interval: 4500, offset: 0, type: 'end', color: COLORS.green }
    ]
  },
  {
    id: 'level-9',
    name: 'Constellation',
    description: 'Find the path through the stars.',
    nodes: [
      { id: 's', x: 50, y: 50, interval: 5000, offset: 0, type: 'start', color: COLORS.cyan },
      { id: 'b1', x: 30, y: 20, interval: 2500, offset: 0, type: 'basic', color: COLORS.cyan }, // Fixed color
      { id: 'b2', x: 70, y: 20, interval: 3000, offset: 0, type: 'basic', color: COLORS.cyan },
      { id: 'b3', x: 80, y: 60, interval: 2000, offset: 0, type: 'basic', color: COLORS.cyan },
      { id: 'b4', x: 20, y: 60, interval: 4000, offset: 0, type: 'basic', color: COLORS.cyan },
      { id: 'b5', x: 50, y: 85, interval: 2500, offset: 1250, type: 'basic', color: COLORS.cyan },
      { id: 'e', x: 50, y: 10, interval: 5000, offset: 2500, type: 'end', color: COLORS.cyan }
    ]
  },
  {
    id: 'level-10',
    name: 'Zenith',
    description: 'Perfect harmony required.',
    nodes: [
      { id: 's', x: 10, y: 90, interval: 2000, offset: 0, type: 'start', color: COLORS.amber },
      { id: 'b1', x: 25, y: 75, interval: 2200, offset: 0, type: 'basic', color: COLORS.amber },
      { id: 'b2', x: 40, y: 60, interval: 2400, offset: 0, type: 'basic', color: COLORS.amber },
      { id: 'b3', x: 55, y: 45, interval: 2600, offset: 0, type: 'basic', color: COLORS.amber },
      { id: 'b4', x: 70, y: 30, interval: 2800, offset: 0, type: 'basic', color: COLORS.amber },
      { id: 'e', x: 90, y: 10, interval: 3000, offset: 0, type: 'end', color: COLORS.amber }
    ]
  },
  // New Tutorial Levels
  {
    id: 'level-11',
    name: 'The Prism',
    description: 'Triangles transform the energy color. Match the output.',
    nodes: [
        { id: 's', x: 20, y: 50, interval: 2000, offset: 0, type: 'start', color: COLORS.cyan },
        { id: 'p1', x: 50, y: 50, interval: 2000, offset: 1000, type: 'prism', color: COLORS.pink },
        { id: 'e', x: 80, y: 50, interval: 2000, offset: 0, type: 'end', color: COLORS.pink }
    ]
  },
  {
    id: 'level-12',
    name: 'The Anchor',
    description: 'Squares hold the charge for 3 seconds, allowing easier sync.',
    nodes: [
        { id: 's', x: 20, y: 50, interval: 1500, offset: 0, type: 'start', color: COLORS.green },
        { id: 'a1', x: 50, y: 20, interval: 1000, offset: 0, type: 'anchor', color: COLORS.green },
        { id: 'e', x: 80, y: 50, interval: 4000, offset: 2500, type: 'end', color: COLORS.green }
    ]
  }
];