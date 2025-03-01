import { registerFunction } from '../ContinuousFunctions';

/**
 * Ackley function implementation
 * f(x) = -20exp(-0.2√(Σ x_i²/n)) - exp(Σ cos(2πx_i)/n) + 20 + e
 * 
 * A multimodal function characterized by a nearly flat outer region and a large hole at the center.
 * It has many local minima but only one global minimum.
 */
export function ackleyFunction(solution: number[]): number {
  const n = solution.length;
  const sum1 = solution.reduce((sum, xi) => sum + xi * xi, 0);
  const sum2 = solution.reduce((sum, xi) => sum + Math.cos(2 * Math.PI * xi), 0);
  
  return -20 * Math.exp(-0.2 * Math.sqrt(sum1 / n)) - Math.exp(sum2 / n) + 20 + Math.E;
}

// Register the function with the registry
registerFunction('ackley', ackleyFunction); 