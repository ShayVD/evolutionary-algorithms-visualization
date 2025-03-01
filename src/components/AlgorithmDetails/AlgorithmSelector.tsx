import { FC, useEffect, useState } from 'react';
import { FormControl, InputLabel, Select, MenuItem, Typography, SelectChangeEvent, CircularProgress } from '@mui/material';
import { getAvailableAlgorithms } from '../../algorithms/AlgorithmFactory';

interface AlgorithmSelectorProps {
  selectedAlgorithm: string | null;
  onAlgorithmChange: (algorithmId: string) => void;
}

const AlgorithmSelector: FC<AlgorithmSelectorProps> = ({ selectedAlgorithm, onAlgorithmChange }) => {
  const [algorithms, setAlgorithms] = useState<{ id: string; name: string; description: string; icon: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch available algorithms from the factory
  useEffect(() => {
    const fetchAlgorithms = async () => {
      try {
        setLoading(true);
        const availableAlgorithms = await getAvailableAlgorithms();
        setAlgorithms(availableAlgorithms);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching algorithms:', error);
        setLoading(false);
      }
    };

    fetchAlgorithms();
  }, []);

  // Auto-select first algorithm if none is selected
  useEffect(() => {
    if (!selectedAlgorithm && algorithms.length > 0) {
      onAlgorithmChange(algorithms[0].id);
    }
  }, [selectedAlgorithm, onAlgorithmChange, algorithms]);

  const handleChange = (event: SelectChangeEvent) => {
    onAlgorithmChange(event.target.value);
  };

  if (loading) {
    return <CircularProgress size={24} />;
  }

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