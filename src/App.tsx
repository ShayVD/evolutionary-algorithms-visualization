import { useState, useEffect } from 'react'
import './App.css'
import { AppState, AlgorithmParams } from './types'
import Visualization from './components/Visualization/Visualization'
import StatsDisplay from './components/Visualization/StatsDisplay'
import { useEvolutionarySimulation } from './utils/hooks'
import Header from './components/Header'
import { ProblemDetails } from './components/ProblemDetails'
import { AlgorithmDetails } from './components/AlgorithmDetails'
import { 
  Container, 
  Box, 
  Paper, 
  Typography, 
  Stack, 
  Alert, 
  AlertTitle, 
  Button, 
  CssBaseline,
  ThemeProvider,
  createTheme,
  Link
} from '@mui/material'
import { createProblem } from './utils/visualization'

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  // Debug flags
  const [errors, setErrors] = useState<string[]>([]);

  // Application state
  const [appState, setAppState] = useState<AppState>({
    selectedProblem: null,
    selectedAlgorithm: null,
    algorithmParams: {
      populationSize: 50,
      maxGenerations: 100,
    },
    isRunning: false,
    speed: 1,
    currentStep: 0,
    stats: null,
  });

  // Problem instance state
  const [problemInstance, setProblemInstance] = useState<any>(null);

  // Error handler
  const handleError = (error: Error) => {
    console.error('Application error:', error);
    setErrors(prev => [...prev, error.message]);
  }

  // Initialize or update problem instance when selected problem changes
  useEffect(() => {
    if (appState.selectedProblem) {
      (async () => {
        try {
          // Type assertion to assure TypeScript that selectedProblem is not null here
          const problemId = appState.selectedProblem as string;
          const newProblem = await createProblem(problemId);
          setProblemInstance(newProblem);
        } catch (error) {
          handleError(error as Error);
        }
      })();
    } else {
      setProblemInstance(null);
    }
  }, [appState.selectedProblem]);

  // Use the evolutionary simulation hook with error handling
  let simulationHook;
  try {
    // Always call the hook, but handle null values inside
    simulationHook = useEvolutionarySimulation(
      appState.selectedAlgorithm || '', // Pass empty string instead of null
      appState.algorithmParams,
      problemInstance,
      appState.isRunning,
      appState.speed
    );
  } catch (error) {
    handleError(error as Error);
    simulationHook = {
      stats: null,
      step: 0,
      performStep: () => console.error('Cannot perform step due to an error'),
      resetAlgorithm: () => console.error('Cannot reset algorithm due to an error'),
      algorithm: null,
      problem: null
    };
  }

  const {
    stats: simulationStats,
    step: simulationStep,
    performStep,
    resetAlgorithm,
    algorithm: algorithmInstance
  } = simulationHook;

  // Update app state with simulation stats
  useEffect(() => {
    if (simulationStats) {
      try {
        setAppState(prevState => ({
          ...prevState,
          stats: simulationStats,
          currentStep: simulationStep
        }));
      } catch (error) {
        handleError(error as Error);
      }
    }
  }, [simulationStats, simulationStep]);

  // Handler for problem selection
  const handleProblemChange = (problemId: string) => {
    try {
      setAppState((prevState) => ({
        ...prevState,
        selectedProblem: problemId,
        currentStep: 0,
        stats: null,
        isRunning: false,
      }));
    } catch (error) {
      handleError(error as Error);
    }
  }

  // Handler for algorithm selection
  const handleAlgorithmChange = (algorithmId: string) => {
    try {
      setAppState((prevState) => ({
        ...prevState,
        selectedAlgorithm: algorithmId,
        currentStep: 0,
        stats: null,
        isRunning: false,
      }));
    } catch (error) {
      handleError(error as Error);
    }
  }

  // Handler for parameter changes
  const handleParameterChange = (params: AlgorithmParams) => {
    console.log('App received parameter change:', params);
    try {
      setAppState((prevState) => ({
        ...prevState,
        algorithmParams: params,
        currentStep: 0,
        stats: null,
        isRunning: false,
      }));
    } catch (error) {
      handleError(error as Error);
    }
  }

  // Handler for playback controls
  const handleStart = () => {
    try {
      setAppState((prevState) => ({
        ...prevState,
        isRunning: true,
      }));
    } catch (error) {
      handleError(error as Error);
    }
  }

  const handlePause = () => {
    try {
      setAppState((prevState) => ({
        ...prevState,
        isRunning: false,
      }));
    } catch (error) {
      handleError(error as Error);
    }
  }

  const handleReset = () => {
    try {
      resetAlgorithm();
      setAppState((prevState) => ({
        ...prevState,
        isRunning: false,
        currentStep: 0,
        stats: null,
      }));
    } catch (error) {
      handleError(error as Error);
    }
  }

  const handleStep = () => {
    try {
      performStep();
    } catch (error) {
      handleError(error as Error);
    }
  }

  const handleSpeedChange = (speed: number) => {
    try {
      setAppState((prevState) => ({
        ...prevState,
        speed,
      }));
    } catch (error) {
      handleError(error as Error);
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        {errors.length > 0 && (
          <Alert 
            severity="error" 
            sx={{ mb: 2 }}
            action={
              <Button 
                color="inherit" 
                size="small"
                onClick={() => setErrors([])}
              >
                Clear
              </Button>
            }
          >
            <AlertTitle>Errors</AlertTitle>
            <Box component="ul" sx={{ pl: 2 }}>
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </Box>
          </Alert>
        )}
        
        {/* Header */}
        <Header
          selectedProblem={appState.selectedProblem}
          selectedAlgorithm={appState.selectedAlgorithm}
          algorithmParams={appState.algorithmParams}
          isRunning={appState.isRunning}
          speed={appState.speed}
          onProblemChange={handleProblemChange}
          onAlgorithmChange={handleAlgorithmChange}
          onParamChange={handleParameterChange}
          onStart={handleStart}
          onPause={handlePause}
          onReset={handleReset}
          onStep={handleStep}
          onSpeedChange={handleSpeedChange}
        />

        <Container sx={{ py: 4 }}>
          <Stack spacing={3}>
            {/* Main visualization area */}
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Visualization</Typography>
              <Box sx={{ height: 500 }}>
                <Visualization 
                  problem={appState.selectedProblem}
                  algorithm={appState.selectedAlgorithm}
                  currentStep={appState.currentStep}
                  algorithmInstance={algorithmInstance || null}
                  algorithmParams={appState.algorithmParams}
                />
              </Box>
            </Paper>

            {/* Problem Details Panel */}
            {appState.selectedProblem && (
              <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Problem Details</Typography>
                <ProblemDetails selectedProblem={appState.selectedProblem} />
              </Paper>
            )}

            {/* Algorithm Details Panel */}
            {appState.selectedAlgorithm && (
              <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Algorithm Details</Typography>
                <AlgorithmDetails selectedAlgorithm={appState.selectedAlgorithm} />
              </Paper>
            )}

            {/* Statistics Panel */}
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Statistics</Typography>
              <StatsDisplay stats={appState.stats} />
            </Paper>
          </Stack>
        </Container>

        <Box component="footer" sx={{ bgcolor: 'grey.800', color: 'white', p: 2, mt: 4 }}>
          <Container>
            <Typography variant="body2" align="center">
              Evolutionary Algorithm Visualization &copy; {new Date().getFullYear()} | 
              <Link 
                href="https://github.com/ShayVD/evolutionary-algorithms-visualization" 
                target="_blank" 
                rel="noopener noreferrer"
                sx={{ color: 'white', ml: 1, textDecoration: 'underline' }}
              >
                GitHub
              </Link>
            </Typography>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  )
}

export default App
