import { registerFunction } from '../ContinuousFunctions';

/**
 * Rastrigin function implementation
 * f(x) = 10n + Σ [x_i² - 10cos(2πx_i)]
 * 
 * A highly multimodal function with many local minima,
 * making it challenging for optimization algorithms to find the global optimum.
 */
export function rastriginFunction(solution: number[]): number {
  const n = solution.length;
  return 10 * n + solution.reduce((sum, xi) => sum + (xi * xi - 10 * Math.cos(2 * Math.PI * xi)), 0);
}

// Register the function with the registry
registerFunction('rastrigin', rastriginFunction); 