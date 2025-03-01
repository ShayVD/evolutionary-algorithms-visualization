import { Algorithm } from '../Algorithm';
import { Individual, AlgorithmParams, AlgorithmStats, ArtificialBeeColonyParams } from '../../types';
import { OptimizationProblem } from '../../types';
import { registerAlgorithm } from '../AlgorithmFactory';

/**
 * Artificial Bee Colony (ABC) algorithm implementation
 * 
 * ABC is a swarm-based metaheuristic algorithm inspired by the foraging behavior of honey bees.
 * It consists of three groups of bees: employed bees, onlooker bees, and scout bees.
 */
export class ArtificialBeeColony implements Algorithm<number[]> {
  private params: ArtificialBeeColonyParams;
  private problem: OptimizationProblem;
  private population: Individual<number[]>[] = [];
  private best: Individual<number[]> | null = null;
  private generation: number = 0;
  private stats: AlgorithmStats;
  private trials: number[] = []; // Counter for trials without improvement
  
  constructor(problem: OptimizationProblem) {
    this.problem = problem;
    this.params = {
      populationSize: 40, // Number of food sources (employed bees)
      maxGenerations: 100,
      limit: 20, // Maximum trials before abandoning a food source
      scalingFactor: 0.5 // Scaling factor for neighborhood search
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
   * Create an initial random population (food sources)
   */
  initializePopulation(): Individual<number[]>[] {
    this.population = [];
    this.trials = [];
    
    // Initialize food sources (employed bees)
    for (let i = 0; i < this.params.populationSize; i++) {
      const genotype = this.problem.generateRandomSolution();
      const fitness = this.evaluateFitness(genotype);
      
      this.population.push({ genotype, fitness });
      this.trials.push(0); // Initialize trial counter for each food source
    }
    
    // Initial population stats
    this.updateStats();
    
    return this.population;
  }
  
  /**
   * Perform one generation of the ABC algorithm
   */
  step(): void {
    if (this.population.length === 0) {
      this.initializePopulation();
      return;
    }
    
    // Employed Bee Phase
    this.employedBeePhase();
    
    // Onlooker Bee Phase
    this.onlookerBeePhase();
    
    // Scout Bee Phase
    this.scoutBeePhase();
    
    // Update best solution
    this.findBest();
    
    // Update statistics
    this.generation++;
    this.updateStats();
  }
  
  /**
   * Run the algorithm for a specified number of generations
   */
  run(generations: number = this.params.maxGenerations): Individual<number[]> {
    if (this.population.length === 0) {
      this.initializePopulation();
    }
    
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
    if (!this.best) {
      this.findBest();
    }
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
    this.trials = [];
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
    // Check if maximum generations reached
    if (this.generation >= this.params.maxGenerations) {
      return true;
    }
    
    // Check if diversity is very low (population has converged)
    if (this.stats.diversityMeasure < 0.0001) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Employed Bee Phase: Each employed bee generates a new solution near its current position
   */
  private employedBeePhase(): void {
    for (let i = 0; i < this.population.length; i++) {
      // Generate a new candidate solution
      const newSolution = this.generateNeighborSolution(i);
      const newFitness = this.evaluateFitness(newSolution);
      
      // Greedy selection
      if (this.isBetter(newFitness, this.population[i].fitness)) {
        this.population[i] = { genotype: newSolution, fitness: newFitness };
        this.trials[i] = 0; // Reset trial counter
      } else {
        this.trials[i]++; // Increment trial counter
      }
    }
  }
  
  /**
   * Onlooker Bee Phase: Onlooker bees select food sources based on their fitness
   */
  private onlookerBeePhase(): void {
    const totalFitness = this.calculateTotalFitness();
    let count = 0;
    let i = 0;
    
    // Distribute onlooker bees according to food source quality
    while (count < this.population.length) {
      // Calculate selection probability based on fitness
      const probability = this.calculateProbability(this.population[i].fitness, totalFitness);
      
      // Select food source with probability proportional to its fitness
      if (Math.random() < probability) {
        // Generate a new candidate solution
        const newSolution = this.generateNeighborSolution(i);
        const newFitness = this.evaluateFitness(newSolution);
        
        // Greedy selection
        if (this.isBetter(newFitness, this.population[i].fitness)) {
          this.population[i] = { genotype: newSolution, fitness: newFitness };
          this.trials[i] = 0; // Reset trial counter
        } else {
          this.trials[i]++; // Increment trial counter
        }
        
        count++;
      }
      
      i = (i + 1) % this.population.length;
    }
  }
  
  /**
   * Scout Bee Phase: Abandon food sources that haven't improved for a certain number of trials
   */
  private scoutBeePhase(): void {
    for (let i = 0; i < this.population.length; i++) {
      // If a food source hasn't improved for 'limit' trials, abandon it
      if (this.trials[i] > this.params.limit) {
        // Generate a new random solution
        const genotype = this.problem.generateRandomSolution();
        const fitness = this.evaluateFitness(genotype);
        
        // Replace the abandoned food source
        this.population[i] = { genotype, fitness };
        this.trials[i] = 0; // Reset trial counter
      }
    }
  }
  
  /**
   * Generate a new solution in the neighborhood of a given solution
   */
  private generateNeighborSolution(index: number): number[] {
    const solution = [...this.population[index].genotype];
    
    // Select a random dimension to modify
    const dimension = Math.floor(Math.random() * solution.length);
    
    // Select a random solution different from the current one
    let partnerIndex;
    do {
      partnerIndex = Math.floor(Math.random() * this.population.length);
    } while (partnerIndex === index);
    
    const partner = this.population[partnerIndex].genotype;
    
    // Generate a new value for the selected dimension
    const phi = (Math.random() * 2 - 1) * this.params.scalingFactor; // Random value in [-scalingFactor, scalingFactor]
    solution[dimension] += phi * (solution[dimension] - partner[dimension]);
    
    // Ensure the solution is within bounds
    if (this.problem.repair) {
      return this.problem.repair(solution);
    } else {
      return this.ensureWithinBounds(solution);
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
   * Calculate the total fitness of the population
   */
  private calculateTotalFitness(): number {
    return this.population.reduce((sum, individual) => {
      return sum + this.normalizeFitness(individual.fitness);
    }, 0);
  }
  
  /**
   * Calculate selection probability based on fitness
   */
  private calculateProbability(fitness: number, totalFitness: number): number {
    return this.normalizeFitness(fitness) / totalFitness;
  }
  
  /**
   * Normalize fitness for probability calculation
   * For minimization problems, lower values are better, so we invert the fitness
   */
  private normalizeFitness(fitness: number): number {
    if (this.problem.isMinimization) {
      // For minimization, transform to ensure positive values
      // Find the maximum fitness in the population
      const maxFitness = Math.max(...this.population.map(ind => ind.fitness));
      return 1 / (1 + fitness - Math.min(0, maxFitness));
    } else {
      // For maximization, use fitness directly
      return Math.max(0, fitness);
    }
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
   * Find the best individual in the population
   */
  private findBest(): Individual<number[]> {
    if (this.population.length === 0) {
      throw new Error('Population is empty');
    }
    
    let bestIndex = 0;
    
    for (let i = 1; i < this.population.length; i++) {
      if (this.isBetter(this.population[i].fitness, this.population[bestIndex].fitness)) {
        bestIndex = i;
      }
    }
    
    this.best = { ...this.population[bestIndex] };
    return this.best;
  }
  
  /**
   * Update algorithm statistics
   */
  private updateStats(): void {
    if (this.population.length === 0) return;
    
    // Find best fitness
    const bestFitness = this.best ? this.best.fitness : this.findBest().fitness;
    
    // Calculate average fitness
    const totalFitness = this.population.reduce((sum, ind) => sum + ind.fitness, 0);
    const averageFitness = totalFitness / this.population.length;
    
    // Calculate diversity
    const diversity = this.calculateDiversity();
    
    // Update stats
    this.stats = {
      currentGeneration: this.generation,
      bestFitness,
      averageFitness,
      diversityMeasure: diversity,
      history: {
        bestFitness: [...this.stats.history.bestFitness, bestFitness],
        averageFitness: [...this.stats.history.averageFitness, averageFitness],
        diversity: [...this.stats.history.diversity, diversity]
      }
    };
  }
  
  /**
   * Calculate population diversity using average pairwise distance
   */
  private calculateDiversity(): number {
    if (this.population.length <= 1) return 0;
    
    let totalDistance = 0;
    let pairCount = 0;
    
    // Calculate average pairwise distance
    for (let i = 0; i < this.population.length; i++) {
      for (let j = i + 1; j < this.population.length; j++) {
        totalDistance += this.euclideanDistance(
          this.population[i].genotype,
          this.population[j].genotype
        );
        pairCount++;
      }
    }
    
    return totalDistance / pairCount;
  }
  
  /**
   * Calculate Euclidean distance between two solutions
   */
  private euclideanDistance(a: number[], b: number[]): number {
    return Math.sqrt(
      a.reduce((sum, value, index) => {
        const diff = value - b[index];
        return sum + diff * diff;
      }, 0)
    );
  }
}

// Register the algorithm with the factory
registerAlgorithm('abc', ArtificialBeeColony); 