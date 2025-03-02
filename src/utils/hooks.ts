import { useState, useEffect, useRef } from 'react';
import { Algorithm } from '../algorithms/Algorithm';
import { OptimizationProblem } from '../types';
import { createProblem, createAlgorithm } from './visualization';
import { AlgorithmParams, AlgorithmStats } from '../types';

/**
 * Custom hook for managing the evolutionary algorithm simulation
 */
export function useEvolutionarySimulation(
  problemId: string | null,
  algorithmId: string | null,
  params: AlgorithmParams,
  isRunning: boolean,
  speed: number
) {
  const [algorithm, setAlgorithm] = useState<Algorithm<any> | null>(null);
  const [problem, setProblem] = useState<OptimizationProblem | null>(null);
  const [stats, setStats] = useState<AlgorithmStats | null>(null);
  const [step, setStep] = useState<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);

  // Initialize or update the problem and algorithm when selections change
  useEffect(() => {
    if (problemId && algorithmId) {
      // Create the optimization problem and algorithm - handle async
      (async () => {
        try {
          // Create the optimization problem
          const newProblem = await createProblem(problemId);
          setProblem(newProblem);

          if (newProblem) {
            // Create the algorithm with the problem
            const newAlgorithm = await createAlgorithm(algorithmId, newProblem);
            setAlgorithm(newAlgorithm);

            if (newAlgorithm) {
              // Initialize the algorithm with the parameters
              newAlgorithm.initialize(params);
              
              // Immediately initialize the population to ensure data is available
              newAlgorithm.initializePopulation();
              console.log('Initial population size:', newAlgorithm.getPopulation().length);
              
              setStats(newAlgorithm.getStats());
              setStep(0);
            }
          }
        } catch (error) {
          console.error('Error initializing problem or algorithm:', error);
        }
      })();
    } else {
      setAlgorithm(null);
      setProblem(null);
      setStats(null);
      setStep(0);
    }

    // Cleanup animation on changes
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [problemId, algorithmId]);

  // Handle parameter updates for existing algorithm
  useEffect(() => {
    if (algorithm) {
      // Debug: log parameter changes
      console.log('Parameter change detected:', params);
      
      // Stop any running animation first
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      
      // Update algorithm with new parameters in a specific order
      algorithm.setParams(params);
      
      // Force a complete reset and reinitialize
      algorithm.reset();
      
      // Explicitly initialize the population with the new size
      // This is the key step that ensures population size is correct
      algorithm.initializePopulation();
      
      // Double-check population size is correct
      const populationSize = algorithm.getPopulation().length;
      console.log(`Confirmed new population size: ${populationSize}, expected: ${params.populationSize}`);
      
      // If there's still a mismatch, try to force it (safety check)
      if (populationSize !== params.populationSize) {
        console.warn(`Population size mismatch detected. Forcing reinitialize...`);
        algorithm.reset();
        algorithm.initializePopulation();
      }
      
      // Now update the stats with the new population
      const updatedStats = algorithm.getStats();
      
      // Update state in a single synchronous batch
      setStats(updatedStats);
      setStep(0);
      
      // Log final size for debugging
      console.log(`Final population size after reset: ${algorithm.getPopulation().length}`);
    }
  }, [params]);

  // Animation loop for running the algorithm
  useEffect(() => {
    if (!algorithm || !isRunning) return;

    const updateSimulation = (timestamp: number) => {
      // Control update frequency based on speed
      const updateInterval = 1000 / speed; // milliseconds between updates

      if (timestamp - lastUpdateTimeRef.current >= updateInterval) {
        // Check if the algorithm has reached max generations or has converged
        if (algorithm.hasConverged()) {
          // Stop the animation if the algorithm has converged
          if (animationFrameRef.current !== null) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
          }
          return;
        }

        // Perform one step of the algorithm
        algorithm.step();
        setStats(algorithm.getStats());
        setStep((prevStep) => prevStep + 1);
        lastUpdateTimeRef.current = timestamp;
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