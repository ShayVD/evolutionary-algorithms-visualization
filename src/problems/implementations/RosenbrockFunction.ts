import { registerFunction } from '../ContinuousFunctions';

/**
 * Rosenbrock function implementation
 * f(x) = Σ [100(x_{i+1} - x_i²)² + (x_i - 1)²]
 * 
 * A non-convex function with a narrow valley.
 * Finding the valley is trivial, but converging to the global minimum is difficult.
 */
export function rosenbrockFunction(solution: number[]): number {
  let sum = 0;
  for (let i = 0; i < solution.length - 1; i++) {
    sum += 100 * Math.pow(solution[i + 1] - Math.pow(solution[i], 2), 2) + Math.pow(solution[i] - 1, 2);
  }
  return sum;
}

// Register the function with the registry
registerFunction('rosenbrock', rosenbrockFunction); 