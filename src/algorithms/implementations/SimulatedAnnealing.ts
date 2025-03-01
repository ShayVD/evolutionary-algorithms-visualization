import { Algorithm } from '../Algorithm';
import { Individual, AlgorithmParams, AlgorithmStats, SimulatedAnnealingParams } from '../../types';
import { OptimizationProblem } from '../../types';
import { registerAlgorithm } from '../AlgorithmFactory';

/**
 * Simulated Annealing algorithm implementation
 * 
 * Simulated Annealing is a probabilistic technique for approximating the global optimum of a given function.
 * It is inspired by the annealing process in metallurgy, which involves heating and controlled cooling of a material.
 */
export class SimulatedAnnealing implements Algorithm<number[]> {
  private params: SimulatedAnnealingParams;
  private problem: OptimizationProblem;
  private population: Individual<number[]>[] = []; // In SA, we only have one solution, but we use an array for compatibility
  private best: Individual<number[]> | null = null;
  private current: Individual<number[]> | null = null;
  private temperature: number;
  private iteration: number = 0;
  private stats: AlgorithmStats;
  
  constructor(problem: OptimizationProblem) {
    this.problem = problem;
    this.params = {
      populationSize: 1, // SA only maintains one solution
      maxGenerations: 1000,
      initialTemperature: 100.0,
      coolingRate: 0.95,
      neighborhoodSize: 0.1, // Size of neighborhood for generating new solutions
      minTemperature: 0.01 // Minimum temperature for termination
    };
    
    this.temperature = this.params.initialTemperature;
    
    this.stats = {
      currentGeneration: 0,
      bestFitness: 0,
      averageFitness: 0,
      diversityMeasure: 0,
      history: {
        bestFitness: [],
        averageFitness: [],
        diversity: []
      }
    };
  }
  
  /**
   * Initialize the algorithm with custom parameters
   */
  initialize(params: AlgorithmParams): void {
    this.params = { ...this.params, ...params };
    this.temperature = this.params.initialTemperature;
    this.reset();
  }
  
  /**
   * Create an initial solution
   */
  initializePopulation(): Individual<number[]>[] {
    // Generate a random initial solution
    const genotype = this.problem.generateRandomSolution();
    const fitness = this.evaluateFitness(genotype);
    
    this.current = { genotype, fitness };
    this.best = { ...this.current };
    
    // In SA, we only have one solution, but we use an array for compatibility
    this.population = [this.current];
    
    // Initial stats
    this.updateStats();
    
    return this.population;
  }
  
  /**
   * Perform one iteration of the Simulated Annealing algorithm
   */
  step(): void {
    if (!this.current) {
      this.initializePopulation();
      return;
    }
    
    // Generate a neighbor solution
    const neighborGenotype = this.generateNeighbor(this.current.genotype);
    const neighborFitness = this.evaluateFitness(neighborGenotype);
    
    // Calculate acceptance probability
    const acceptanceProbability = this.calculateAcceptanceProbability(
      this.current.fitness,
      neighborFitness
    );
    
    // Decide whether to accept the new solution
    if (Math.random() < acceptanceProbability) {
      this.current = { genotype: neighborGenotype, fitness: neighborFitness };
      this.population[0] = this.current;
      
      // Update best solution if the new solution is better
      if (this.isBetter(neighborFitness, this.best!.fitness)) {
        this.best = { ...this.current };
      }
    }
    
    // Cool down the temperature
    this.temperature *= this.params.coolingRate;
    
    // Update iteration counter and stats
    this.iteration++;
    this.updateStats();
  }
  
  /**
   * Run the algorithm for a specified number of iterations
   */
  run(iterations: number = this.params.maxGenerations): Individual<number[]> {
    if (!this.current) {
      this.initializePopulation();
    }
    
    for (let i = 0; i < iterations; i++) {
      this.step();
      
      if (this.hasConverged()) {
        break;
      }
    }
    
    return this.getBest();
  }
  
  /**
   * Get the current population (in SA, it's just one solution)
   */
  getPopulation(): Individual<number[]>[] {
    return this.population;
  }
  
  /**
   * Get the best solution found so far
   */
  getBest(): Individual<number[]> {
    return this.best!;
  }
  
  /**
   * Get statistics about the current state of the algorithm
   */
  getStats(): AlgorithmStats {
    return this.stats;
  }
  
  /**
   * Reset the algorithm to its initial state
   */
  reset(): void {
    this.population = [];
    this.current = null;
    this.best = null;
    this.temperature = this.params.initialTemperature;
    this.iteration = 0;
    this.stats = {
      currentGeneration: 0,
      bestFitness: 0,
      averageFitness: 0,
      diversityMeasure: 0,
      history: {
        bestFitness: [],
        averageFitness: [],
        diversity: []
      }
    };
  }
  
  /**
   * Set or update algorithm parameters
   */
  setParams(params: AlgorithmParams): void {
    this.params = { ...this.params, ...params };
    this.temperature = this.params.initialTemperature;
  }
  
  /**
   * Check if the algorithm has converged
   */
  hasConverged(): boolean {
    // Check if maximum iterations reached
    if (this.iteration >= this.params.maxGenerations) {
      return true;
    }
    
    // Check if temperature is below minimum
    if (this.temperature < this.params.minTemperature) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Generate a neighbor solution by perturbing the current solution
   */
  private generateNeighbor(solution: number[]): number[] {
    const neighbor = [...solution];
    
    // Perturb each dimension with some probability
    for (let i = 0; i < neighbor.length; i++) {
      if (Math.random() < 0.5) { // 50% chance to modify each dimension
        const range = (this.problem.bounds[i][1] - this.problem.bounds[i][0]);
        const perturbation = (Math.random() * 2 - 1) * range * this.params.neighborhoodSize;
        neighbor[i] += perturbation;
      }
    }
    
    // Ensure the solution is within bounds
    if (this.problem.repair) {
      return this.problem.repair(neighbor);
    } else {
      return this.ensureWithinBounds(neighbor);
    }
  }
  
  /**
   * Ensure a solution is within the problem bounds
   */
  private ensureWithinBounds(solution: number[]): number[] {
    return solution.map((value, index) => {
      const [min, max] = this.problem.bounds[index];
      return Math.max(min, Math.min(max, value));
    });
  }
  
  /**
   * Calculate the probability of accepting a worse solution
   * For better solutions, this always returns 1.0 (100% acceptance)
   */
  private calculateAcceptanceProbability(currentFitness: number, newFitness: number): number {
    // If the new solution is better, always accept it
    if (this.isBetter(newFitness, currentFitness)) {
      return 1.0;
    }
    
    // Calculate the energy difference (delta E)
    const delta = this.problem.isMinimization
      ? newFitness - currentFitness // For minimization
      : currentFitness - newFitness; // For maximization
    
    // Calculate acceptance probability using the Boltzmann distribution
    return Math.exp(-delta / this.temperature);
  }
  
  /**
   * Compare two fitness values based on whether we're minimizing or maximizing
   */
  private isBetter(fitnessA: number, fitnessB: number): boolean {
    if (this.problem.isMinimization) {
      return fitnessA < fitnessB;
    } else {
      return fitnessA > fitnessB;
    }
  }
  
  /**
   * Evaluate the fitness of a solution
   */
  private evaluateFitness(solution: number[]): number {
    return this.problem.evaluate(solution);
  }
  
  /**
   * Update algorithm statistics
   */
  private updateStats(): void {
    if (this.population.length === 0) return;
    
    // In SA, we only have one current solution
    const currentFitness = this.current!.fitness;
    const bestFitness = this.best!.fitness;
    
    // Update stats
    this.stats = {
      currentGeneration: this.iteration,
      bestFitness,
      averageFitness: currentFitness, // In SA, average is just the current solution
      diversityMeasure: 0, // No diversity in SA as we only have one solution
      history: {
        bestFitness: [...this.stats.history.bestFitness, bestFitness],
        averageFitness: [...this.stats.history.averageFitness, currentFitness],
        diversity: [...this.stats.history.diversity, 0]
      }
    };
  }
}

// Register the algorithm with the factory
registerAlgorithm('sa', SimulatedAnnealing); 