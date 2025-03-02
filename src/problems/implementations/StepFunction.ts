import { registerFunction } from '../ContinuousFunctions';

/**
 * Step Function implementation
 * f(x) = Σ (|x_i + 0.5|)^2
 * 
 * A function with a minimum value at f(p) = 0, -0.5 <= p <= 0.5
 * Domain: -100 -> 100
 * Minimum value: f(p) = 0, -0.5 <= p <= 0.5
 */
export function stepFunction(solution: number[]): number {
  return solution.reduce((sum, xi) => sum + Math.pow(Math.abs(xi + 0.5), 2), 0);
}

// Register the function with the registry
registerFunction('step', stepFunction); 