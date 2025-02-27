import { FC, useEffect } from 'react';
import { FormControl, InputLabel, Select, MenuItem, Typography, SelectChangeEvent } from '@mui/material';

interface ProblemSelectorProps {
  selectedProblem: string | null;
  onProblemChange: (problemId: string) => void;
}

const ProblemSelector: FC<ProblemSelectorProps> = ({ selectedProblem, onProblemChange }) => {
  // Available problems for selection
  const problems = [
    { 
      id: 'sphere', 
      name: 'Sphere Function', 
      description: 'A simple, continuous, convex, and unimodal function',
      icon: '🔵' // Simple emoji icon for representation
    },
    { 
      id: 'rastrigin', 
      name: 'Rastrigin Function', 
      description: 'A highly multimodal function with many local minima',
      icon: '🌊' // Represents the wave-like surface of Rastrigin
    },
    { 
      id: 'rosenbrock', 
      name: 'Rosenbrock Function', 
      description: 'A non-convex function with a narrow valley',
      icon: '🏔️' // Represents the valley shape of Rosenbrock
    },
    { 
      id: 'ackley', 
      name: 'Ackley Function', 
      description: 'A multimodal function with many local minima',
      icon: '🎯' // Represents the many local minima with a central target
    },
    { 
      id: 'schwefel222', 
      name: 'Schwefel Problem 2.22', 
      description: 'A unimodal function that combines sum and product of absolute values',
      icon: '📊' // Represents mathematical operations
    },
    // Add more problems as needed
  ];

  // Auto-select first problem if none is selected
  useEffect(() => {
    if (!selectedProblem && problems.length > 0) {
      onProblemChange(problems[0].id);
    }
  }, [selectedProblem, onProblemChange, problems]);

  // Get the selected problem's details
  const selectedProblemDetails = selectedProblem 
    ? problems.find(p => p.id === selectedProblem) 
    : null;

  const handleChange = (event: SelectChangeEvent) => {
    onProblemChange(event.target.value);
  };

  return (
    <div>
      <FormControl fullWidth variant="outlined">
        <InputLabel id="problem-select-label">Problem</InputLabel>
        <Select
          labelId="problem-select-label"
          id="problem-select"
          value={selectedProblem || ''}
          onChange={handleChange}
          label="Problem"
        >
          {problems.map((problem) => (
            <MenuItem key={problem.id} value={problem.id}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: '1.25rem', marginRight: '8px' }}>{problem.icon}</span>
                <div>
                  <Typography variant="body1">{problem.name}</Typography>
                </div>
              </div>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};

export default ProblemSelector; 