import { registerFunction } from '../ContinuousFunctions';

/**
 * Schwefel Problem 2.22 function implementation
 * f(x) = Σ |x_i| + Π |x_i|
 * 
 * A unimodal function that combines the sum and product of absolute values,
 * providing a unique optimization challenge.
 */
export function schwefel222Function(solution: number[]): number {
  let sum = 0;
  let product = 1;
  
  for (const xi of solution) {
    const absXi = Math.abs(xi);
    sum += absXi;
    product *= absXi;
  }
  
  return sum + product;
}

// Register the function with the registry
registerFunction('schwefel222', schwefel222Function); 