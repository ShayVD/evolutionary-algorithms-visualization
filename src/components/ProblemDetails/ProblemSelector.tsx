import { FC, useEffect, useState } from 'react';
import { FormControl, InputLabel, Select, MenuItem, Typography, SelectChangeEvent, CircularProgress } from '@mui/material';
import { getAvailableFunctions } from '../../problems/ContinuousFunctions';

interface Problem {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface ProblemSelectorProps {
  selectedProblem: string | null;
  onProblemChange: (problemId: string) => void;
}

const ProblemSelector: FC<ProblemSelectorProps> = ({ selectedProblem, onProblemChange }) => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Load problems from the registry
  useEffect(() => {
    const loadProblems = async () => {
      try {
        setLoading(true);
        const availableProblems = await getAvailableFunctions();
        setProblems(availableProblems);
        setLoading(false);
        
        // Auto-select first problem if none is selected
        if (!selectedProblem && availableProblems.length > 0) {
          onProblemChange(availableProblems[0].id);
        }
      } catch (error) {
        console.error('Failed to load problems:', error);
        setLoading(false);
      }
    };
    
    loadProblems();
  }, [selectedProblem, onProblemChange]);

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
          disabled={loading}
        >
          {loading ? (
            <MenuItem disabled>
              <CircularProgress size={20} />
              <span style={{ marginLeft: 10 }}>Loading problems...</span>
            </MenuItem>
          ) : (
            problems.map((problem) => (
              <MenuItem key={problem.id} value={problem.id}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.25rem', marginRight: '8px' }}>{problem.icon}</span>
                  <div>
                    <Typography variant="body1">{problem.name}</Typography>
                  </div>
                </div>
              </MenuItem>
            ))
          )}
        </Select>
      </FormControl>
    </div>
  );
};

export default ProblemSelector; 