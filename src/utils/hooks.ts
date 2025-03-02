import { useState, useEffect, useRef } from 'react';
import { createAlgorithm } from '../algorithms/AlgorithmFactory';
import { Problem } from '../problems/Problem';
import { Algorithm } from '../algorithms/Algorithm';
import { AlgorithmParams, AlgorithmStats } from '../types';

/**
 * Custom hook for managing the evolutionary algorithm simulation
 */
export function useEvolutionarySimulation(
  selectedAlgorithmId: string,
  params: AlgorithmParams,
  problemInstance: Problem | null,
  isRunning: boolean,
  speed: number
): {
  algorithm: Algorithm<number[]> | null;
  problem: Problem | null;
  stats: AlgorithmStats | null;
  step: number;
  performStep: () => void;
  resetAlgorithm: () => void;
} {
  // References for animation
  const animationFrameRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  
  // Track current parameters for comparison
  const prevParamsRef = useRef<AlgorithmParams>(params);
  
  // Algorithm instance
  const [algorithm, setAlgorithm] = useState<Algorithm<number[]> | null>(null);
  const [problem, setProblem] = useState<Problem | null>(problemInstance);
  const [stats, setStats] = useState<AlgorithmStats | null>(null);
  const [step, setStep] = useState<number>(0);

  // Update problem when it changes
  useEffect(() => {
    setProblem(problemInstance);
  }, [problemInstance]);

  // Initialize or update algorithm when selection changes
  useEffect(() => {
    // Skip initialization if algorithm ID is empty or problem is null
    if (!selectedAlgorithmId || !problem) {
      console.log('Skipping algorithm initialization: missing ID or problem');
      setAlgorithm(null);
      return;
    }
    
    console.log('Algorithm changed, initializing with params:', params);
    
    // Create the algorithm asynchronously
    (async () => {
      try {
        const newAlgorithm = await createAlgorithm(selectedAlgorithmId, problem);
        
        if (newAlgorithm) {
          newAlgorithm.initialize(params);
          newAlgorithm.initializePopulation();
          setStats(newAlgorithm.getStats());
          setStep(0);
          setAlgorithm(newAlgorithm);
          prevParamsRef.current = params;
        }
      } catch (error) {
        console.error('Error creating algorithm:', error);
      }
    })();
    
  }, [selectedAlgorithmId, problem]);

  // Handle parameter changes
  useEffect(() => {
    if (!algorithm) return;
    
    // Only proceed if there are actual changes
    const hasParamChanges = JSON.stringify(params) !== JSON.stringify(prevParamsRef.current);
    if (!hasParamChanges) return;
    
    console.log('Parameters changed:', params);
    
    // Check for population size change that requires re-initialization
    const needsReset = 
      params.populationSize !== prevParamsRef.current.populationSize || 
      params.maxGenerations !== prevParamsRef.current.maxGenerations;
    
    // Apply new parameters
    algorithm.setParams(params);
    
    // If population size changed or other critical parameters, reset the algorithm
    if (needsReset) {
      console.log('Critical parameter changed, resetting algorithm');
      algorithm.reset();
      algorithm.initializePopulation();
      setStats(algorithm.getStats());
      setStep(0);
    }
    
    // Update reference to current params
    prevParamsRef.current = params;
  }, [params, algorithm]);

  // Animation loop for running the simulation
  useEffect(() => {
    if (!algorithm || !isRunning) return;

    const updateSimulation = (timestamp: number) => {
      // Calculate time since last update
      const elapsed = timestamp - lastUpdateTimeRef.current;
      
      // Update at most every (1000 / speed) milliseconds
      if (elapsed > 1000 / speed) {
        lastUpdateTimeRef.current = timestamp;
        
        // Check if the algorithm has converged
        if (!algorithm.hasConverged()) {
          algorithm.step();
          setStats(algorithm.getStats());
          setStep((prevStep) => prevStep + 1);
        }
      }
      
      // Continue the animation loop
      animationFrameRef.current = requestAnimationFrame(updateSimulation);
    };

    // Start the animation loop
    lastUpdateTimeRef.current = performance.now();
    animationFrameRef.current = requestAnimationFrame(updateSimulation);

    // Cleanup function to cancel animation when component unmounts or dependencies change
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [algorithm, isRunning, speed]);

  // Function to perform a single step manually
  const performStep = () => {
    if (algorithm) {
      // Check if the algorithm has converged before performing another step
      if (!algorithm.hasConverged()) {
        algorithm.step();
        setStats(algorithm.getStats());
        setStep((prevStep) => prevStep + 1);
      }
    }
  };

  // Function to reset the algorithm
  const resetAlgorithm = () => {
    if (algorithm) {
      algorithm.reset();
      algorithm.setParams(params); // Ensure latest params are applied
      algorithm.initializePopulation();
      setStats(algorithm.getStats());
      setStep(0);
    }
  };

  return {
    algorithm,
    problem,
    stats,
    step,
    performStep,
    resetAlgorithm
  };
}

/**
 * Custom hook for debouncing values
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
} 