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
      // Create the optimization problem
      const newProblem = createProblem(problemId);
      setProblem(newProblem);

      if (newProblem) {
        // Create the algorithm with the problem
        const newAlgorithm = createAlgorithm(algorithmId, newProblem);
        setAlgorithm(newAlgorithm);

        if (newAlgorithm) {
          // Initialize the algorithm with the parameters
          newAlgorithm.initialize(params);
          setStats(newAlgorithm.getStats());
          setStep(0);
        }
      }
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
  }, [problemId, algorithmId, params]);

  // Handle parameter updates for existing algorithm
  useEffect(() => {
    if (algorithm) {
      algorithm.setParams(params);
    }
  }, [params]);

  // Animation loop for running the algorithm
  useEffect(() => {
    if (!algorithm || !isRunning) return;

    const updateSimulation = (timestamp: number) => {
      // Control update frequency based on speed
      const updateInterval = 1000 / speed; // milliseconds between updates

      if (timestamp - lastUpdateTimeRef.current >= updateInterval) {
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
      algorithm.step();
      setStats(algorithm.getStats());
      setStep((prevStep) => prevStep + 1);
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