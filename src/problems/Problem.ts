import { OptimizationProblem } from '../types';

/**
 * Base Problem class that all optimization problems inherit from
 */
export class Problem implements OptimizationProblem {
  id: string;
  name: string;
  description: string;
  dimension: number;
  bounds: [number, number][];
  isMinimization: boolean;

  constructor(
    id: string,
    name: string,
    description: string,
    dimension: number,
    bounds: [number, number][],
    isMinimization: boolean
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.dimension = dimension;
    this.bounds = bounds;
    this.isMinimization = isMinimization;
  }

  evaluate(solution: number[]): number {
    if (solution.length !== this.dimension) {
      throw new Error(`Solution dimension (${solution.length}) does not match problem dimension (${this.dimension})`);
    }
    
    // This is a base implementation that should be overridden by subclasses
    throw new Error('evaluate() method must be implemented by subclasses');
  }
  
  generateRandomSolution(): number[] {
    return this.bounds.map(([min, max]) => min + Math.random() * (max - min));
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