import { OptimizationProblem, AlgorithmParams } from '../types';
import { Algorithm } from './Algorithm';
import algorithmsConfig from '../config/evolutionaryAlgorithms.json';

/**
 * Type for algorithm constructor functions
 */
type AlgorithmConstructor = new (problem: OptimizationProblem) => Algorithm<any>;

/**
 * Registry of algorithm constructors
 */
let algorithmRegistry: Record<string, AlgorithmConstructor> = {};

/**
 * Register a new algorithm constructor
 */
export function registerAlgorithm(id: string, constructor: AlgorithmConstructor): void {
  algorithmRegistry[id] = constructor;
}

/**
 * Factory function to create an algorithm instance based on the algorithm ID
 */
export async function createAlgorithm(algorithmId: string, problem: OptimizationProblem): Promise<Algorithm<any> | null> {
  // Ensure standard algorithms are registered
  await initializeAlgorithms();
  
  // Map old algorithm IDs to new ones if necessary
  const algorithmIdMap: Record<string, string> = {
    'genetic-algorithm': 'ga',
    'evolution-strategy': 'es',
    'differential-evolution': 'de',
    'particle-swarm': 'pso'
  };
  
  // Use the mapped ID or the original if not in the map
  const mappedId = algorithmIdMap[algorithmId] || algorithmId;
  
  // Get the constructor from the registry
  const Constructor = algorithmRegistry[mappedId];
  
  // Return null if no constructor is found
  if (!Constructor) return null;
  
  // Create and return a new instance
  return new Constructor(problem);
}

/**
 * Get all available evolutionary algorithms
 */
export async function getAvailableAlgorithms(): Promise<{ id: string; name: string; description: string; icon: string }[]> {
  // Ensure standard algorithms are registered
  await initializeAlgorithms();
  
  return algorithmsConfig.map(({ id, name, description, icon }) => ({
    id,
    name,
    description,
    icon
  }));
}

/**
 * Get default parameters for a specific algorithm
 */
export async function getAlgorithmDefaultParameters(algorithmId: string): Promise<AlgorithmParams | null> {
  // Ensure standard algorithms are registered
  await initializeAlgorithms();
  
  const config = algorithmsConfig.find(a => a.id === algorithmId);
  return config ? config.defaultParameters : null;
}

/**
 * Get detailed information about an algorithm
 */
export async function getAlgorithmDetails(algorithmId: string): Promise<any | null> {
  // Ensure standard algorithms are registered
  await initializeAlgorithms();
  
  return algorithmsConfig.find(a => a.id === algorithmId) || null;
}

// Flag to track if algorithms have been initialized
let algorithmsInitialized = false;

/**
 * Initialize algorithms
 */
async function initializeAlgorithms() {
  if (algorithmsInitialized) return;
  
  try {
    // Import all algorithm implementations based on the configuration
    await Promise.all(
      algorithmsConfig.map(async algorithm => {
        try {
          // Use dynamic import with relative path
          await import(`./implementations/${algorithm.filePath}.ts`);
        } catch (error) {
          console.error(`Error loading algorithm ${algorithm.id}:`, error);
          console.error(`Failed path: ${algorithm.filePath}`);
        }
      })
    );
    
    algorithmsInitialized = true;
  } catch (error) {
    console.error('Error loading algorithms:', error);
  }
} 