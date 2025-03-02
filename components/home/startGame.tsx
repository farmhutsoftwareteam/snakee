import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, SafeAreaView } from "react-native";
import GameBoard from "../game/gameBoard";
import { Direction, Position } from "../game/snake";
import { FoodType, generateFood } from "../game/food";
import { 
  checkAllCollisions, 
  getNewHead, 
  handleCollisionEffect,
  CollisionResult
} from "../../utils/collision";

interface StartGameProps {
  onStartGame: () => void;
}

const GRID_SIZE = 20;
const CELL_SIZE = 15;
const GAME_SPEED = 150; // milliseconds between moves

// Predefined food positions in sequence
const PREDEFINED_FOOD_POSITIONS: Position[] = [
  { x: 10, y: 10 },  // First food
  { x: 15, y: 5 },   // Second food
  { x: 15, y: 15 },  // Third food
  { x: 5, y: 15 },   // Fourth food
  { x: 5, y: 5 },    // Fifth food
  { x: 10, y: 3 },   // Sixth food
  { x: 17, y: 10 },  // Seventh food
  { x: 10, y: 17 },  // Eighth food
  { x: 3, y: 10 },   // Ninth food
  { x: 10, y: 10 },  // Tenth food (back to center)
];

const DEMO_FOOD_LIMIT = PREDEFINED_FOOD_POSITIONS.length; // Reset after eating all predefined food

const StartGameScreen: React.FC<StartGameProps> = ({ onStartGame }) => {
  // Snake state
  const [snake, setSnake] = useState<Position[]>([
    { x: 5, y: 5 },
    { x: 4, y: 5 },
    { x: 3, y: 5 }
  ]);
  const [food, setFood] = useState({
    position: { x: 10, y: 10 },
    type: 'regular' as FoodType,
    value: 1
  });
  const [direction, setDirection] = useState<Direction>('right');
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(GAME_SPEED);
  const [foodEatenCount, setFoodEatenCount] = useState(0); // Track food eaten for demo reset
  const [currentFoodIndex, setCurrentFoodIndex] = useState(0);
  
  // Animation refs
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  const requestAnimationFrameRef = useRef<number>(0);
  
  // Add these refs to track game state outside of React's state system
  const currentFoodIndexRef = useRef(0);
  const currentFoodPositionRef = useRef(PREDEFINED_FOOD_POSITIONS[0]);
  const snakeRef = useRef<Position[]>([
    { x: 5, y: 5 },
    { x: 4, y: 5 },
    { x: 3, y: 5 }
  ]);
  
  // Initialize game
  useEffect(() => {
    placeFood();
    startGameLoop();
    
    return () => {
      if (gameLoopRef.current) clearTimeout(gameLoopRef.current);
      if (requestAnimationFrameRef.current) cancelAnimationFrame(requestAnimationFrameRef.current);
    };
  }, []);
  
  // Reset demo when food limit is reached or game over
  useEffect(() => {
    if (foodEatenCount >= DEMO_FOOD_LIMIT || isGameOver) {
      setTimeout(() => {
        resetDemo();
      }, 1000); // Brief pause before reset
    }
  }, [foodEatenCount, isGameOver]);
  
  // Game loop
  const startGameLoop = () => {
    const gameLoop = (timestamp: number) => {
      if (!lastUpdateTimeRef.current || timestamp - lastUpdateTimeRef.current >= speed) {
        updateGame();
        lastUpdateTimeRef.current = timestamp;
      }
      requestAnimationFrameRef.current = requestAnimationFrame(gameLoop);
    };
    requestAnimationFrameRef.current = requestAnimationFrame(gameLoop);
  };
  
  // Reset demo state
  const resetDemo = () => {
    const initialSnake = [
      { x: 5, y: 5 },
      { x: 4, y: 5 },
      { x: 3, y: 5 }
    ];
    
    // Reset refs
    currentFoodIndexRef.current = 0;
    currentFoodPositionRef.current = PREDEFINED_FOOD_POSITIONS[0];
    snakeRef.current = initialSnake;
    
    // Reset state
    setSnake(initialSnake);
    setDirection('right');
    setIsGameOver(false);
    setScore(0);
    setSpeed(GAME_SPEED);
    setFoodEatenCount(0);
    setFood({
      position: PREDEFINED_FOOD_POSITIONS[0],
      type: 'regular' as FoodType,
      value: 1
    });
  };
  
  // Place food at predetermined positions
  const placeFood = () => {
    const foodPosition = PREDEFINED_FOOD_POSITIONS[currentFoodIndex];
    setFood({
      position: foodPosition,
      type: 'regular' as FoodType,
      value: 1
    });
    
  };
  
  // Function to check if a position is occupied by the snake's body
  const isSafePosition = (position: Position, snake: Position[]): boolean => {
    return !snake.some(segment => segment.x === position.x && segment.y === position.y);
  };

  // Function to calculate Manhattan distance between two positions
  const getDistance = (pos1: Position, pos2: Position): number => {
    return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
  };

  // Simplified direction finding that always moves toward food
  const getDirectionToFood = (head: Position, foodPos: Position, snake: Position[], currentDir: Direction): Direction => {
    // Calculate direct distances
    let dx = foodPos.x - head.x;
    let dy = foodPos.y - head.y;
    
    // Handle wrapping for shortest path
    if (Math.abs(dx) > GRID_SIZE / 2) {
      dx = dx > 0 ? dx - GRID_SIZE : dx + GRID_SIZE;
    }
    
    if (Math.abs(dy) > GRID_SIZE / 2) {
      dy = dy > 0 ? dy - GRID_SIZE : dy + GRID_SIZE;
    }
    
    const opposites: Record<Direction, Direction> = {
      'up': 'down',
      'down': 'up',
      'left': 'right',
      'right': 'left'
    };
    
    // IMPORTANT: Always try horizontal movement first to avoid vertical traps
    // This is the key change to prevent getting stuck in vertical lines
    if (dx !== 0) {
      const horizontalDir = dx > 0 ? 'right' : 'left';
      if (horizontalDir !== opposites[currentDir]) {
        const newHead = getNewHead(head, horizontalDir, GRID_SIZE, false);
        const wouldCollide = snake.slice(0, -1).some(segment => 
          segment.x === newHead.x && segment.y === newHead.y
        );
        if (!wouldCollide) {
          return horizontalDir;
        }
      }
    }
    
    // Then try vertical movement
    if (dy !== 0) {
      const verticalDir = dy > 0 ? 'down' : 'up';
      if (verticalDir !== opposites[currentDir]) {
        const newHead = getNewHead(head, verticalDir, GRID_SIZE, false);
        const wouldCollide = snake.slice(0, -1).some(segment => 
          segment.x === newHead.x && segment.y === newHead.y
        );
        if (!wouldCollide) {
          return verticalDir;
        }
      }
    }
    
    // Try any safe direction if direct paths are blocked
    const allDirections: Direction[] = ['up', 'right', 'down', 'left'];
    for (const dir of allDirections) {
      if (dir !== opposites[currentDir]) {
        const newHead = getNewHead(head, dir, GRID_SIZE, false);
        const wouldCollide = snake.slice(0, -1).some(segment => 
          segment.x === newHead.x && segment.y === newHead.y
        );
        if (!wouldCollide) {
          return dir;
        }
      }
    }
    
    // If all else fails, keep current direction
    return currentDir;
  };

  // Improved update function
  const updateGame = () => {
    if (isGameOver) return;
    
    // Get current state from refs
    const currentSnake = [...snakeRef.current];
    const head = currentSnake[0];
    const foodPos = currentFoodPositionRef.current;
    
    // Get direction to food
    const newDirection = getDirectionToFood(head, foodPos, currentSnake, direction);
    
    // Update direction state if needed
    if (newDirection !== direction) {
      setDirection(newDirection);
    }
    
    // Move snake
    const newHead = getNewHead(head, newDirection, GRID_SIZE, false);
    
    // Check for food collision
    const ateFood = newHead.x === foodPos.x && newHead.y === foodPos.y;
    
    //console.log(`Snake head: (${newHead.x}, ${newHead.y}), Food: (${foodPos.x}, ${foodPos.y}), Ate food: ${ateFood}`);
    
    let newSnake: Position[];
    
    if (ateFood) {
      // Snake grows
      newSnake = [newHead, ...currentSnake];
      
      // Update food index and position
      const nextFoodIndex = (currentFoodIndexRef.current + 1) % PREDEFINED_FOOD_POSITIONS.length;
      const nextFoodPosition = PREDEFINED_FOOD_POSITIONS[nextFoodIndex];
      
      // Update refs immediately
      currentFoodIndexRef.current = nextFoodIndex;
      currentFoodPositionRef.current = nextFoodPosition;
      
      // Update React state for rendering
      setScore(prev => prev + 1);
      setFoodEatenCount(prev => prev + 1);
      setCurrentFoodIndex(nextFoodIndex);
      setFood({
        position: nextFoodPosition,
        type: 'regular' as FoodType,
        value: 1
      });
      
      //console.log(`Snake ate food! New length: ${newSnake.length}, Moving to food #${nextFoodIndex + 1} at (${nextFoodPosition.x}, ${nextFoodPosition.y})`);
    } else {
      // No collision, just move normally
      newSnake = [newHead, ...currentSnake.slice(0, -1)];
    }
    
    // Update snake ref and state
    snakeRef.current = newSnake;
    setSnake(newSnake);
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>SNAKE</Text>
      </View>
      
      <View style={styles.gameBoardContainer}>
        <GameBoard 
          gridSize={GRID_SIZE}
          cellSize={CELL_SIZE}
          snake={snake}
          food={food}
          isGameOver={isGameOver}
          isDemo={true}
        />
      </View>
      
      <View style={styles.bottomContainer}>
        <View style={styles.pixelArt}>
          <View style={styles.snakePixel}></View>
          <View style={styles.snakePixel}></View>
          <View style={styles.snakePixel}></View>
        </View>
        
        <TouchableOpacity 
          style={styles.startButton} 
          onPress={onStartGame}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>START GAME</Text>
        </TouchableOpacity>
        
       
      </View>
    </SafeAreaView>
  );
};

// Styles remain unchanged
const { width, height } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleContainer: {
    paddingTop: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#00FF00',
    letterSpacing: 10,
    textShadowColor: '#00FF00',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  gameBoardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomContainer: {
    alignItems: 'center',
    paddingBottom: 40,
    width: '100%',
  },
  pixelArt: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  snakePixel: {
    width: 20,
    height: 20,
    backgroundColor: '#00FF00',
    margin: 2,
    borderRadius: 2,
  },
  startButton: {
    backgroundColor: '#00FF00',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 5,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#00AA00',
  },
  buttonText: {
    color: '#000',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  instructions: {
    color: '#00FF00',
    fontSize: 16,
    marginTop: 10,
  },
  scoreText: {
    color: '#00FF00',
    fontSize: 14,
    marginTop: 10,
  }
});

export default StartGameScreen;
