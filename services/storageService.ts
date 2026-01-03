const STORAGE_KEY = 'pulse_path_progress';

export interface LevelProgress {
  [levelIndex: number]: number; // 0 = unplayed, 1-3 = stars
}

export const saveProgress = (progress: LevelProgress) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error("Failed to save progress", e);
  }
};

export const loadProgress = (): LevelProgress => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error("Failed to load progress", e);
    return {};
  }
};