// Common types for the application

// Individual in a population
export interface Individual<T> {
  genotype: T; // The genetic representation (could be binary, real-valued, etc.)
  fitness: number; // The fitness value (higher is better by convention)
  phenotype?: any; // Optional decoded representation for visualization
}

// Algorithm parameters shared across all algorithms
export interface AlgorithmParams {
  populationSize: number;
  maxGenerations: number;
  [key: string]: any; // Additional algorithm-specific parameters
}

// Genetic Algorithm specific parameters
export interface GeneticAlgorithmParams extends AlgorithmParams {
  crossoverRate: number;
  mutationRate: number;
  selectionMethod: 'tournament' | 'roulette' | 'rank';
  tournamentSize?: number; // Only used for tournament selection
}

// Evolution Strategy specific parameters
export interface EvolutionStrategyParams extends AlgorithmParams {
  mu: number; // Number of parents
  lambda: number; // Number of offspring
  selectionType: 'plus' | 'comma'; // (μ+λ) or (μ,λ)
  initialStepSize: number;
}

// Differential Evolution specific parameters
export interface DifferentialEvolutionParams extends AlgorithmParams {
  F: number; // Differential weight (scaling factor)
  CR: number; // Crossover probability
  strategy: 'rand/1' | 'best/1' | 'rand/2' | 'best/2'; // DE strategy
}

// Particle Swarm Optimization specific parameters
export interface ParticleSwarmParams extends AlgorithmParams {
  inertiaWeight: number; // Inertia weight (w)
  cognitiveCoefficient: number; // Cognitive coefficient (c1)
  socialCoefficient: number; // Social coefficient (c2)
  maxVelocity: number; // Maximum velocity
  topology: 'global' | 'ring' | 'vonNeumann'; // Neighborhood topology
  neighborhoodSize?: number; // Size of neighborhood for ring topology
}

// Artificial Bee Colony specific parameters
export interface ArtificialBeeColonyParams extends AlgorithmParams {
  limit: number; // Maximum number of trials before abandoning a food source
  scalingFactor: number; // Scaling factor for neighborhood search
}

// Algorithm statistics for visualization and monitoring
export interface AlgorithmStats {
  currentGeneration: number;
  bestFitness: number;
  averageFitness: number;
  diversityMeasure: number;
  history: {
    bestFitness: number[];
    averageFitness: number[];
    diversity: number[];
  };
}

// Problem interface
export interface OptimizationProblem {
  name: string;
  description: string;
  dimension: number; // Number of variables/dimensions
  bounds: [number, number][]; // Min/max bounds for each dimension
  evaluate: (solution: any) => number; // Fitness function
  isMinimization: boolean; // Whether we're minimizing (true) or maximizing (false)
  generateRandomSolution: () => number[]; // Generate a random solution within bounds
  isInBounds?: (solution: number[]) => boolean; // Optional: Check if a solution is within bounds
  repair?: (solution: number[]) => number[]; // Optional: Repair a solution to be within bounds
}

// Visualization data structure
export interface VisualizationData {
  type: 'scatter' | 'line' | 'surface' | 'graph' | 'custom';
  data: any; // Structure depends on visualization type
  options?: any; // Visualization-specific options
}

// Application state
export interface AppState {
  selectedProblem: string | null;
  selectedAlgorithm: string | null;
  algorithmParams: AlgorithmParams;
  isRunning: boolean;
  speed: number; // Simulation speed factor
  currentStep: number;
  stats: AlgorithmStats | null;
}

// Controls for the evolutionary process
export interface EvolutionControls {
  start: () => void;
  pause: () => void;
  reset: () => void;
  step: () => void;
  setSpeed: (speed: number) => void;
} 