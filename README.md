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
  - Artificial Bee Colony (ABC)
  - Simulated Annealing (SA)
  
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
evolutionary-algorithms-visualization/
├── src/
│   ├── components/            # React components
│   │   ├── Header.tsx         # Top navigation bar with problem/algorithm selectors and controls
│   │   ├── ControlPanel/      # Parameter controls for the selected algorithm
│   │   ├── Visualization/     # Visualization components
│   │   ├── ProblemDetails/    # Details and configuration for the selected problem
│   │   └── AlgorithmDetails/  # Details and selector for the selected algorithm
│   ├── algorithms/            # Evolutionary algorithm implementations
│   │   ├── Algorithm.ts       # Base algorithm interface
│   │   ├── AlgorithmFactory.ts # Factory for creating algorithm instances
│   │   └── implementations/   # Individual algorithm implementations
│   │       ├── GeneticAlgorithm.ts
│   │       ├── EvolutionStrategy.ts
│   │       ├── DifferentialEvolution.ts
│   │       ├── ParticleSwarmOptimization.ts
│   │       ├── ArtificialBeeColony.ts
│   │       └── SimulatedAnnealing.ts
│   ├── problems/              # Optimization problem definitions
│   │   ├── Problem.ts         # Base problem interface
│   │   ├── ContinuousFunctions.ts # Factory for creating function instances
│   │   └── implementations/   # Individual function implementations
│   │       ├── SphereFunction.ts
│   │       ├── RastriginFunction.ts
│   │       ├── RosenbrockFunction.ts
│   │       ├── AckleyFunction.ts
│   │       └── Schwefel222Function.ts
│   ├── utils/                 # Utility functions and hooks
│   │   ├── visualization.ts   # Visualization utility functions
│   │   └── hooks.ts           # Custom React hooks
│   ├── types/                 # TypeScript type definitions
│   │   └── index.ts           # TypeScript type definitions
│   ├── config/                # Configuration files
│   │   ├── evolutionaryAlgorithms.json # Algorithm configurations
│   │   └── optimizationFunctions.json  # Function configurations
│   ├── assets/                # Static assets for the application
│   ├── main.tsx               # Application entry point
│   ├── App.tsx                # Main App component
│   ├── App.css                # App-specific styles
│   └── index.css              # Global styles
├── public/                    # Static assets
│   ├── science-icon.svg       # Science icon for the website favicon
│   └── vite.svg               # Vite logo (default)
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

### Artificial Bee Colony (ABC)
- Representation: Real-valued vectors (food sources)
- Phases: Employed bee, onlooker bee, and scout bee phases
- Food Source Selection: Probability-based selection proportional to nectar amount
- Neighborhood Search: Modification of solution components
- Abandonment: Scout bees replace abandoned food sources
- Parameters: Limit for abandonment, scaling factor for neighborhood search

### Simulated Annealing (SA)
- Representation: Single solution (state)
- Temperature: Controls probability of accepting worse solutions
- Cooling Schedule: Gradually reduces temperature over time
- Neighborhood Function: Generates candidate solutions near current state
- Acceptance Criterion: Probabilistic acceptance based on Boltzmann distribution
- Parameters: Initial temperature, cooling rate, neighborhood size

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
git clone https://github.com/ShayVD/evolutionary-algorithms-visualization.git

# Navigate to the project directory
cd evolutionary-algorithms-visualization

# Install dependencies
npm install

# Start the development server
npm run dev
```

## Contributing

Contributions to this project are highly welcome! Whether you want to add new optimization problems, implement additional evolutionary algorithms, improve visualizations, or fix bugs - your help is appreciated.

### How to Contribute

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See the "Extending the Project" section above for details on how to add new optimization functions or evolutionary algorithms.

### Live Demo

Visit the official live version of this project at [www.evolutionaryalgorithms.eu](https://www.evolutionaryalgorithms.eu) to see it in action!

## License

MIT 

## Extending the Project

This section provides guidance on how to extend the project by adding new optimization functions or evolutionary algorithms.

### Adding a New Optimization Function

To add a new optimization function to the project, follow these steps:

1. **Update the Functions Configuration File**:
   - Open `src/config/optimizationFunctions.json`
   - Add your new function to the JSON array

   Example:
   ```json
   {
     "id": "your-function-id",
     "name": "Your Function Name",
     "description": "A description of your function including its characteristics and global optimum.",
     "formula": "f(x) = ... (your formula)",
     "bounds": [-10, 10],
     "defaultDimension": 2,
     "isMinimization": true,
     "globalOptimum": {
       "point": [0, 0],
       "value": 0
     },
     "visualization": {
       "xRange": [-10, 10],
       "yRange": [-10, 10],
       "zRange": [0, 100],
       "colorScheme": "viridis",
       "formula2D": "x*x + y*y"
     },
     "icon": "🔍",
     "filePath": "YourFunction"
   }
   ```

   **Important Notes**:
   - The `point` property in `globalOptimum` should represent the position of the optimum for a 2D version
   - Make sure `xRange` and `yRange` in the visualization are appropriate for showing the interesting parts of your function
   - The `formula2D` is crucial for visualization - it should be valid JavaScript code that calculates the function value for 2D coordinates (x,y)
   - Choose distinctive `colorScheme` values like "viridis", "plasma", "inferno", "magma", "cividis", or "turbo"
   
2. **Create and Register the Function Implementation**:
   - Create a new file in the `src/problems/implementations` directory (e.g., `YourFunction.ts`)
   - Implement and register your function

   ```typescript
   import { registerFunction } from '../ContinuousFunctions';

   /**
    * Your function implementation
    * f(x) = ... (your formula)
    * 
    * A description of your function's characteristics
    */
   export function yourFunction(solution: number[]): number {
     // Implement your function evaluation logic here
     // Example:
     return solution.reduce((sum, value) => sum + Math.pow(value, 4), 0);
   }

   // Register the function with the registry
   registerFunction('your-function-id', yourFunction);
   ```

   **Important Notes**:
   - The `registerFunction` call must use the same `id` as specified in the JSON configuration file

That's it! The application will automatically use the configuration from the JSON file and the registered function evaluator to:
- Register the function in the problem selector
- Set up the visualization with appropriate ranges
- Display function details in the problem details component
- Configure the evaluation logic for the optimization process

This modular approach eliminates the need to modify existing files when adding new functions, making the process as simple as possible.

### Adding a New Evolutionary Algorithm

To add a new evolutionary algorithm to the project, follow these steps:

1. **Update the Algorithms Configuration File**:
   - Open `src/config/evolutionaryAlgorithms.json`
   - Add your new algorithm to the JSON array

   Example:
   ```json
   {
     "id": "your-algorithm-id",
     "name": "Your Algorithm Name",
     "description": "A description of how your algorithm works and its key characteristics.",
     "keyFeatures": [
       "Feature 1 of your algorithm",
       "Feature 2 of your algorithm",
       "Feature 3 of your algorithm"
     ],
     "defaultParameters": {
       "populationSize": 50,
       "maxGenerations": 100,
       "specificParam1": 0.5,
       "specificParam2": "default"
     },
     "icon": "🧬",
     "filePath": "YourNewAlgorithm"
   }
   ```

2. **Create a Type Definition for Algorithm Parameters** (if needed):
   - Open `src/types/index.ts`
   - Add a new interface for your algorithm's specific parameters

   ```typescript
   // YourNewAlgorithm specific parameters
   export interface YourNewAlgorithmParams extends AlgorithmParams {
     specificParam1: number;
     specificParam2: string;
     // Add other algorithm-specific parameters
   }
   ```

3. **Implement and Register the Algorithm**:
   - Create a new file in the `src/algorithms/implementations` directory (e.g., `YourNewAlgorithm.ts`)
   - Implement the `Algorithm` interface and register your algorithm
   
   ```typescript
   import { Algorithm } from '../Algorithm';
   import { Individual, AlgorithmParams, YourNewAlgorithmParams, AlgorithmStats } from '../../types';
   import { OptimizationProblem } from '../../types';
   import { registerAlgorithm } from '../AlgorithmFactory';

   /**
    * Your New Algorithm implementation
    */
   export class YourNewAlgorithm implements Algorithm<number[]> {
     private params: YourNewAlgorithmParams;
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
         specificParam2: "default"
       };
       
       // Initialize stats
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
     // ...
     
     initialize(params: AlgorithmParams): void {
       this.params = { ...this.params, ...params };
       this.reset();
     }
     
     // Implement other required methods...
   }

   // Register the algorithm with the factory
   registerAlgorithm('your-algorithm-id', YourNewAlgorithm);
   ```

That's it! The application will automatically:
1. Load your algorithm file using the `filePath` specified in the configuration
2. Register the algorithm in the algorithm selector dropdown
3. Display algorithm details in the algorithm details component
4. Set up the controls for parameters
5. Create instances when selected

The application uses a dynamic loading system that automatically discovers and loads algorithms based on the configuration file, so there's no need to modify any UI components when adding new algorithms. 