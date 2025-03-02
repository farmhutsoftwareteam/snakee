// utils/constants.ts
import { LevelConfig } from '../types/index';

export const GRID_SIZE = 20;
export const CELL_SIZE = 15;
export const BASE_GAME_SPEED = 150; // milliseconds between moves

export const PREDEFINED_LEVELS: LevelConfig[] = [
  // Level 1 - No obstacles
  {
    id: 1,
    speed: BASE_GAME_SPEED,
    hasWalls: false,
    obstacles: [],
    initialSnakePosition: [
      { x: 5, y: 5 },
      { x: 4, y: 5 },
      { x: 3, y: 5 }
    ],
    initialFoodPosition: { x: 10, y: 10 },
    specialFoodFrequency: 0.1,
    requiredScore: 5
  },
  
  // Level 2 - Simple obstacles
  {
    id: 2,
    speed: BASE_GAME_SPEED - 10,
    hasWalls: false,
    obstacles: [
      { x: 10, y: 5 },
      { x: 10, y: 6 },
      { x: 10, y: 7 }
    ],
    initialSnakePosition: [
      { x: 5, y: 5 },
      { x: 4, y: 5 },
      { x: 3, y: 5 }
    ],
    initialFoodPosition: { x: 15, y: 10 },
    specialFoodFrequency: 0.2,
    requiredScore: 10
  },
  
  // Add more predefined levels...
];

export const FOOD_TYPES = {
  regular: {
    color: '#FF0000',
    value: 1,
    speedChange: 0
  },
  bonus: {
    color: '#FFFF00',
    value: 3,
    speedChange: 0
  },
  speed: {
    color: '#00FFFF',
    value: 1,
    speedChange: -20 // Makes game faster
  },
  slow: {
    color: '#FF00FF',
    value: 1,
    speedChange: 20 // Makes game slower
  }
};