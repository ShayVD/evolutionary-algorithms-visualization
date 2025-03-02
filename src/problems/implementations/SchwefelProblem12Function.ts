import { registerFunction } from '../ContinuousFunctions';

/**
 * Schwefel's Problem 1.2 implementation
 * f(x) = Σ (Σ x_j)²
 * 
 * A continuous, unimodal function that challenges algorithms with its non-separability,
 * as the variables have complex interdependencies.
 * Domain: -100 -> 100
 * Minimum value: f(0) = 0
 */
export function schwefelProblem12Function(solution: number[]): number {
  let sum = 0;
  for (let i = 0; i < solution.length; i++) {
    let secondsum = 0;
    for (let j = 0; j <= i; j++) {
      secondsum += solution[j];
    }
    sum += Math.pow(secondsum, 2);
  }
  return sum;
}

// Register the function with the registry
registerFunction('schwefel12', schwefelProblem12Function); 