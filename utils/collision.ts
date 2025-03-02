import { Position } from "../components/game/snake";
import { FoodType } from "../components/game/food";

// Types of game objects that can be collided with
export type CollisionObjectType = 'food' | 'wall' | 'snake' | 'obstacle';

// Result of a collision check
export interface CollisionResult {
  hasCollided: boolean;
  type?: CollisionObjectType;
  effect?: 'grow' | 'die' | 'speedUp' | 'slowDown' | 'scoreBonus' | 'none';
  value?: number;
}

/**
 * Check if snake has collided with itself
 */
export const checkSelfCollision = (snake: Position[]): CollisionResult => {
  const head = snake[0];
  const hasCollided = snake.some((segment, index) => 
    index !== 0 && segment.x === head.x && segment.y === head.y
  );
  
  return {
    hasCollided,
    type: 'snake',
    effect: hasCollided ? 'die' : 'none'
  };
};

/**
 * Check if snake has collided with a wall
 */
export const checkWallCollision = (
  head: Position, 
  gridSize: number, 
  hasWalls: boolean = false
): CollisionResult => {
  // If walls are disabled, no collision will occur (snake wraps around)
  if (!hasWalls) {
    return { hasCollided: false };
  }
  
  const hasCollided = 
    head.x < 0 || 
    head.x >= gridSize || 
    head.y < 0 || 
    head.y >= gridSize;
    
  return {
    hasCollided,
    type: 'wall',
    effect: hasCollided ? 'die' : 'none'
  };
};

/**
 * Check if snake has collided with food
 */
export const checkFoodCollision = (
  head: Position, 
  food: { position: Position, type: FoodType, value: number }
): CollisionResult => {
  const hasCollided = head.x === food.position.x && head.y === food.position.y;
  
  let effect: 'grow' | 'die' | 'speedUp' | 'slowDown' | 'scoreBonus' | 'none' = 'grow';
  let value = food.value;
  
  // Determine effect based on food type
  if (hasCollided) {
    switch (food.type) {
      case 'regular':
        effect = 'grow';
        value = 1;
        break;
      case 'bonus':
        effect = 'grow';
        value = 3;
        break;
      case 'speed':
        effect = 'speedUp';
        value = 1;
        break;
      case 'slow':
        effect = 'slowDown';
        value = 1;
        break;
      case 'danger':
        effect = 'die';
        value = 0;
        break;
    }
  }
  
  return {
    hasCollided,
    type: 'food',
    effect: hasCollided ? effect : 'none',
    value
  };
};

/**
 * Check if snake has collided with an obstacle
 */
export const checkObstacleCollision = (
  head: Position, 
  obstacles: Position[]
): CollisionResult => {
  const hasCollided = obstacles.some(
    obstacle => obstacle.x === head.x && obstacle.y === head.y
  );
  
  return {
    hasCollided,
    type: 'obstacle',
    effect: hasCollided ? 'die' : 'none'
  };
};

/**
 * Check all possible collisions in one function
 */
export const checkAllCollisions = (
  snake: Position[],
  food: { position: Position, type: FoodType, value: number },
  gridSize: number,
  hasWalls: boolean = false,
  obstacles: Position[] = []
): CollisionResult => {
  const head = snake[0];
  
  // Check wall collision if walls are enabled
  const wallCollision = checkWallCollision(head, gridSize, hasWalls);
  if (wallCollision.hasCollided) {
    return wallCollision;
  }
  
  // Check self collision
  const selfCollision = checkSelfCollision(snake);
  if (selfCollision.hasCollided) {
    return selfCollision;
  }
  
  // Check obstacle collision
  const obstacleCollision = checkObstacleCollision(head, obstacles);
  if (obstacleCollision.hasCollided) {
    return obstacleCollision;
  }
  
  // Check food collision
  const foodCollision = checkFoodCollision(head, food);
  if (foodCollision.hasCollided) {
    return foodCollision;
  }
  
  // No collision
  return { hasCollided: false };
};

/**
 * Get new head position based on current head and direction
 */
export const getNewHead = (
  head: Position, 
  direction: 'up' | 'down' | 'left' | 'right', 
  gridSize: number,
  hasWalls: boolean = false
): Position => {
  let newHead: Position;
  
  switch (direction) {
    case 'up':
      newHead = { 
        x: head.x, 
        y: hasWalls ? head.y - 1 : (head.y - 1 + gridSize) % gridSize 
      };
      break;
    case 'down':
      newHead = { 
        x: head.x, 
        y: hasWalls ? head.y + 1 : (head.y + 1) % gridSize 
      };
      break;
    case 'left':
      newHead = { 
        x: hasWalls ? head.x - 1 : (head.x - 1 + gridSize) % gridSize, 
        y: head.y 
      };
      break;
    case 'right':
      newHead = { 
        x: hasWalls ? head.x + 1 : (head.x + 1) % gridSize, 
        y: head.y 
      };
      break;
  }
  
  return newHead;
};

/**
 * Handle the effect of a collision
 */
export const handleCollisionEffect = (
  result: CollisionResult,
  snake: Position[],
  score: number,
  speed: number
): { 
  newSnake: Position[], 
  newScore: number, 
  newSpeed: number, 
  isGameOver: boolean 
} => {
  let newSnake = [...snake];
  let newScore = score;
  let newSpeed = speed;
  let isGameOver = false;
  
  if (result.hasCollided) {
    switch (result.effect) {
      case 'grow':
        // Add segments based on value (default to 1)
        const growBy = result.value || 1;
        for (let i = 0; i < growBy; i++) {
          // Add a new segment at the end of the snake
          const tail = newSnake[newSnake.length - 1];
          newSnake.push({ ...tail });
        }
        // Increase score
        newScore += result.value || 1;
        break;
        
      case 'speedUp':
        // Decrease the delay between moves (making the snake faster)
        newSpeed = Math.max(speed * 0.8, 50); // Limit minimum speed
        newScore += result.value || 1;
        break;
        
      case 'slowDown':
        // Increase the delay between moves (making the snake slower)
        newSpeed = Math.min(speed * 1.2, 300); // Limit maximum speed
        newScore += result.value || 1;
        break;
        
      case 'scoreBonus':
        // Just add to score without growing
        newScore += result.value || 5;
        break;
        
      case 'die':
        isGameOver = true;
        break;
        
      case 'none':
      default:
        // No effect
        break;
    }
  }
  
  return { newSnake, newScore, newSpeed, isGameOver };
};