# Evolutionary Algorithms Visualization

An interactive web application for visualizing and experimenting with evolutionary algorithms in real-time.

## Project Goals

This project aims to create an engaging, educational platform for exploring evolutionary algorithms by:

1. Providing intuitive visualizations of evolutionary processes
2. Enabling real-time interaction with algorithm parameters
3. Demonstrating how different algorithms perform on various optimization problems
4. Serving as both an educational tool and a playground for experimentation

## Features

- **Problem Selection**: Choose from different optimization problems
  - Continuous function optimization (e.g., Sphere, Rastrigin, Rosenbrock, Ackley, Schwefel Problem 2.22)
  - Traveling Salesman Problem (TSP)
  - Knapsack Problem
  - Binary optimization problems
  
- **Algorithm Selection**: Implement and compare different evolutionary algorithms
  - Genetic Algorithm (GA)
  - Evolution Strategy (ES)
  - Differential Evolution (DE)
  - Particle Swarm Optimization (PSO)
  
- **Real-time Visualization**:
  - Population diversity visualization
  - Fitness landscape representation
  - Convergence graphs
  - Solution space exploration
  
- **Interactive Controls**:
  - Start/pause/reset evolution
  - Control evolution speed
  - Step-by-step evolution
  
- **Parameter Manipulation**:
  - Population size
  - Mutation rate
  - Crossover probability
  - Selection pressure
  - Algorithm-specific parameters

- **User Interface**:
  - Clean navigation bar with standard dropdown selectors for problem and algorithm selection
  - Problem and algorithm selectors permanently visible in the navigation bar
  - Easy access to parameters and playback controls
  - Clean, modern design for optimal user experience

## Project Structure

```
evolutionary-algorithms-visualisation/
├── src/
│   ├── components/            # React components
│   │   ├── Header.tsx         # Top navigation bar with problem/algorithm selectors and controls
│   │   ├── ControlPanel/      # Parameter controls for the selected algorithm
│   │   ├── Visualization/     # Visualization components
│   │   ├── ProblemDetails/    # Details and configuration for the selected problem
│   │   └── AlgorithmDetails/  # Details and selector for the selected algorithm
│   ├── algorithms/            # Evolutionary algorithm implementations
│   │   ├── Algorithm.ts       # Base algorithm interface
│   │   ├── GeneticAlgorithm.ts
│   │   ├── EvolutionStrategy.ts
│   │   ├── DifferentialEvolution.ts
│   │   └── ParticleSwarmOptimization.ts
│   ├── problems/              # Optimization problem definitions
│   │   ├── Problem.ts         # Base problem interface
│   │   └── ContinuousFunctions.ts
│   ├── utils/                 # Utility functions and hooks
│   │   ├── visualization.ts
│   │   └── hooks.ts
│   ├── types/                 # TypeScript type definitions
│   │   └── index.ts
│   ├── assets/                # Static assets for the application
│   ├── main.tsx               # Application entry point
│   ├── App.tsx                # Main App component
│   ├── App.css                # App-specific styles
│   └── index.css              # Global styles
├── public/                    # Static assets
├── index.html                 # HTML entry point
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
└── vite.config.ts             # Vite configuration
```

## Implementation Plan

### Phase 1: Project Setup
- Initialize Vite TypeScript React project
- Set up project structure and essential dependencies
- Create basic UI components

### Phase 2: Core Algorithm Implementation
- Implement base interfaces for algorithms and problems
- Create fundamental evolutionary algorithms (GA, ES)
- Implement basic optimization problems

### Phase 3: Visualization Development
- Develop visualization components for different problem types
- Implement real-time population visualization
- Create convergence and diversity graphs

### Phase 4: Interactive Controls
- Add controls for algorithm parameters
- Implement playback controls (start/pause/reset)
- Enable step-by-step evolution
- Create navigation bar with standard selectors for problem and algorithm selection

### Phase 5: Advanced Features
- Add more complex algorithms and problems
- Implement comparative analysis tools
- Add export/import functionality for configurations

## Algorithm Details

### Genetic Algorithm (GA)
- Representation: Binary strings, real-valued vectors, permutations
- Selection: Tournament, Roulette wheel, Rank-based
- Crossover: Single-point, Two-point, Uniform, Arithmetic
- Mutation: Bit-flip, Gaussian, Swap

### Evolution Strategy (ES)
- Representation: Real-valued vectors with strategy parameters
- Selection: (μ,λ) or (μ+λ)
- Mutation: Self-adaptive step sizes
- Recombination: Discrete or intermediate

### Differential Evolution (DE)
- Representation: Real-valued vectors
- Mutation: DE/rand/1, DE/best/1, etc.
- Crossover: Binomial or exponential
- Selection: Survival of the fittest

### Particle Swarm Optimization (PSO)
- Representation: Real-valued vectors with velocity
- Movement: Based on personal and global best positions
- Parameters: Inertia weight, cognitive/social coefficients

## Problem Details

### Continuous Function Optimization
- Benchmark functions: 
  - Sphere: A simple, continuous, convex, and unimodal function
  - Rastrigin: A highly multimodal function with many local minima
  - Rosenbrock: A non-convex function with a narrow valley
  - Ackley: A multimodal function with many local minima
  - Schwefel Problem 2.22: A unimodal function that combines sum and product of absolute values
- Visualization: 2D/3D surface plots, contour maps

### Traveling Salesman Problem (TSP)
- Representation: Permutation-based encoding
- Visualization: Graph with nodes and edges, tour animation

### Knapsack Problem
- Representation: Binary encoding
- Visualization: Item selection and value/weight display

## Technologies

- TypeScript
- React
- Vite
- D3.js / Chart.js / Three.js (for visualizations)
- Material-UI (for UI components)
- TailwindCSS (for styling)

## Getting Started

```bash
# Clone the repository
git clone https://github.com/yourusername/evolutionary-algorithms-visualisation.git

# Navigate to the project directory
cd evolutionary-algorithms-visualisation

# Install dependencies
npm install

# Start the development server
npm run dev
```

## License

MIT 

## Extending the Project

This section provides guidance on how to extend the project by adding new optimization functions or evolutionary algorithms.

### Adding a New Optimization Function

To add a new optimization function to the project, follow these steps:

1. **Implement the Function Class**:
   - Open `src/problems/ContinuousFunctions.ts`
   - Create a new class that extends the `Problem` class
   - Implement the required methods, especially the `evaluate` method

   Example:
   ```typescript
   /**
    * Implementation of Your New Function
    * f(x) = ... (your function definition)
    * Global minimum at (...) with f(x) = ...
    */
   export class YourNewFunction extends Problem {
     constructor(dimension: number = 2) {
       super(
         'Your Function Name',
         'A description of your function',
         dimension,
         Array(dimension).fill([-10, 10]), // Define appropriate bounds
         true // true for minimization, false for maximization
       );
     }
     
     evaluate(solution: number[]): number {
       // Implement your function evaluation logic here
       // Example:
       return solution.reduce((sum, value) => sum + Math.pow(value, 4), 0);
     }
   }
   ```

2. **Register the Function in the Visualization Utility**:
   - Open `src/utils/visualization.ts`
   - Import your new function class
   - Add a case for your function in the `createProblem` function
   
   ```typescript
   import { YourNewFunction } from '../problems/ContinuousFunctions';
   
   export function createProblem(problemId: string, dimension: number = 2): OptimizationProblem | null {
     switch (problemId) {
       // Existing cases...
       case 'your-function-id':
         return new YourNewFunction(dimension);
       default:
         return null;
     }
   }
   ```

3. **Add the Function to the Visualization Component**:
   - Open `src/components/Visualization/Visualization.tsx`
   - Add your function to the switch statements that handle problem types
   - Implement the visualization logic for your function
   
   ```typescript
   // In the switch statements that create visualizations
   case 'your-function-id':
     create2DFunctionVisualization(problem);
     break;
   
   // In the function that calculates z values
   case 'your-function-id':
     z = // Your function calculation for visualization
     break;
   
   // In the domain range definition
   case 'your-function-id':
     xRange = [-10, 10]; // Appropriate range for your function
     yRange = [-10, 10];
     break;
   ```

4. **Add the Function to the Problem Details Component**:
   - Open `src/components/ProblemDetails/ProblemDetails.tsx`
   - Add your function to the `problemDetails` object
   
   ```typescript
   'your-function-id': {
     title: 'Your Function Name',
     description: 'Description of your function including its characteristics and global optimum.',
     config: (
       <Box sx={{ mt: 2 }}>
         <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>Configuration</Typography>
         <Grid container spacing={2}>
           <Grid item xs={6}>
             <Typography variant="caption" color="text.secondary">Dimensions</Typography>
             <Typography variant="body2">2</Typography>
           </Grid>
           <Grid item xs={6}>
             <Typography variant="caption" color="text.secondary">Search Range</Typography>
             <Typography variant="body2">[-10, 10]</Typography>
           </Grid>
           <Grid item xs={12}>
             <Typography variant="caption" color="text.secondary">Formula</Typography>
             <Typography variant="body2">f(x) = ... (your formula)</Typography>
           </Grid>
         </Grid>
       </Box>
     )
   }
   ```

5. **Add the Function to the Problem Selector**:
   - Open `src/components/ProblemDetails/ProblemSelector.tsx`
   - Add your function to the `problems` array
   
   ```typescript
   { 
     id: 'your-function-id', 
     name: 'Your Function Name', 
     description: 'Brief description of your function',
     icon: '🔍' // Choose an appropriate emoji
   }
   ```

### Adding a New Evolutionary Algorithm

To add a new evolutionary algorithm to the project, follow these steps:

1. **Implement the Algorithm Class**:
   - Create a new file in the `src/algorithms` directory (e.g., `YourNewAlgorithm.ts`)
   - Implement the `Algorithm` interface
   - Define algorithm-specific parameters interface if needed
   
   Example:
   ```typescript
   import { Algorithm } from './Algorithm';
   import { Individual, AlgorithmParams, AlgorithmStats } from '../types';
   import { OptimizationProblem } from '../types';

   /**
    * Interface for your algorithm's specific parameters
    */
   export interface YourAlgorithmParams extends AlgorithmParams {
     specificParam1: number;
     specificParam2: string;
     // Add other parameters as needed
   }

   /**
    * Your New Algorithm implementation
    */
   export class YourNewAlgorithm implements Algorithm<number[]> {
     private params: YourAlgorithmParams;
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
         specificParam1: 0.5,
         specificParam2: 'default'
         // Initialize with default values
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
     
     // Implement all required methods from the Algorithm interface
     initialize(params: AlgorithmParams): void {
       // Implementation
     }
     
     initializePopulation(): Individual<number[]>[] {
       // Implementation
     }
     
     step(): void {
       // Implementation of one generation/iteration
     }
     
     // Implement other required methods...
   }
   ```

2. **Update the Types File**:
   - Open `src/types/index.ts`
   - Add your algorithm's parameters interface
   
   ```typescript
   // Your Algorithm specific parameters
   export interface YourAlgorithmParams extends AlgorithmParams {
     specificParam1: number;
     specificParam2: string;
     // Add other parameters as needed
   }
   ```

3. **Register the Algorithm in the Visualization Utility**:
   - Open `src/utils/visualization.ts`
   - Import your new algorithm class
   - Add a case for your algorithm in the `createAlgorithm` function
   
   ```typescript
   import { YourNewAlgorithm } from '../algorithms/YourNewAlgorithm';
   
   export function createAlgorithm(algorithmId: string, problem: OptimizationProblem): Algorithm<any> | null {
     switch (algorithmId) {
       // Existing cases...
       case 'your-algorithm-id':
         return new YourNewAlgorithm(problem);
       default:
         return null;
     }
   }
   ```

4. **Add the Algorithm to the Algorithm Details Component**:
   - Open `src/components/AlgorithmDetails/AlgorithmDetails.tsx`
   - Add your algorithm to the component's details object
   
   ```typescript
   'your-algorithm-id': {
     title: 'Your Algorithm Name',
     description: 'Description of how your algorithm works and its key characteristics.',
     config: (
       <Box sx={{ mt: 2 }}>
         <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>Key Features</Typography>
         <ul>
           <li>Feature 1 of your algorithm</li>
           <li>Feature 2 of your algorithm</li>
           <li>Feature 3 of your algorithm</li>
         </ul>
       </Box>
     )
   }
   ```

5. **Add the Algorithm to the Algorithm Selector**:
   - Open `src/components/AlgorithmDetails/AlgorithmSelector.tsx`
   - Add your algorithm to the `algorithms` array
   
   ```typescript
   { 
     id: 'your-algorithm-id', 
     name: 'Your Algorithm Name', 
     description: 'Brief description of your algorithm',
     icon: '🧬' // Choose an appropriate emoji
   }
   ```

6. **Create Parameter Controls for Your Algorithm**:
   - Open or create the appropriate file in `src/components/ControlPanel`
   - Implement controls for your algorithm's specific parameters
   
   ```typescript
   // Example parameter control component
   const YourAlgorithmControls: FC<AlgorithmControlsProps> = ({ params, onParamChange }) => {
     const handleSpecificParam1Change = (value: number) => {
       onParamChange({
         ...params,
         specificParam1: value
       });
     };
     
     return (
       <Box>
         <Typography variant="subtitle2">Your Algorithm Parameters</Typography>
         <Slider
           value={params.specificParam1 || 0.5}
           onChange={(_, value) => handleSpecificParam1Change(value as number)}
           min={0}
           max={1}
           step={0.01}
           valueLabelDisplay="auto"
           aria-labelledby="specific-param-1-slider"
         />
         <Typography id="specific-param-1-slider">
           Specific Parameter 1: {params.specificParam1 || 0.5}
         </Typography>
         
         {/* Add more parameter controls as needed */}
       </Box>
     );
   };
   ```

By following these steps, you can extend the project with new optimization functions and evolutionary algorithms while maintaining consistency with the existing codebase. 