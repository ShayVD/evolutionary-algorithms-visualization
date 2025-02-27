import { OptimizationProblem } from '../types';

/**
 * Base abstract class for optimization problems
 */
export abstract class Problem implements OptimizationProblem {
  name: string;
  description: string;
  dimension: number;
  bounds: [number, number][];
  isMinimization: boolean;
  
  constructor(
    name: string,
    description: string,
    dimension: number,
    bounds: [number, number][],
    isMinimization: boolean = true
  ) {
    this.name = name;
    this.description = description;
    this.dimension = dimension;
    this.bounds = bounds;
    this.isMinimization = isMinimization;
  }
  
  /**
   * Evaluate a solution and return its fitness value
   * Must be implemented by specific problem classes
   */
  abstract evaluate(solution: any): number;
  
  /**
   * Generate a random solution within the problem bounds
   */
  generateRandomSolution(): number[] {
    const solution: number[] = [];
    for (let i = 0; i < this.dimension; i++) {
      const [min, max] = this.bounds[i];
      solution.push(min + Math.random() * (max - min));
    }
    return solution;
  }
  
  /**
   * Check if a solution is within the problem bounds
   */
  isInBounds(solution: number[]): boolean {
    if (solution.length !== this.dimension) return false;
    
    for (let i = 0; i < this.dimension; i++) {
      const [min, max] = this.bounds[i];
      if (solution[i] < min || solution[i] > max) return false;
    }
    
    return true;
  }
  
  /**
   * Repair a solution to ensure it is within bounds
   */
  repair(solution: number[]): number[] {
    const repairedSolution = [...solution];
    
    for (let i = 0; i < this.dimension; i++) {
      const [min, max] = this.bounds[i];
      if (repairedSolution[i] < min) repairedSolution[i] = min;
      if (repairedSolution[i] > max) repairedSolution[i] = max;
    }
    
    return repairedSolution;
  }
} 