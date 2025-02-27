import { Problem } from './Problem';

/**
 * Implementation of the Sphere function
 * f(x) = sum(x_i^2)
 * Global minimum at (0, 0, ..., 0) with f(x) = 0
 */
export class SphereFunction extends Problem {
  constructor(dimension: number = 2) {
    super(
      'Sphere',
      'A simple, continuous, convex, and unimodal function',
      dimension,
      Array(dimension).fill([-5.12, 5.12]),
      true // Minimization problem
    );
  }
  
  evaluate(solution: number[]): number {
    return solution.reduce((sum, value) => sum + value * value, 0);
  }
}

/**
 * Implementation of the Rastrigin function
 * f(x) = 10n + sum(x_i^2 - 10cos(2πx_i))
 * Global minimum at (0, 0, ..., 0) with f(x) = 0
 */
export class RastriginFunction extends Problem {
  constructor(dimension: number = 2) {
    super(
      'Rastrigin',
      'A highly multimodal function with many local minima',
      dimension,
      Array(dimension).fill([-5.12, 5.12]),
      true // Minimization problem
    );
  }
  
  evaluate(solution: number[]): number {
    const n = solution.length;
    let sum = 10 * n;
    
    for (let i = 0; i < n; i++) {
      sum += solution[i] * solution[i] - 10 * Math.cos(2 * Math.PI * solution[i]);
    }
    
    return sum;
  }
}

/**
 * Implementation of the Rosenbrock function
 * f(x) = sum(100(x_{i+1} - x_i^2)^2 + (x_i - 1)^2)
 * Global minimum at (1, 1, ..., 1) with f(x) = 0
 */
export class RosenbrockFunction extends Problem {
  constructor(dimension: number = 2) {
    super(
      'Rosenbrock',
      'A non-convex function with a narrow valley leading to the global minimum',
      dimension,
      Array(dimension).fill([-5, 10]),
      true // Minimization problem
    );
  }
  
  evaluate(solution: number[]): number {
    let sum = 0;
    
    for (let i = 0; i < this.dimension - 1; i++) {
      const term1 = 100 * Math.pow(solution[i + 1] - Math.pow(solution[i], 2), 2);
      const term2 = Math.pow(solution[i] - 1, 2);
      sum += term1 + term2;
    }
    
    return sum;
  }
}

/**
 * Implementation of the Ackley function
 * f(x) = -20exp(-0.2sqrt(1/n sum(x_i^2))) - exp(1/n sum(cos(2πx_i))) + 20 + e
 * Global minimum at (0, 0, ..., 0) with f(x) = 0
 */
export class AckleyFunction extends Problem {
  constructor(dimension: number = 2) {
    super(
      'Ackley',
      'A multimodal function with many local minima and a global minimum',
      dimension,
      Array(dimension).fill([-32.768, 32.768]),
      true // Minimization problem
    );
  }
  
  evaluate(solution: number[]): number {
    const n = solution.length;
    let sum1 = 0;
    let sum2 = 0;
    
    for (let i = 0; i < n; i++) {
      sum1 += solution[i] * solution[i];
      sum2 += Math.cos(2 * Math.PI * solution[i]);
    }
    
    const term1 = -20 * Math.exp(-0.2 * Math.sqrt(sum1 / n));
    const term2 = -Math.exp(sum2 / n);
    
    return term1 + term2 + 20 + Math.E;
  }
}

/**
 * Implementation of Schwefel's Problem 2.22
 * f(x) = sum(|x_i|) + prod(|x_i|)
 * Global minimum at (0, 0, ..., 0) with f(x) = 0
 */
export class SchwefelProblem222 extends Problem {
  constructor(dimension: number = 2) {
    super(
      'Schwefel 2.22',
      'A unimodal function that combines sum and product of absolute values',
      dimension,
      Array(dimension).fill([-10, 10]),
      true // Minimization problem
    );
  }
  
  evaluate(solution: number[]): number {
    let sum = 0;
    let product = 1;
    
    for (let i = 0; i < this.dimension; i++) {
      const absValue = Math.abs(solution[i]);
      sum += absValue;
      product *= absValue;
    }
    
    return sum + product;
  }
} 