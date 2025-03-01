/**
 * Utility functions for visualization and simulation
 */

import { OptimizationProblem } from '../types';
import { createProblemFromConfig } from '../problems/ContinuousFunctions';
import { createAlgorithm as createAlgorithmFromFactory } from '../algorithms/AlgorithmFactory';
import { Algorithm } from '../algorithms/Algorithm';

/**
 * Create an optimization problem instance based on the problem ID
 */
export async function createProblem(problemId: string, dimension: number = 2): Promise<OptimizationProblem | null> {
  // Use the centralized function to create problems from config
  return await createProblemFromConfig(problemId, dimension);
}

/**
 * Create an algorithm instance based on the algorithm ID and problem
 */
export async function createAlgorithm(algorithmId: string, problem: OptimizationProblem): Promise<Algorithm<any> | null> {
  // Map old algorithm IDs to new ones if necessary
  const algorithmIdMap: Record<string, string> = {
    'genetic-algorithm': 'ga',
    'evolution-strategy': 'es',
    'differential-evolution': 'de',
    'particle-swarm': 'pso'
  };
  
  // Use the mapped ID or the original if not in the map
  const mappedId = algorithmIdMap[algorithmId] || algorithmId;
  
  // Use the centralized function to create algorithms from config
  return await createAlgorithmFromFactory(mappedId, problem);
}

/**
 * Map real values to a visualization range
 */
export function mapValueToRange(value: number, fromMin: number, fromMax: number, toMin: number, toMax: number): number {
  return ((value - fromMin) / (fromMax - fromMin)) * (toMax - toMin) + toMin;
}

/**
 * Convert algorithm-specific values to visualization data
 */
export function convertToVisualizationData(data: any, type: string): any {
  // Implement conversion logic based on algorithm and visualization type
  return data;
}

/**
 * Calculate colors for visualizing fitness values
 */
export function getFitnessColor(value: number, min: number, max: number): string {
  // Normalize value between 0 and 1
  const normalizedValue = (value - min) / (max - min);
  
  // Rainbow gradient: Blue (cold) to Red (hot)
  const hue = (1 - normalizedValue) * 240; // 240° is blue, 0° is red
  return `hsl(${hue}, 100%, 50%)`;
}

/**
 * Easing function for smoother animations
 */
export function easeInOutCubic(t: number): number {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Format fitness value for display
 */
export function formatFitness(value: number, isMinimization: boolean): string {
  // For minimization problems, negate the value for display if it's negative
  // (since we convert minimization to maximization internally)
  const displayValue = isMinimization && value < 0 ? -value : value;
  return displayValue.toExponential(4);
}

/**
 * Generate a random color for visualizing individuals in a population
 */
export function getRandomColor(): string {
  return `hsl(${Math.random() * 360}, 70%, 60%)`;
} 