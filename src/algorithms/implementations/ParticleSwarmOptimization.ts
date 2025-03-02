import { Algorithm } from '../Algorithm';
import { Individual, AlgorithmParams, AlgorithmStats } from '../../types';
import { OptimizationProblem } from '../../types';
import { registerAlgorithm } from '../AlgorithmFactory';

/**
 * Interface for Particle Swarm Optimization specific parameters
 */
export interface ParticleSwarmParams extends AlgorithmParams {
  inertiaWeight: number; // Inertia weight (w)
  cognitiveCoefficient: number; // Cognitive coefficient (c1)
  socialCoefficient: number; // Social coefficient (c2)
  maxVelocity: number; // Maximum velocity
  topology: 'global' | 'ring' | 'vonNeumann'; // Neighborhood topology
  neighborhoodSize?: number; // Size of neighborhood for ring topology
}

/**
 * Particle interface for PSO
 */
interface Particle extends Individual<number[]> {
  velocity: number[]; // Velocity vector
  personalBest: {
    position: number[];
    fitness: number;
  };
  neighbors: number[]; // Indices of neighboring particles
}

/**
 * Particle Swarm Optimization implementation for continuous optimization
 */
export class ParticleSwarmOptimization implements Algorithm<number[]> {
  private params: ParticleSwarmParams;
  private problem: OptimizationProblem;
  private particles: Particle[] = [];
  private globalBest: Individual<number[]> | null = null;
  private iteration: number = 0;
  private stats: AlgorithmStats;
  
  constructor(problem: OptimizationProblem) {
    this.problem = problem;
    this.params = {
      populationSize: 50,
      maxGenerations: 100,
      inertiaWeight: 0.7, // Inertia weight (w)
      cognitiveCoefficient: 1.5, // Cognitive coefficient (c1)
      socialCoefficient: 1.5, // Social coefficient (c2)
      maxVelocity: 0.1, // Maximum velocity as a fraction of the search space range
      topology: 'global', // Default to global best topology
      neighborhoodSize: 3 // Default neighborhood size for ring topology
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
   * Create an initial swarm of particles
   */
  initializePopulation(): Individual<number[]>[] {
    this.particles = [];
    
    // Create initial particles
    for (let i = 0; i < this.params.populationSize; i++) {
      const position = this.problem.generateRandomSolution();
      const fitness = this.evaluateFitness(position);
      
      // Initialize velocity as small random values
      const velocity = position.map(() => {
        // Small random velocity in range [-maxVelocity, maxVelocity]
        const range = this.getVelocityRange();
        return (Math.random() * 2 - 1) * range;
      });
      
      // Create particle
      const particle: Particle = {
        genotype: position,
        fitness: fitness,
        velocity: velocity,
        personalBest: {
          position: [...position],
          fitness: fitness
        },
        neighbors: [] // Will be set when topology is established
      };
      
      this.particles.push(particle);
    }
    
    // Establish neighborhood topology
    this.setupTopology();
    
    // Update global best
    this.updateGlobalBest();
    
    // Initial swarm stats
    this.updateStats();
    
    return this.particles;
  }
  
  /**
   * Setup the neighborhood topology
   */
  private setupTopology(): void {
    const numParticles = this.particles.length;
    
    switch (this.params.topology) {
      case 'global':
        // In global topology, every particle is connected to every other particle
        // So each particle's neighborhood is the entire swarm
        for (let i = 0; i < numParticles; i++) {
          this.particles[i].neighbors = Array.from(
            { length: numParticles }, 
            (_, j) => j
          ).filter(j => j !== i);
        }
        break;
        
      case 'ring':
        // In ring topology, each particle is connected to k neighbors on each side
        const k = this.params.neighborhoodSize || 1;
        
        for (let i = 0; i < numParticles; i++) {
          const neighbors = [];
          
          // Add k neighbors on each side
          for (let j = 1; j <= k; j++) {
            // Left neighbor (wrap around if needed)
            const leftIdx = (i - j + numParticles) % numParticles;
            neighbors.push(leftIdx);
            
            // Right neighbor (wrap around if needed)
            const rightIdx = (i + j) % numParticles;
            neighbors.push(rightIdx);
          }
          
          this.particles[i].neighbors = neighbors;
        }
        break;
        
      case 'vonNeumann':
        // Von Neumann topology (grid-like)
        // Approximate a square grid
        const gridSize = Math.ceil(Math.sqrt(numParticles));
        
        for (let i = 0; i < numParticles; i++) {
          const row = Math.floor(i / gridSize);
          const col = i % gridSize;
          const neighbors = [];
          
          // North neighbor
          const northRow = (row - 1 + gridSize) % gridSize;
          const northIdx = northRow * gridSize + col;
          if (northIdx < numParticles) neighbors.push(northIdx);
          
          // South neighbor
          const southRow = (row + 1) % gridSize;
          const southIdx = southRow * gridSize + col;
          if (southIdx < numParticles) neighbors.push(southIdx);
          
          // West neighbor
          const westCol = (col - 1 + gridSize) % gridSize;
          const westIdx = row * gridSize + westCol;
          if (westIdx < numParticles) neighbors.push(westIdx);
          
          // East neighbor
          const eastCol = (col + 1) % gridSize;
          const eastIdx = row * gridSize + eastCol;
          if (eastIdx < numParticles) neighbors.push(eastIdx);
          
          this.particles[i].neighbors = neighbors;
        }
        break;
    }
  }
  
  /**
   * Perform one iteration of the PSO algorithm
   */
  step(): void {
    if (this.particles.length === 0) {
      this.initializePopulation();
      return;
    }
    
    // Update each particle
    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];
      
      // Find the best neighbor
      const bestNeighbor = this.findBestNeighbor(particle);
      
      // Update velocity and position
      this.updateParticle(particle, bestNeighbor);
      
      // Evaluate new position
      particle.fitness = this.evaluateFitness(particle.genotype);
      
      // Update personal best
      if (particle.fitness > particle.personalBest.fitness) {
        particle.personalBest = {
          position: [...particle.genotype],
          fitness: particle.fitness
        };
      }
    }
    
    // Update global best
    this.updateGlobalBest();
    
    // Update stats
    this.updateStats();
    this.iteration++;
  }
  
  /**
   * Find the best neighbor for a particle based on the topology
   */
  private findBestNeighbor(particle: Particle): Particle {
    if (this.params.topology === 'global') {
      // In global topology, the best neighbor is the global best
      return this.particles.find(p => 
        p.personalBest.fitness === this.globalBest!.fitness) || particle;
    } else {
      // Find the best personal best among neighbors
      return particle.neighbors.reduce((best, neighborIdx) => {
        const neighbor = this.particles[neighborIdx];
        return neighbor.personalBest.fitness > best.personalBest.fitness 
          ? neighbor 
          : best;
      }, particle);
    }
  }
  
  /**
   * Update a particle's velocity and position
   */
  private updateParticle(particle: Particle, bestNeighbor: Particle): void {
    const dimension = this.problem.dimension;
    const w = this.params.inertiaWeight;
    const c1 = this.params.cognitiveCoefficient;
    const c2 = this.params.socialCoefficient;
    const maxVelocity = this.getVelocityRange();
    
    // Update velocity and position for each dimension
    for (let d = 0; d < dimension; d++) {
      // Random coefficients
      const r1 = Math.random();
      const r2 = Math.random();
      
      // Update velocity
      // v = w*v + c1*r1*(personalBest - x) + c2*r2*(neighborBest - x)
      particle.velocity[d] = w * particle.velocity[d] + 
                            c1 * r1 * (particle.personalBest.position[d] - particle.genotype[d]) +
                            c2 * r2 * (bestNeighbor.personalBest.position[d] - particle.genotype[d]);
      
      // Clamp velocity
      particle.velocity[d] = Math.max(-maxVelocity, Math.min(maxVelocity, particle.velocity[d]));
      
      // Update position
      particle.genotype[d] += particle.velocity[d];
    }
    
    // Repair if out of bounds
    if (this.problem.repair) {
      particle.genotype = this.problem.repair(particle.genotype);
    }
  }
  
  /**
   * Calculate the maximum velocity based on the search space range
   */
  private getVelocityRange(): number {
    // Calculate the average range of the search space
    const avgRange = this.problem.bounds.reduce((sum, [min, max]) => 
      sum + (max - min), 0) / this.problem.dimension;
    
    // Return a fraction of the average range
    return avgRange * this.params.maxVelocity;
  }
  
  /**
   * Update the global best solution
   */
  private updateGlobalBest(): void {
    const currentBest = this.particles.reduce((best, current) => 
      current.fitness > best.fitness ? current : best, this.particles[0]);
    
    if (!this.globalBest || currentBest.fitness > this.globalBest.fitness) {
      this.globalBest = { 
        genotype: [...currentBest.genotype], 
        fitness: currentBest.fitness 
      };
    }
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
   * Update algorithm statistics
   */
  private updateStats(): void {
    // Calculate average fitness
    const totalFitness = this.particles.reduce((sum, p) => sum + p.fitness, 0);
    const avgFitness = totalFitness / this.particles.length;
    
    // Calculate diversity (average distance between particles)
    let totalDistance = 0;
    let pairCount = 0;
    
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        totalDistance += this.euclideanDistance(
          this.particles[i].genotype, 
          this.particles[j].genotype
        );
        pairCount++;
      }
    }
    
    const diversity = pairCount > 0 ? totalDistance / pairCount : 0;
    
    // Update stats
    this.stats = {
      currentGeneration: this.iteration,
      bestFitness: this.globalBest ? this.globalBest.fitness : 0,
      averageFitness: avgFitness,
      diversityMeasure: diversity,
      history: {
        bestFitness: [...this.stats.history.bestFitness, this.globalBest ? this.globalBest.fitness : 0],
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
   * Run the algorithm for a specified number of iterations
   */
  run(iterations: number = this.params.maxGenerations): Individual<number[]> {
    this.reset();
    
    for (let i = 0; i < iterations; i++) {
      this.step();
      
      if (this.hasConverged()) {
        break;
      }
    }
    
    return this.getBest();
  }
  
  /**
   * Get the current population (swarm)
   */
  getPopulation(): Individual<number[]>[] {
    return this.particles;
  }
  
  /**
   * Get the best individual found so far
   */
  getBest(): Individual<number[]> {
    return this.globalBest || this.particles[0];
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
    this.particles = [];
    this.globalBest = null;
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
    // Check if maximum iterations reached
    if (this.iteration >= this.params.maxGenerations) {
      return true;
    }
    
    // Check if diversity is very low
    if (this.stats.diversityMeasure < 1e-6) {
      return true;
    }
    
    return false;
  }
}

// Register the algorithm with the registry
registerAlgorithm('pso', ParticleSwarmOptimization); 