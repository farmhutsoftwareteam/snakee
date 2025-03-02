// utils/types.ts
export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Position {
  x: number;
  y: number;
}

export type FoodType = 'regular' | 'bonus' | 'speed' | 'slow';

export interface Food {
  position: Position;
  type: FoodType;
  value: number;
}

export interface LevelConfig {
  id: number;
  speed: number;
  hasWalls: boolean;
  obstacles: Position[];
  initialSnakePosition: Position[];
  initialFoodPosition: Position;
  specialFoodFrequency: number;
  requiredScore: number;
}

export interface GameState {
  snake: Position[];
  food: Food;
  direction: Direction;
  nextDirection: Direction;
  score: number;
  level: number;
  isGameOver: boolean;
  isPaused: boolean;
  obstacles: Position[];
}

export interface CollisionResult {
  collided: boolean;
  type: 'none' | 'self' | 'wall' | 'obstacle' | 'food';
  position?: Position;
  foodType?: FoodType;
}