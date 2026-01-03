import { LevelConfig, GameNode, NodeType } from '../types';
import { INITIAL_LEVELS, COLORS } from '../constants';

export const TOTAL_LEVELS = 9999;

const ADJECTIVES = ['Silent', 'Neon', 'Deep', 'Cosmic', 'Rapid', 'Harmonic', 'Solar', 'Lunar', 'Void', 'Zen', 'Astral', 'Binary', 'Prismatic'];
const NOUNS = ['Pulse', 'Drift', 'Flow', 'Echo', 'Tide', 'Orbit', 'Signal', 'Wave', 'Path', 'Link', 'Phase', 'Current', 'Shard'];

class PRNG {
  private seed: number;
  
  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    let t = (this.seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  choice<T>(array: T[]): T {
    return array[Math.floor(this.next() * array.length)];
  }
}

export const getLevel = (index: number): LevelConfig => {
  // Return hand-crafted levels for the tutorial phase
  if (index < INITIAL_LEVELS.length) {
    return INITIAL_LEVELS[index];
  }

  const rng = new PRNG(index * 7331 + 12345);
  const palette = Object.values(COLORS);
  
  // 1. Setup Parameters based on difficulty (index)
  const isHard = index > 50;
  const isVeryHard = index > 150;
  
  const minPathLength = isVeryHard ? 5 : isHard ? 4 : 3;
  const maxPathLength = isVeryHard ? 8 : isHard ? 6 : 5;
  const pathLength = Math.floor(rng.range(minPathLength, maxPathLength));
  
  const baseIntervals = [2000, 3000, 4000];
  if (index > 20) baseIntervals.push(1500, 2500);

  const nodes: GameNode[] = [];
  let currentColor = rng.choice(palette);

  // Helper to check distance
  const isTooClose = (x: number, y: number, excludeId?: string) => {
      const MIN_DIST = 16; // strict 16% padding to prevent overlap
      return nodes.some(n => {
          if (n.id === excludeId) return false;
          const dx = n.x - x;
          const dy = n.y - y;
          return Math.sqrt(dx*dx + dy*dy) < MIN_DIST;
      });
  };

  // 2. Generate the Solution Path (Start -> ... -> End)
  // We walk from a random starting point
  let currentX = rng.range(15, 85);
  let currentY = rng.range(15, 85);

  // Add Start Node
  nodes.push({
      id: `l${index}_start`,
      x: currentX,
      y: currentY,
      type: 'start',
      interval: rng.choice(baseIntervals),
      offset: 0,
      color: currentColor
  });

  // Create the chain
  for (let i = 0; i < pathLength; i++) {
      let validPos = false;
      let nextX = 0, nextY = 0;
      let attempts = 0;

      // Try to find a position that is:
      // a) some distance away from current
      // b) not too close to ANY existing node
      while (!validPos && attempts < 50) {
          const angle = rng.range(0, Math.PI * 2);
          const dist = rng.range(20, 35); // Jump distance
          
          const candX = currentX + Math.cos(angle) * dist;
          const candY = currentY + Math.sin(angle) * dist;

          // Check bounds (10% padding)
          if (candX > 10 && candX < 90 && candY > 10 && candY < 90) {
              if (!isTooClose(candX, candY)) {
                  nextX = candX;
                  nextY = candY;
                  validPos = true;
              }
          }
          attempts++;
      }

      // If we got stuck, break early
      if (!validPos) break;

      // Determine Node Properties
      let type: NodeType = 'basic';
      
      // Prism/Anchor logic
      const roll = rng.next();
      if (index > 15 && roll > 0.85) type = 'prism';
      else if (index > 20 && roll > 0.90) type = 'anchor';

      // Color logic
      const nodeColor = type === 'prism' ? rng.choice(palette.filter(c => c !== currentColor)) : currentColor;
      if (type === 'prism') currentColor = nodeColor;

      nodes.push({
          id: `l${index}_n${i}`,
          x: nextX,
          y: nextY,
          type: type,
          interval: rng.choice(baseIntervals),
          offset: rng.range(0, 2000), // Random offset for timing puzzle
          color: nodeColor
      });

      currentX = nextX;
      currentY = nextY;
  }

  // Convert the last node to 'end'
  if (nodes.length > 1) {
      nodes[nodes.length - 1].type = 'end';
      // Ensure end node has correct color match
      // (The logic above already propagates currentColor, so it should be fine,
      //  but let's double check visually in play)
  }

  // 3. Add Decoys / Branches
  // We want extra nodes that branch OFF the main path but are dead ends.
  // This makes it a puzzle (which way to go?) without random floating debris.
  const decoyCount = isVeryHard ? 3 : isHard ? 2 : 1;
  const pathNodes = [...nodes]; // Snapshot of valid path

  for (let i = 0; i < decoyCount; i++) {
      // Pick a random node from the path to branch from (excluding end)
      const parent = rng.choice(pathNodes.filter(n => n.type !== 'end'));
      
      let validPos = false;
      let dX = 0, dY = 0;
      let attempts = 0;

      while (!validPos && attempts < 50) {
          const angle = rng.range(0, Math.PI * 2);
          const dist = rng.range(20, 30);
          
          const candX = parent.x + Math.cos(angle) * dist;
          const candY = parent.y + Math.sin(angle) * dist;

          if (candX > 10 && candX < 90 && candY > 10 && candY < 90) {
              if (!isTooClose(candX, candY)) {
                  dX = candX;
                  dY = candY;
                  validPos = true;
              }
          }
          attempts++;
      }

      if (validPos) {
          nodes.push({
              id: `l${index}_decoy${i}`,
              x: dX,
              y: dY,
              type: 'basic',
              interval: rng.choice(baseIntervals),
              offset: rng.range(0, 2000),
              color: parent.color // Same color so it LOOKS like a valid path
          });
      }
  }

  const adj = rng.choice(ADJECTIVES);
  const noun = rng.choice(NOUNS);

  return {
    id: `level-${index}`,
    name: `${adj} ${noun}`,
    description: `Sequence ${index + 1}`,
    nodes: nodes
  };
};