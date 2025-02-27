/**
 * Utility functions for visualization and simulation
 */

import { OptimizationProblem } from '../types';
import { SphereFunction, RastriginFunction, RosenbrockFunction, AckleyFunction, SchwefelProblem222 } from '../problems/ContinuousFunctions';
import { GeneticAlgorithm } from '../algorithms/GeneticAlgorithm';
import { EvolutionStrategy } from '../algorithms/EvolutionStrategy';
import { DifferentialEvolution } from '../algorithms/DifferentialEvolution';
import { ParticleSwarmOptimization } from '../algorithms/ParticleSwarmOptimization';
import { Algorithm } from '../algorithms/Algorithm';

/**
 * Create an optimization problem instance based on the problem ID
 */
export function createProblem(problemId: string, dimension: number = 2): OptimizationProblem | null {
  switch (problemId) {
    case 'sphere':
      return new SphereFunction(dimension);
    case 'rastrigin':
      return new RastriginFunction(dimension);
    case 'rosenbrock':
      return new RosenbrockFunction(dimension);
    case 'ackley':
      return new AckleyFunction(dimension);
    case 'schwefel222':
      return new SchwefelProblem222(dimension);
    default:
      return null;
  }
}

/**
 * Create an algorithm instance based on the algorithm ID and problem
 */
export function createAlgorithm(algorithmId: string, problem: OptimizationProblem): Algorithm<any> | null {
  switch (algorithmId) {
    case 'genetic-algorithm':
      return new GeneticAlgorithm(problem);
    case 'evolution-strategy':
      return new EvolutionStrategy(problem);
    case 'differential-evolution':
      return new DifferentialEvolution(problem);
    case 'particle-swarm':
      return new ParticleSwarmOptimization(problem);
    // Other algorithms would be added here as they are implemented
    default:
      return null;
  }
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