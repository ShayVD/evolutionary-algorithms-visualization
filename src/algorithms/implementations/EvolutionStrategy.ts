import { Algorithm } from '../Algorithm';
import { Individual, AlgorithmParams, AlgorithmStats, EvolutionStrategyParams } from '../../types';
import { OptimizationProblem } from '../../types';
import { registerAlgorithm } from '../AlgorithmFactory';

/**
 * Evolution Strategy implementation for continuous optimization
 * Implements a (μ,λ) or (μ+λ) Evolution Strategy
 */
export class EvolutionStrategy implements Algorithm<number[]> {
  private params: EvolutionStrategyParams;
  private problem: OptimizationProblem;
  private population: Individual<number[]>[] = [];
  private best: Individual<number[]> | null = null;
  private generation: number = 0;
  private stats: AlgorithmStats;
  private stepSizes: number[] = [];
  
  constructor(problem: OptimizationProblem) {
    this.problem = problem;
    this.params = {
      populationSize: 50,
      maxGenerations: 100,
      mu: 10, // Number of parents
      lambda: 40, // Number of offspring
      selectionType: 'plus', // (μ+λ) selection by default
      initialStepSize: 0.1
    };
    
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
    // Keep mu synchronized with populationSize if it's specified
    if (params.populationSize && (!params.mu || params.mu !== params.populationSize)) {
      params = { ...params, mu: params.populationSize };
    }
    
    this.params = { ...this.params, ...params };
    this.reset();
  }
  
  /**
   * Create an initial random population
   */
  initializePopulation(): Individual<number[]>[] {
    this.population = [];
    
    // Initialize step sizes for each dimension
    this.stepSizes = Array(this.problem.dimension).fill(this.params.initialStepSize);
    
    // Create initial population (mu parents)
    for (let i = 0; i < this.params.mu; i++) {
      const genotype = this.problem.generateRandomSolution();
      const fitness = this.evaluateFitness(genotype);
      
      this.population.push({ genotype, fitness });
    }
    
    // Initial population stats
    this.updateStats();
    
    return this.population;
  }
  
  /**
   * Perform one generation of the evolution strategy
   */
  step(): void {
    if (this.population.length === 0) {
      this.initializePopulation();
      return;
    }
    
    // Create lambda offspring
    const offspring: Individual<number[]>[] = [];
    
    for (let i = 0; i < this.params.lambda; i++) {
      // Select a random parent
      const parentIndex = Math.floor(Math.random() * this.params.mu);
      const parent = this.population[parentIndex];
      
      // Create offspring through mutation
      const mutatedGenotype = this.mutation(parent.genotype);
      const fitness = this.evaluateFitness(mutatedGenotype);
      
      offspring.push({ genotype: mutatedGenotype, fitness });
    }
    
    // Selection based on strategy type
    if (this.params.selectionType === 'plus') {
      // (μ+λ) selection: select best μ individuals from parents and offspring
      const combined = [...this.population, ...offspring];
      combined.sort((a, b) => b.fitness - a.fitness); // Sort by fitness (descending)
      this.population = combined.slice(0, this.params.mu);
    } else {
      // (μ,λ) selection: select best μ individuals from offspring only
      offspring.sort((a, b) => b.fitness - a.fitness); // Sort by fitness (descending)
      this.population = offspring.slice(0, this.params.mu);
    }
    
    // Update best individual and stats
    this.updateBest();
    this.updateStats();
    this.generation++;
  }
  
  /**
   * Mutation operator for Evolution Strategy
   * Uses uncorrelated mutation with one step size per dimension
   */
  private mutation(genotype: number[]): number[] {
    const mutated = [...genotype];
    const tau = 1.0 / Math.sqrt(this.problem.dimension); // Learning rate
    
    // Global learning rate adaptation
    const globalLearningFactor = Math.exp(tau * this.randomNormal(0, 1));
    
    // Mutate each dimension
    for (let i = 0; i < mutated.length; i++) {
      // Update step size
      this.stepSizes[i] = this.stepSizes[i] * globalLearningFactor;
      
      // Ensure minimum step size
      if (this.stepSizes[i] < 1e-10) {
        this.stepSizes[i] = 1e-10;
      }
      
      // Apply mutation
      mutated[i] += this.stepSizes[i] * this.randomNormal(0, 1);
    }
    
    // Repair if out of bounds
    if (this.problem.repair) {
      return this.problem.repair(mutated);
    }
    
    return mutated;
  }
  
  /**
   * Helper function to generate random normal distributed values
   * Uses Box-Muller transform
   */
  private randomNormal(mean: number, stdDev: number): number {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return mean + z * stdDev;
  }
  
  /**
   * Evaluate fitness of a solution
   */
  private evaluateFitness(genotype: number[]): number {
    let fitness = this.problem.evaluate(genotype);
    
    // Convert minimization to maximization if needed
    if (this.problem.isMinimization) {
      fitness = -fitness; // Negate for minimization problems
    }
    
    return fitness;
  }
  
  /**
   * Update the best individual found so far
   */
  private updateBest(): void {
    const currentBest = this.population.reduce((best, current) => 
      current.fitness > best.fitness ? current : best, this.population[0]);
    
    if (!this.best || currentBest.fitness > this.best.fitness) {
      this.best = { ...currentBest };
    }
  }
  
  /**
   * Update algorithm statistics
   */
  private updateStats(): void {
    // Calculate average fitness
    const totalFitness = this.population.reduce((sum, ind) => sum + ind.fitness, 0);
    const avgFitness = totalFitness / this.population.length;
    
    // Calculate diversity (average distance between individuals)
    let totalDistance = 0;
    let pairCount = 0;
    
    for (let i = 0; i < this.population.length; i++) {
      for (let j = i + 1; j < this.population.length; j++) {
        totalDistance += this.euclideanDistance(
          this.population[i].genotype, 
          this.population[j].genotype
        );
        pairCount++;
      }
    }
    
    const diversity = pairCount > 0 ? totalDistance / pairCount : 0;
    
    // Update stats
    this.stats = {
      currentGeneration: this.generation,
      bestFitness: this.best ? this.best.fitness : 0,
      averageFitness: avgFitness,
      diversityMeasure: diversity,
      history: {
        bestFitness: [...this.stats.history.bestFitness, this.best ? this.best.fitness : 0],
        averageFitness: [...this.stats.history.averageFitness, avgFitness],
        diversity: [...this.stats.history.diversity, diversity]
      }
    };
  }
  
  /**
   * Calculate Euclidean distance between two solutions
   */
  private euclideanDistance(a: number[], b: number[]): number {
    return Math.sqrt(
      a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0)
    );
  }
  
  /**
   * Run the algorithm for a specified number of generations
   */
  run(generations: number = this.params.maxGenerations): Individual<number[]> {
    this.reset();
    
    for (let i = 0; i < generations; i++) {
      this.step();
      
      if (this.hasConverged()) {
        break;
      }
    }
    
    return this.getBest();
  }
  
  /**
   * Get the current population
   */
  getPopulation(): Individual<number[]>[] {
    return this.population;
  }
  
  /**
   * Get the best individual found so far
   */
  getBest(): Individual<number[]> {
    if (!this.best && this.population.length > 0) {
      this.updateBest();
    }
    
    return this.best || this.population[0];
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
    this.best = null;
    this.generation = 0;
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
    
    this.initializePopulation();
  }
  
  /**
   * Set or update algorithm parameters
   */
  setParams(params: AlgorithmParams): void {
    this.params = { ...this.params, ...params };
  }
  
  /**
   * Check if the algorithm has converged
   */
  hasConverged(): boolean {
    // Simple convergence check: if diversity is very low
    return this.stats.diversityMeasure < 1e-6;
  }
}

// Register the algorithm with the registry
registerAlgorithm('es', EvolutionStrategy); 