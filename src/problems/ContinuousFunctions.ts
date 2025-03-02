import { OptimizationProblem } from '../types';
import { Problem } from './Problem';
import functionsConfig from '../config/optimizationFunctions.json';

/**
 * Type for function evaluator
 */
export type FunctionEvaluator = (solution: number[]) => number;

/**
 * Registry of function evaluators
 */
let functionRegistry: Record<string, FunctionEvaluator> = {};

/**
 * Register a new function evaluator
 */
export function registerFunction(id: string, evaluator: FunctionEvaluator): void {
  functionRegistry[id] = evaluator;
  console.log(`Registered function evaluator for ${id}`);
}

/**
 * Map of function IDs to their evaluation functions
 * @deprecated Use registerFunction instead
 */
export const functionEvaluators: Record<string, FunctionEvaluator> = functionRegistry;

// Flag to track if functions have been initialized
let functionsInitialized = false;
let initializationPromise: Promise<void> | null = null;

/**
 * Initialize functions
 */
async function initializeFunctions(): Promise<void> {
  if (functionsInitialized) return;
  
  // If initialization is already in progress, return the existing promise
  if (initializationPromise) return initializationPromise;
  
  // Create a new initialization promise
  initializationPromise = (async () => {
    try {
      // Import all function implementations based on the configuration
      await Promise.all(
        functionsConfig.map(async func => {
          try {
            // Use dynamic import with relative path
            await import(`./implementations/${func.filePath}.ts`);
          } catch (error) {
            console.error(`Error loading function ${func.id}:`, error);
            console.error(`Failed path: ${func.filePath}`);
          }
        })
      );
      
      functionsInitialized = true;
    } catch (error) {
      console.error('Error loading functions:', error);
    }
  })();
  
  return initializationPromise;
}

/**
 * Creates a Problem instance from the configuration
 */
export async function createProblemFromConfig(problemId: string, dimension: number = 2): Promise<OptimizationProblem | null> {
  // Ensure functions are registered
  await initializeFunctions();
  
  const config = functionsConfig.find(f => f.id === problemId);
  if (!config) return null;
  
  // Check if the function evaluator exists
  if (!functionRegistry[problemId]) {
    console.error(`No function evaluator registered for problem ID: ${problemId}`);
    return null;
  }
  
  // Create and return the problem instance
  const problem = new Problem(
    config.id,
    config.name,
    config.description,
    dimension,
    Array(dimension).fill(config.bounds),
    config.isMinimization
  );
  
  // Override the evaluate method to use our function registry
  problem.evaluate = (solution: number[]): number => {
    if (solution.length !== problem.dimension) {
      throw new Error(`Solution dimension (${solution.length}) does not match problem dimension (${problem.dimension})`);
    }
    return functionRegistry[problem.id](solution);
  };
  
  return problem;
}

/**
 * Get all available optimization functions
 */
export async function getAvailableFunctions(): Promise<{ id: string; name: string; description: string; icon: string }[]> {
  // Ensure functions are registered
  await initializeFunctions();
  
  return functionsConfig.map(({ id, name, description, icon }) => ({
    id,
    name,
    description,
    icon
  }));
}

/**
 * Get a function evaluator by ID
 */
export function getFunctionEvaluator(id: string): FunctionEvaluator | null {
  return functionRegistry[id] || null;
}

/**
 * Get visualization configuration for a specific function
 */
export async function getFunctionVisualizationConfig(functionId: string) {
  await initializeFunctions();
  const config = functionsConfig.find(f => f.id === functionId);
  
  if (!config) {
    console.warn(`No configuration found for function with ID '${functionId}'`);
    return null;
  }
  
  // Return the visualization configuration with 2D formula
  return {
    xRange: config.visualization?.xRange || [-5, 5],
    yRange: config.visualization?.yRange || [-5, 5],
    zRange: config.visualization?.zRange || [0, 25],
    colorScheme: config.visualization?.colorScheme || 'viridis',
    formula2D: config.visualization?.formula2D
  };
}

/**
 * Get detailed information about a function
 */
export async function getFunctionDetails(functionId: string) {
  await initializeFunctions();
  return functionsConfig.find(f => f.id === functionId) || null;
} 