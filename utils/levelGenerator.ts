// utils/levelGenerator.ts
import { Position, LevelConfig } from '../types/index';
import { GRID_SIZE, BASE_GAME_SPEED, PREDEFINED_LEVELS } from '../constants/constants';

export const getLevel = (level: number): LevelConfig => {
  // Use predefined level if available
  if (level <= PREDEFINED_LEVELS.length) {
    return PREDEFINED_LEVELS[level - 1];
  }
  
  // Otherwise generate a procedural level
  return generateProceduralLevel(level);
};

const generateProceduralLevel = (level: number): LevelConfig => {
  const obstacleCount = Math.floor(level / 2) + 2;
  
  // Generate initial snake position
  const initialSnakePosition = [
    { x: 5, y: 5 },
    { x: 4, y: 5 },
    { x: 3, y: 5 }
  ];
  
  // Generate initial food position
  const initialFoodPosition = {
    x: Math.floor(Math.random() * GRID_SIZE),
    y: Math.floor(Math.random() * GRID_SIZE)
  };
  
  // Generate obstacles
  const obstacles: Position[] = [];
  for (let i = 0; i < obstacleCount; i++) {
    let position: Position = { x: 0, y: 0 };
    let isValid = false;
    
    while (!isValid) {
      position = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
      
      // Check if position is valid (not on snake or food)
      isValid = !initialSnakePosition.some(segment => 
        segment.x === position.x && segment.y === position.y
      ) && 
      !(initialFoodPosition.x === position.x && initialFoodPosition.y === position.y) &&
      !obstacles.some(obs => obs.x === position.x && obs.y === position.y);
    }
    
    obstacles.push(position);
  }
  
  return {
    id: level,
    speed: Math.max(50, BASE_GAME_SPEED - (level * 5)),
    hasWalls: level > 3,
    obstacles,
    initialSnakePosition,
    initialFoodPosition,
    specialFoodFrequency: Math.min(0.8, 0.1 + (level * 0.05)),
    requiredScore: level * 5
  };
};