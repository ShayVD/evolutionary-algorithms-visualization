import { Algorithm } from '../Algorithm';
import { Individual, AlgorithmParams, AlgorithmStats, GeneticAlgorithmParams } from '../../types';
import { OptimizationProblem } from '../../types';
import { registerAlgorithm } from '../AlgorithmFactory';

/**
 * Genetic Algorithm implementation for continuous optimization
 */
export class GeneticAlgorithm implements Algorithm<number[]> {
  private params: GeneticAlgorithmParams;
  private problem: OptimizationProblem;
  private population: Individual<number[]>[] = [];
  private best: Individual<number[]> | null = null;
  private generation: number = 0;
  private stats: AlgorithmStats;
  
  constructor(problem: OptimizationProblem) {
    this.problem = problem;
    this.params = {
      populationSize: 50,
      maxGenerations: 100,
      crossoverRate: 0.8,
      mutationRate: 0.1,
      selectionMethod: 'tournament',
      tournamentSize: 3
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
    this.params = { ...this.params, ...params };
    this.reset();
  }
  
  /**
   * Create an initial random population
   */
  initializePopulation(): Individual<number[]>[] {
    this.population = [];
    
    for (let i = 0; i < this.params.populationSize; i++) {
      const genotype = this.problem.generateRandomSolution();
      const fitness = this.evaluateFitness(genotype);
      
      this.population.push({ genotype, fitness });
    }
    
    // Initial population stats
    this.updateStats();
    
    return this.population;
  }
  
  /**
   * Perform one generation of the genetic algorithm
   */
  step(): void {
    if (this.population.length === 0) {
      this.initializePopulation();
      return;
    }
    
    // Create a new generation
    const newPopulation: Individual<number[]>[] = [];
    
    // Elitism: keep the best individual
    if (this.best) {
      newPopulation.push(this.best);
    }
    
    // Fill the rest of the population with offspring
    while (newPopulation.length < this.params.populationSize) {
      // Selection
      const parent1 = this.selection();
      const parent2 = this.selection();
      
      // Crossover
      let offspring1 = parent1.genotype;
      let offspring2 = parent2.genotype;
      
      if (Math.random() < this.params.crossoverRate) {
        [offspring1, offspring2] = this.crossover(parent1.genotype, parent2.genotype);
      }
      
      // Mutation
      offspring1 = this.mutation(offspring1);
      offspring2 = this.mutation(offspring2);
      
      // Evaluate fitness
      const fitness1 = this.evaluateFitness(offspring1);
      const fitness2 = this.evaluateFitness(offspring2);
      
      // Add to new population
      newPopulation.push({ genotype: offspring1, fitness: fitness1 });
      
      if (newPopulation.length < this.params.populationSize) {
        newPopulation.push({ genotype: offspring2, fitness: fitness2 });
      }
    }
    
    // Replace old population
    this.population = newPopulation;
    
    // Update generation counter and stats
    this.generation++;
    this.updateStats();
  }
  
  /**
   * Run the algorithm for a specified number of generations
   */
  run(generations: number = this.params.maxGenerations): Individual<number[]> {
    // Initialize if not already done
    if (this.population.length === 0) {
      this.initializePopulation();
    }
    
    // Run for the specified number of generations
    for (let i = 0; i < generations; i++) {
      this.step();
      
      // Early stopping if converged
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
    if (!this.best) {
      this.best = this.findBest();
    }
    return this.best;
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
    // Simple convergence check based on generation count
    if (this.generation >= this.params.maxGenerations) {
      return true;
    }
    
    // Could add more sophisticated convergence criteria here
    
    return false;
  }
  
  /**
   * Evaluate the fitness of a solution
   */
  private evaluateFitness(solution: number[]): number {
    const value = this.problem.evaluate(solution);
    
    // Convert to maximization if the problem is minimization
    return this.problem.isMinimization ? -value : value;
  }
  
  /**
   * Select a parent using the specified selection method
   */
  private selection(): Individual<number[]> {
    switch (this.params.selectionMethod) {
      case 'tournament':
        return this.tournamentSelection();
      case 'roulette':
        return this.rouletteSelection();
      case 'rank':
        return this.rankSelection();
      default:
        return this.tournamentSelection();
    }
  }
  
  /**
   * Tournament selection
   */
  private tournamentSelection(): Individual<number[]> {
    const tournamentSize = this.params.tournamentSize || 3;
    let best: Individual<number[]> | null = null;
    
    for (let i = 0; i < tournamentSize; i++) {
      const idx = Math.floor(Math.random() * this.population.length);
      const individual = this.population[idx];
      
      if (!best || individual.fitness > best.fitness) {
        best = individual;
      }
    }
    
    return best!;
  }
  
  /**
   * Roulette wheel selection
   */
  private rouletteSelection(): Individual<number[]> {
    // Ensure all fitness values are positive
    const minFitness = Math.min(...this.population.map(ind => ind.fitness));
    const adjustedFitness = this.population.map(ind => ind.fitness - minFitness + 1);
    
    const sumFitness = adjustedFitness.reduce((sum, fitness) => sum + fitness, 0);
    let rand = Math.random() * sumFitness;
    
    for (let i = 0; i < this.population.length; i++) {
      rand -= adjustedFitness[i];
      if (rand <= 0) {
        return this.population[i];
      }
    }
    
    return this.population[this.population.length - 1];
  }
  
  /**
   * Rank-based selection
   */
  private rankSelection(): Individual<number[]> {
    // Sort population by fitness (descending)
    const sortedPopulation = [...this.population].sort((a, b) => b.fitness - a.fitness);
    
    // Calculate rank weights (linear ranking)
    const weights = [];
    const n = sortedPopulation.length;
    
    for (let i = 0; i < n; i++) {
      weights[i] = 2 * (n - i) / (n * (n + 1));
    }
    
    // Select based on ranks
    let rand = Math.random();
    let sum = 0;
    
    for (let i = 0; i < n; i++) {
      sum += weights[i];
      if (rand <= sum) {
        return sortedPopulation[i];
      }
    }
    
    return sortedPopulation[n - 1];
  }
  
  /**
   * Crossover operation (arithmetic crossover for real-valued genotypes)
   */
  private crossover(parent1: number[], parent2: number[]): [number[], number[]] {
    const offspring1: number[] = [];
    const offspring2: number[] = [];
    
    // Arithmetic crossover
    for (let i = 0; i < parent1.length; i++) {
      const alpha = Math.random();
      offspring1.push(alpha * parent1[i] + (1 - alpha) * parent2[i]);
      offspring2.push(alpha * parent2[i] + (1 - alpha) * parent1[i]);
    }
    
    return [offspring1, offspring2];
  }
  
  /**
   * Mutation operation (Gaussian mutation for real-valued genotypes)
   */
  private mutation(genotype: number[]): number[] {
    const mutated = [...genotype];
    
    for (let i = 0; i < mutated.length; i++) {
      if (Math.random() < this.params.mutationRate) {
        // Gaussian mutation
        const stdev = (this.problem.bounds[i][1] - this.problem.bounds[i][0]) * 0.1;
        mutated[i] += this.gaussianRandom(0, stdev);
        
        // Boundary enforcement
        mutated[i] = Math.max(this.problem.bounds[i][0], mutated[i]);
        mutated[i] = Math.min(this.problem.bounds[i][1], mutated[i]);
      }
    }
    
    return mutated;
  }
  
  /**
   * Generate a random number from a Gaussian distribution
   */
  private gaussianRandom(mean: number, stdev: number): number {
    const u = 1 - Math.random();
    const v = 1 - Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    
    return mean + z * stdev;
  }
  
  /**
   * Find the best individual in the current population
   */
  private findBest(): Individual<number[]> {
    let best = this.population[0];
    
    for (let i = 1; i < this.population.length; i++) {
      if (this.population[i].fitness > best.fitness) {
        best = this.population[i];
      }
    }
    
    return best;
  }
  
  /**
   * Update the algorithm statistics
   */
  private updateStats(): void {
    const currentBest = this.findBest();
    
    // Update best if better than previously found best
    if (!this.best || currentBest.fitness > this.best.fitness) {
      this.best = currentBest;
    }
    
    // Calculate average fitness
    const totalFitness = this.population.reduce((sum, ind) => sum + ind.fitness, 0);
    const averageFitness = totalFitness / this.population.length;
    
    // Calculate diversity (average Euclidean distance between individuals)
    const diversity = this.calculateDiversity();
    
    // Update stats
    this.stats = {
      currentGeneration: this.generation,
      bestFitness: this.best.fitness,
      averageFitness: averageFitness,
      diversityMeasure: diversity,
      history: {
        bestFitness: [...this.stats.history.bestFitness, this.best.fitness],
        averageFitness: [...this.stats.history.averageFitness, averageFitness],
        diversity: [...this.stats.history.diversity, diversity]
      }
    };
  }
  
  /**
   * Calculate the diversity of the population
   */
  private calculateDiversity(): number {
    // Simple diversity measure: average distance between all pairs of individuals
    let totalDistance = 0;
    let pairs = 0;
    
    for (let i = 0; i < this.population.length; i++) {
      for (let j = i + 1; j < this.population.length; j++) {
        totalDistance += this.euclideanDistance(
          this.population[i].genotype,
          this.population[j].genotype
        );
        pairs++;
      }
    }
    
    return pairs > 0 ? totalDistance / pairs : 0;
  }
  
  /**
   * Calculate the Euclidean distance between two solutions
   */
  private euclideanDistance(a: number[], b: number[]): number {
    let sum = 0;
    
    for (let i = 0; i < a.length; i++) {
      const diff = a[i] - b[i];
      sum += diff * diff;
    }
    
    return Math.sqrt(sum);
  }
}

// Register the algorithm with the registry
registerAlgorithm('ga', GeneticAlgorithm); 