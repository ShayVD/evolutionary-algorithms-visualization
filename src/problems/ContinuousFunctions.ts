import { OptimizationProblem } from '../types';
import { Problem } from './Problem';
import functionsConfig from '../config/optimizationFunctions.json';

/**
 * Type for function evaluator
 */
type FunctionEvaluator = (solution: number[]) => number;

/**
 * Registry of function evaluators
 */
let functionRegistry: Record<string, FunctionEvaluator> = {};

/**
 * Register a new function evaluator
 */
export function registerFunction(id: string, evaluator: FunctionEvaluator): void {
  functionRegistry[id] = evaluator;
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
        functionsConfig.map(func => 
          import(func.filePath)
            .catch(error => console.error(`Error loading function ${func.id}:`, error))
        )
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
 * Get visualization configuration for a specific function
 */
export async function getFunctionVisualizationConfig(functionId: string) {
  await initializeFunctions();
  const config = functionsConfig.find(f => f.id === functionId);
  return config ? config.visualization : null;
}

/**
 * Get detailed information about a function
 */
export async function getFunctionDetails(functionId: string) {
  await initializeFunctions();
  return functionsConfig.find(f => f.id === functionId) || null;
} 