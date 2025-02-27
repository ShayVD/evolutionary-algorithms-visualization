import { Individual, AlgorithmParams, AlgorithmStats } from '../types';

/**
 * Base interface for all evolutionary algorithms
 * T represents the genotype type (e.g., binary string, real vector, etc.)
 */
export interface Algorithm<T> {
  // Initialize the algorithm with parameters and problem definition
  initialize: (params: AlgorithmParams) => void;
  
  // Create an initial population
  initializePopulation: () => Individual<T>[];
  
  // Perform one generation/iteration of the algorithm
  step: () => void;
  
  // Run the algorithm for a specified number of generations or until convergence
  run: (generations?: number) => Individual<T>;
  
  // Get the current population
  getPopulation: () => Individual<T>[];
  
  // Get the best individual found so far
  getBest: () => Individual<T>;
  
  // Get statistics about the current state of the algorithm
  getStats: () => AlgorithmStats;
  
  // Reset the algorithm to its initial state
  reset: () => void;
  
  // Set or update algorithm parameters
  setParams: (params: AlgorithmParams) => void;
  
  // Check if the algorithm has converged based on criteria
  hasConverged: () => boolean;
} 