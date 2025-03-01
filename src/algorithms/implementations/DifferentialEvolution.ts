import { Algorithm } from '../Algorithm';
import { Individual, AlgorithmParams, AlgorithmStats } from '../../types';
import { OptimizationProblem } from '../../types';
import { registerAlgorithm } from '../AlgorithmFactory';

/**
 * Interface for Differential Evolution specific parameters
 */
export interface DifferentialEvolutionParams extends AlgorithmParams {
  F: number; // Differential weight (scaling factor)
  CR: number; // Crossover probability
  strategy: 'rand/1' | 'best/1' | 'rand/2' | 'best/2'; // DE strategy
}

/**
 * Differential Evolution implementation for continuous optimization
 * Implements various DE strategies including rand/1, best/1, rand/2, best/2
 */
export class DifferentialEvolution implements Algorithm<number[]> {
  private params: DifferentialEvolutionParams;
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
      F: 0.5, // Differential weight (scaling factor)
      CR: 0.7, // Crossover probability
      strategy: 'rand/1' // Default strategy
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
    
    // Create initial population
    for (let i = 0; i < this.params.populationSize; i++) {
      const genotype = this.problem.generateRandomSolution();
      const fitness = this.evaluateFitness(genotype);
      
      this.population.push({ genotype, fitness });
    }
    
    // Initial population stats
    this.updateBest();
    this.updateStats();
    
    return this.population;
  }
  
  /**
   * Perform one generation of the differential evolution algorithm
   */
  step(): void {
    if (this.population.length === 0) {
      this.initializePopulation();
      return;
    }
    
    // Create a new generation
    const newPopulation: Individual<number[]>[] = [];
    
    // For each individual in the population
    for (let i = 0; i < this.population.length; i++) {
      const target = this.population[i];
      
      // Create a mutant vector using the selected strategy
      const mutant = this.mutation(i);
      
      // Create a trial vector through crossover
      const trial = this.crossover(target.genotype, mutant);
      
      // Evaluate the trial vector
      const trialFitness = this.evaluateFitness(trial);
      
      // Selection: keep the better of target and trial
      if (trialFitness >= target.fitness) {
        newPopulation.push({ genotype: trial, fitness: trialFitness });
      } else {
        newPopulation.push(target);
      }
    }
    
    // Update population
    this.population = newPopulation;
    
    // Update best individual and stats
    this.updateBest();
    this.updateStats();
    this.generation++;
  }
  
  /**
   * Mutation operator for Differential Evolution
   * Implements different strategies: rand/1, best/1, rand/2, best/2
   */
  private mutation(targetIndex: number): number[] {
    const dimension = this.problem.dimension;
    const popSize = this.population.length;
    
    // Initialize the mutant vector
    let mutant = new Array(dimension).fill(0);
    
    // Get indices for mutation (excluding the target)
    const indices = this.getRandomIndices(popSize, targetIndex, 
      this.params.strategy.includes('2') ? 5 : 3);
    
    // Apply the selected strategy
    switch (this.params.strategy) {
      case 'rand/1':
        // x_r1 + F * (x_r2 - x_r3)
        for (let j = 0; j < dimension; j++) {
          mutant[j] = this.population[indices[0]].genotype[j] + 
                      this.params.F * (this.population[indices[1]].genotype[j] - 
                                      this.population[indices[2]].genotype[j]);
        }
        break;
        
      case 'best/1':
        // x_best + F * (x_r1 - x_r2)
        for (let j = 0; j < dimension; j++) {
          mutant[j] = this.best!.genotype[j] + 
                      this.params.F * (this.population[indices[0]].genotype[j] - 
                                      this.population[indices[1]].genotype[j]);
        }
        break;
        
      case 'rand/2':
        // x_r1 + F * (x_r2 - x_r3) + F * (x_r4 - x_r5)
        for (let j = 0; j < dimension; j++) {
          mutant[j] = this.population[indices[0]].genotype[j] + 
                      this.params.F * (this.population[indices[1]].genotype[j] - 
                                      this.population[indices[2]].genotype[j]) +
                      this.params.F * (this.population[indices[3]].genotype[j] - 
                                      this.population[indices[4]].genotype[j]);
        }
        break;
        
      case 'best/2':
        // x_best + F * (x_r1 - x_r2) + F * (x_r3 - x_r4)
        for (let j = 0; j < dimension; j++) {
          mutant[j] = this.best!.genotype[j] + 
                      this.params.F * (this.population[indices[0]].genotype[j] - 
                                      this.population[indices[1]].genotype[j]) +
                      this.params.F * (this.population[indices[2]].genotype[j] - 
                                      this.population[indices[3]].genotype[j]);
        }
        break;
    }
    
    // Repair if out of bounds
    if (this.problem.repair) {
      return this.problem.repair(mutant);
    }
    
    return mutant;
  }
  
  /**
   * Get random indices for mutation, excluding the target index
   */
  private getRandomIndices(popSize: number, excludeIndex: number, count: number): number[] {
    const available = Array.from({ length: popSize }, (_, i) => i)
      .filter(i => i !== excludeIndex);
    
    // Shuffle available indices
    for (let i = available.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [available[i], available[j]] = [available[j], available[i]];
    }
    
    // Take the first 'count' indices
    return available.slice(0, count);
  }
  
  /**
   * Binomial crossover operator for Differential Evolution
   */
  private crossover(target: number[], mutant: number[]): number[] {
    const trial = [...target];
    const dimension = target.length;
    
    // Ensure at least one component is taken from the mutant
    const jRand = Math.floor(Math.random() * dimension);
    
    // Perform binomial crossover
    for (let j = 0; j < dimension; j++) {
      if (Math.random() < this.params.CR || j === jRand) {
        trial[j] = mutant[j];
      }
    }
    
    return trial;
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
registerAlgorithm('de', DifferentialEvolution); 