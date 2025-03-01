import { FC, useEffect } from 'react';
import { FormControl, InputLabel, Select, MenuItem, Typography, SelectChangeEvent } from '@mui/material';

interface AlgorithmSelectorProps {
  selectedAlgorithm: string | null;
  onAlgorithmChange: (algorithmId: string) => void;
}

const AlgorithmSelector: FC<AlgorithmSelectorProps> = ({ selectedAlgorithm, onAlgorithmChange }) => {
  // Available algorithms for selection
  const algorithms = [
    { 
      id: 'genetic-algorithm', 
      name: 'Genetic Algorithm', 
      description: 'A metaheuristic inspired by natural selection',
      icon: '🧬' // DNA icon representing genetics
    },
    { 
      id: 'evolution-strategy', 
      name: 'Evolution Strategy', 
      description: 'Self-adaptive search focused on mutation',
      icon: '🔄' // Represents adaptation and mutation
    },
    { 
      id: 'differential-evolution', 
      name: 'Differential Evolution', 
      description: 'Uses vector differences for mutation',
      icon: '↔️' // Represents vector differences
    },
    { 
      id: 'particle-swarm', 
      name: 'Particle Swarm Optimization', 
      description: 'Inspired by social behavior of bird flocking',
      icon: '🐦' // Bird representing swarm behavior
    },
    // Add more algorithms as needed
  ];

  // Auto-select first algorithm if none is selected
  useEffect(() => {
    if (!selectedAlgorithm && algorithms.length > 0) {
      onAlgorithmChange(algorithms[0].id);
    }
  }, [selectedAlgorithm, onAlgorithmChange, algorithms]);

  const handleChange = (event: SelectChangeEvent) => {
    onAlgorithmChange(event.target.value);
  };

  return (
    <div>
      <FormControl fullWidth variant="outlined">
        <InputLabel id="algorithm-select-label">Algorithm</InputLabel>
        <Select
          labelId="algorithm-select-label"
          id="algorithm-select"
          value={selectedAlgorithm || ''}
          onChange={handleChange}
          label="Algorithm"
        >
          {algorithms.map((algorithm) => (
            <MenuItem key={algorithm.id} value={algorithm.id}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: '1.25rem', marginRight: '8px' }}>{algorithm.icon}</span>
                <div>
                  <Typography variant="body1">{algorithm.name}</Typography>
                </div>
              </div>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};

export default AlgorithmSelector; 