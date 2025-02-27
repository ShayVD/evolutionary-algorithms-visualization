import { FC, useEffect, useState, ChangeEvent } from 'react';
import { AlgorithmParams, GeneticAlgorithmParams, EvolutionStrategyParams } from '../../types';
import { 
  Box, 
  Grid, 
  TextField, 
  Slider, 
  Typography, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormHelperText,
  Divider,
  SelectChangeEvent
} from '@mui/material';

interface ParameterControlsProps {
  params: AlgorithmParams;
  onParamChange: (params: AlgorithmParams) => void;
  disabled: boolean;
  selectedAlgorithm: string | null;
}

const ParameterControls: FC<ParameterControlsProps> = ({ 
  params, 
  onParamChange, 
  disabled, 
  selectedAlgorithm 
}) => {
  const [localParams, setLocalParams] = useState<AlgorithmParams>(params);

  // Update local params when selected algorithm changes
  useEffect(() => {
    if (selectedAlgorithm === 'genetic-algorithm') {
      setLocalParams({
        ...params,
        crossoverRate: (params as GeneticAlgorithmParams).crossoverRate || 0.8,
        mutationRate: (params as GeneticAlgorithmParams).mutationRate || 0.1,
        selectionMethod: (params as GeneticAlgorithmParams).selectionMethod || 'tournament',
        tournamentSize: (params as GeneticAlgorithmParams).tournamentSize || 3,
      });
    } else if (selectedAlgorithm === 'evolution-strategy') {
      setLocalParams({
        ...params,
        mu: (params as EvolutionStrategyParams).mu || 10,
        lambda: (params as EvolutionStrategyParams).lambda || 20,
        selectionType: (params as EvolutionStrategyParams).selectionType || 'plus',
        initialStepSize: (params as EvolutionStrategyParams).initialStepSize || 1.0,
      });
    } else {
      // Default parameters for other algorithms
      setLocalParams({
        populationSize: params.populationSize || 50,
        maxGenerations: params.maxGenerations || 100,
      });
    }
  }, [selectedAlgorithm, params]);

  // Handle text field changes
  const handleTextFieldChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    // Parse numeric values
    const numericValue = type === 'number' ? parseFloat(value) : value;
    
    setLocalParams(prev => ({
      ...prev,
      [name]: numericValue
    }));
    
    // Notify parent component of parameter changes
    onParamChange({
      ...localParams,
      [name]: numericValue
    });
  };

  // Handle select changes
  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    
    setLocalParams(prev => ({
      ...prev,
      [name]: value
    }));
    
    onParamChange({
      ...localParams,
      [name]: value
    });
  };

  // Handle slider changes
  const handleSliderChange = (name: string) => (_: Event, value: number | number[]) => {
    setLocalParams(prev => ({
      ...prev,
      [name]: value
    }));
    
    onParamChange({
      ...localParams,
      [name]: value
    });
  };

  // Render algorithm-specific parameters
  const renderAlgorithmSpecificParams = () => {
    if (selectedAlgorithm === 'genetic-algorithm') {
      return (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>Genetic Algorithm Parameters</Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" gutterBottom>
                Crossover Rate: {(localParams as GeneticAlgorithmParams).crossoverRate?.toFixed(2)}
              </Typography>
              <Slider
                name="crossoverRate"
                value={(localParams as GeneticAlgorithmParams).crossoverRate || 0.8}
                onChange={handleSliderChange('crossoverRate')}
                min={0}
                max={1}
                step={0.01}
                disabled={disabled}
                valueLabelDisplay="auto"
                sx={{ mt: 1 }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" gutterBottom>
                Mutation Rate: {(localParams as GeneticAlgorithmParams).mutationRate?.toFixed(2)}
              </Typography>
              <Slider
                name="mutationRate"
                value={(localParams as GeneticAlgorithmParams).mutationRate || 0.1}
                onChange={handleSliderChange('mutationRate')}
                min={0}
                max={1}
                step={0.01}
                disabled={disabled}
                valueLabelDisplay="auto"
                sx={{ mt: 1 }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small" disabled={disabled}>
                <InputLabel id="selection-method-label">Selection Method</InputLabel>
                <Select
                  labelId="selection-method-label"
                  id="selection-method"
                  name="selectionMethod"
                  value={(localParams as GeneticAlgorithmParams).selectionMethod || 'tournament'}
                  onChange={handleSelectChange}
                  label="Selection Method"
                >
                  <MenuItem value="tournament">Tournament</MenuItem>
                  <MenuItem value="roulette">Roulette Wheel</MenuItem>
                  <MenuItem value="rank">Rank</MenuItem>
                </Select>
                <FormHelperText>How individuals are selected for reproduction</FormHelperText>
              </FormControl>
            </Grid>
            
            {(localParams as GeneticAlgorithmParams).selectionMethod === 'tournament' && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Tournament Size"
                  name="tournamentSize"
                  type="number"
                  value={(localParams as GeneticAlgorithmParams).tournamentSize || 3}
                  onChange={handleTextFieldChange}
                  disabled={disabled}
                  InputProps={{ inputProps: { min: 2, max: 10 } }}
                  helperText="Number of individuals in each tournament"
                />
              </Grid>
            )}
          </Grid>
        </Box>
      );
    } else if (selectedAlgorithm === 'evolution-strategy') {
      return (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>Evolution Strategy Parameters</Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="μ (Parent Population)"
                name="mu"
                type="number"
                value={(localParams as EvolutionStrategyParams).mu || 10}
                onChange={handleTextFieldChange}
                disabled={disabled}
                InputProps={{ inputProps: { min: 1, max: 100 } }}
                helperText="Number of parents in each generation"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="λ (Offspring Population)"
                name="lambda"
                type="number"
                value={(localParams as EvolutionStrategyParams).lambda || 20}
                onChange={handleTextFieldChange}
                disabled={disabled}
                InputProps={{ inputProps: { min: 1, max: 200 } }}
                helperText="Number of offspring in each generation"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small" disabled={disabled}>
                <InputLabel id="selection-type-label">Selection Type</InputLabel>
                <Select
                  labelId="selection-type-label"
                  id="selection-type"
                  name="selectionType"
                  value={(localParams as EvolutionStrategyParams).selectionType || 'plus'}
                  onChange={handleSelectChange}
                  label="Selection Type"
                >
                  <MenuItem value="plus">(μ+λ) Selection</MenuItem>
                  <MenuItem value="comma">(μ,λ) Selection</MenuItem>
                </Select>
                <FormHelperText>How the next generation is selected</FormHelperText>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" gutterBottom>
                Initial Step Size: {(localParams as EvolutionStrategyParams).initialStepSize?.toFixed(2)}
              </Typography>
              <Slider
                name="initialStepSize"
                value={(localParams as EvolutionStrategyParams).initialStepSize || 1.0}
                onChange={handleSliderChange('initialStepSize')}
                min={0.1}
                max={5}
                step={0.1}
                disabled={disabled}
                valueLabelDisplay="auto"
                sx={{ mt: 1 }}
              />
            </Grid>
          </Grid>
        </Box>
      );
    }
    
    return null;
  };

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>Common Parameters</Typography>
      <Divider sx={{ mb: 2 }} />
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            label="Population Size"
            name="populationSize"
            type="number"
            value={localParams.populationSize || 50}
            onChange={handleTextFieldChange}
            disabled={disabled}
            InputProps={{ inputProps: { min: 10, max: 500 } }}
            helperText="Number of individuals in the population"
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            label="Max Generations"
            name="maxGenerations"
            type="number"
            value={localParams.maxGenerations || 100}
            onChange={handleTextFieldChange}
            disabled={disabled}
            InputProps={{ inputProps: { min: 10, max: 1000 } }}
            helperText="Maximum number of generations to run"
          />
        </Grid>
      </Grid>
      
      {renderAlgorithmSpecificParams()}
    </Box>
  );
};

export default ParameterControls; 