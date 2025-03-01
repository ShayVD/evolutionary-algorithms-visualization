import { registerFunction } from '../ContinuousFunctions';

/**
 * Sphere function implementation
 * f(x) = Σ x_i²
 * 
 * A simple, continuous, convex, and unimodal function
 * widely used as a benchmark for optimization algorithms.
 */
export function sphereFunction(solution: number[]): number {
  return solution.reduce((sum, xi) => sum + xi * xi, 0);
}

// Register the function with the registry
registerFunction('sphere', sphereFunction); 