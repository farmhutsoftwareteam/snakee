// utils/gameEngine.ts
import { GameState, Position, Direction, Food } from '../types/index';
import { getLevel } from './levelGenerator';
import { getNewHead, checkAllCollisions, CollisionResult } from './collision';
import { GRID_SIZE, FOOD_TYPES } from '../constants/constants';

export const initializeGame = (level: number = 1): GameState => {
  const levelConfig = getLevel(level);
  
  return {
    snake: [...levelConfig.initialSnakePosition],
    food: {
      position: levelConfig.initialFoodPosition,
      type: 'regular',
      value: 1
    },
    direction: 'right',
    nextDirection: 'right',
    score: 0,
    level,
    isGameOver: false,
    isPaused: false,
    obstacles: levelConfig.obstacles
  };
};

export const updateGameState = (state: GameState): GameState => {
  if (state.isGameOver || state.isPaused) {
    return state;
  }
  
  const levelConfig = getLevel(state.level);
  const head = state.snake[0];
  
  // Update direction from nextDirection
  const direction = state.nextDirection;
  
  // Calculate new head position
  const newHead = getNewHead(head, direction, GRID_SIZE, levelConfig.hasWalls);
  
  // Check for collisions
  const collisionResult = checkAllCollisions(
    state.snake,
    state.food,
    GRID_SIZE,
    levelConfig.hasWalls,
    state.obstacles
  );
  
  // Handle collision results
  return handleCollision(state, newHead, collisionResult, direction);
};

const handleCollision = (
  state: GameState,
  newHead: Position,
  collision: CollisionResult,
  direction: Direction
): GameState => {
  // Game over conditions
  if (collision.type === 'wall' || collision.type === 'snake' || collision.type === 'obstacle') {
    return {
      ...state,
      isGameOver: true
    };
  }
  
  // Food collision
  if (collision.type === 'food' && collision.hasCollided) {
    const foodType = collision.effect === 'grow' ? 'regular' : 'bonus';
    const foodValue = FOOD_TYPES[foodType].value;
    const newScore = state.score + foodValue;
    
    // Check for level completion
    const levelConfig = getLevel(state.level);
    const levelCompleted = newScore >= levelConfig.requiredScore;
    
    // Generate new food
    const newFood = generateFood(state.snake, state.obstacles, levelConfig);
    
    // Create new snake with added length
    const newSnake = [newHead, ...state.snake];
    
    return {
      ...state,
      snake: newSnake,
      food: newFood,
      score: newScore,
      level: levelCompleted ? state.level + 1 : state.level,
      direction
    };
  }
  
  // Normal movement (no collision)
  const newSnake = [newHead, ...state.snake.slice(0, -1)];
  
  return {
    ...state,
    snake: newSnake,
    direction
  };
};

const generateFood = (
  snake: Position[],
  obstacles: Position[],
  levelConfig: any
): Food => {
  let position: Position = { x: 0, y: 0 };
  let isValid = false;
  
  while (!isValid) {
    position = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    };
    
    // Check if position is valid (not on snake or obstacles)
    isValid = !snake.some(segment => 
      segment.x === position.x && segment.y === position.y
    ) && 
    !obstacles.some(obstacle => 
      obstacle.x === position.x && obstacle.y === position.y
    );
  }
  
  // Determine food type based on level config
  const isSpecialFood = Math.random() < levelConfig.specialFoodFrequency;
  let foodType: 'regular' | 'bonus' | 'speed' | 'slow' = 'regular';
  
  if (isSpecialFood) {
    const specialTypes: ('bonus' | 'speed' | 'slow')[] = ['bonus', 'speed', 'slow'];
    foodType = specialTypes[Math.floor(Math.random() * specialTypes.length)];
  }
  
  return {
    position,
    type: foodType,
    value: FOOD_TYPES[foodType].value
  };
};

// Add to the existing type, don't replace it
export type CollisionObjectType = 'food' | 'wall' | 'snake' | 'obstacle' | 'portal';

// Add a new function without modifying existing ones
export const checkPortalCollision = (
  head: Position,
  portals: { entry: Position, exit: Position }[]
): { hasCollided: boolean, exitPortal?: Position } => {
  // Implementation
  return { hasCollided: false };
};