import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Slider,
  Typography,
  TextField,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Tooltip,
  FormHelperText,
  SelectChangeEvent,
} from '@mui/material';
import { 
  AlgorithmParams
} from '../../types';
import algorithmsConfig from '../../config/evolutionaryAlgorithms.json';

// Define interfaces for parameter metadata
type ParameterInputType = 'slider' | 'number' | 'select';

interface SelectOption {
  value: string;
  label: string;
}

interface ParameterMetadata {
  label: string;
  type: ParameterInputType;
  min?: number;
  max?: number;
  step?: number;
  helperText?: string;
  decimals?: number;
  options?: SelectOption[];
  condition?: string;
}

interface AlgorithmMetadata {
  id: string;
  name: string;
  defaultParameters: Record<string, any>;
  parameterMetadata: Record<string, ParameterMetadata>;
  constraints?: {
    fixedPopulationSize?: number;
    populationSizeHelperText?: string;
  };
}

interface ParameterControlsProps {
  selectedAlgorithm: string | null;
  onParamChange: (params: AlgorithmParams) => void;
  params?: AlgorithmParams;
  disabled?: boolean;
}

const ParameterControls: React.FC<ParameterControlsProps> = ({
  selectedAlgorithm,
  onParamChange = () => {}, // Provide a default empty function
  params: initialParams,
  disabled = false,
}) => {
  // Local state for parameters
  const [localParams, setLocalParams] = useState<AlgorithmParams>(initialParams || {
    populationSize: 50,
    maxGenerations: 100,
  });

  // Reference to track if we've applied fixed parameters for the current algorithm
  const hasFixedParamRef = useRef<{ algorithmId: string; fixed: boolean }>({
    algorithmId: '',
    fixed: false,
  });

  // Reference to track previous parameters to prevent infinite update loops
  const prevParamsRef = useRef<AlgorithmParams | null>(null);

  // Get algorithm metadata from configuration
  const getAlgorithmMetadata = (algorithmId: string): AlgorithmMetadata | undefined => {
    return algorithmsConfig.find((algo: any) => algo.id === algorithmId) as unknown as AlgorithmMetadata;
  };

  // Effect to update parameters when algorithm changes
  useEffect(() => {
    const algorithmMetadata = getAlgorithmMetadata(selectedAlgorithm || '');
    
    if (algorithmMetadata) {
      console.log('Algorithm changed to:', selectedAlgorithm, 'with metadata:', algorithmMetadata);
      
      // Reset fixed parameter tracking when algorithm changes
      if (hasFixedParamRef.current.algorithmId !== selectedAlgorithm) {
        hasFixedParamRef.current = {
          algorithmId: selectedAlgorithm || '',
          fixed: false,
        };
      }

      // Create new params based on defaults from the config
      const newParams: AlgorithmParams = {
        populationSize: algorithmMetadata.defaultParameters.populationSize || 50,
        maxGenerations: algorithmMetadata.defaultParameters.maxGenerations || 100,
        ...algorithmMetadata.defaultParameters
      };

      // Apply fixed population size constraint if specified
      const fixedPopulationSize = algorithmMetadata.constraints?.fixedPopulationSize;
      if (fixedPopulationSize !== undefined && fixedPopulationSize !== null && !hasFixedParamRef.current.fixed) {
        newParams.populationSize = fixedPopulationSize;
        hasFixedParamRef.current.fixed = true;
      }

      // Check if parameters have actually changed to prevent infinite loops
      const prevParams = prevParamsRef.current;
      const hasChanged = !prevParams || 
        JSON.stringify(prevParams) !== JSON.stringify(newParams);

      if (hasChanged) {
        console.log('Updating parameters to:', newParams);
        // Update local state
        setLocalParams(newParams);
        prevParamsRef.current = newParams;
        
        // Notify parent only if params have changed
        if (typeof onParamChange === 'function') {
          console.log('Calling onParamChange with:', newParams);
          onParamChange(newParams);
        }
      }
    }
  }, [selectedAlgorithm]); // Removed onParamChange from dependencies

  // Handle slider changes
  const handleSliderChange = (param: string) => (_: Event, value: number | number[]) => {
    const newValue = Array.isArray(value) ? value[0] : value;
    
    // Ensure we have a proper copy of all parameters first
    const newParams = { 
      ...localParams, 
      [param]: newValue,
      // Explicitly include the core parameters to ensure they're never dropped
      populationSize: param === 'populationSize' ? newValue : localParams.populationSize,
      maxGenerations: param === 'maxGenerations' ? newValue : localParams.maxGenerations,
    };
    
    console.log(`Parameter ${param} changed to ${newValue}. New params:`, newParams);
    
    // Update our tracking ref to prevent loops in useEffect
    prevParamsRef.current = newParams;
    
    setLocalParams(newParams);
    
    if (typeof onParamChange === 'function') {
      onParamChange(newParams);
    }
  };

  // Handle number input changes
  const handleNumberInputChange = (param: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? '' : Number(e.target.value);
    if (value === '' || (!isNaN(value) && value >= 0)) {
      // Ensure we have a proper copy of all parameters first
      const newParams = { 
        ...localParams, 
        [param]: value === '' ? 0 : value,
        // Explicitly include the core parameters to ensure they're never dropped
        populationSize: param === 'populationSize' ? (value === '' ? 0 : value) : localParams.populationSize,
        maxGenerations: param === 'maxGenerations' ? (value === '' ? 0 : value) : localParams.maxGenerations,
      };
      
      console.log(`Parameter ${param} changed to ${value}. New params:`, newParams);
      
      // Update our tracking ref to prevent loops in useEffect
      prevParamsRef.current = newParams;
      
      setLocalParams(newParams);
      
      if (typeof onParamChange === 'function') {
        onParamChange(newParams);
      }
    }
  };

  // Handle select changes
  const handleSelectChange = (param: string) => (e: SelectChangeEvent<string>) => {
    const value = e.target.value;
    
    // Ensure we have a proper copy of all parameters first
    const newParams = { 
      ...localParams, 
      [param]: value,
      // Explicitly include the core parameters to ensure they're never dropped
      populationSize: localParams.populationSize,
      maxGenerations: localParams.maxGenerations, 
    };
    
    console.log(`Parameter ${param} changed to ${value}. New params:`, newParams);
    
    // Update our tracking ref to prevent loops in useEffect
    prevParamsRef.current = newParams;
    
    setLocalParams(newParams);
    
    if (typeof onParamChange === 'function') {
      onParamChange(newParams);
    }
  };

  // Evaluate a condition for parameter visibility
  const evaluateCondition = (condition: string): boolean => {
    // For the specific case we know about - handle it directly
    if (condition === "selectionMethod === 'tournament'") {
      return localParams.selectionMethod === 'tournament';
    }
    
    // If there are other conditions in the future, you can add more cases here
    // Example:
    // if (condition === "someCondition") {
    //   return someLogic;
    // }
    
    // Log conditions we don't recognize
    console.warn('Unhandled condition:', condition, 'with params:', localParams);
    return true; // Default to showing the parameter if we can't evaluate
  };

  // Render parameter controls
  const renderParameterControl = (paramName: string, metadata: ParameterMetadata) => {
    // Check conditional rendering
    if (metadata.condition) {
      // Use the safer evaluation method
      if (!evaluateCondition(metadata.condition)) {
        return null;
      }
    }

    const value = localParams[paramName] ?? 0;

    switch (metadata.type) {
      case 'slider':
        return (
          <Box key={paramName} sx={{ width: '100%', mt: 2 }}>
            <Typography gutterBottom>{metadata.label}</Typography>
            <Slider
              value={value}
              onChange={handleSliderChange(paramName)}
              aria-labelledby={`${paramName}-slider`}
              valueLabelDisplay="auto"
              step={metadata.step || 1}
              marks
              min={metadata.min || 0}
              max={metadata.max || 100}
              valueLabelFormat={(v) => metadata.decimals ? v.toFixed(metadata.decimals) : v}
              disabled={disabled}
            />
            {metadata.helperText && (
              <FormHelperText>{metadata.helperText}</FormHelperText>
            )}
          </Box>
        );
      case 'number':
        return (
          <Box key={paramName} sx={{ width: '100%', mt: 2 }}>
            <TextField
              label={metadata.label}
              type="number"
              value={value}
              onChange={handleNumberInputChange(paramName)}
              inputProps={{
                min: metadata.min || 0,
                max: metadata.max || 100,
                step: metadata.step || 1,
              }}
              fullWidth
              variant="outlined"
              margin="normal"
              helperText={metadata.helperText}
              disabled={disabled}
            />
          </Box>
        );
      case 'select':
        return (
          <Box key={paramName} sx={{ width: '100%', mt: 2 }}>
            <FormControl fullWidth disabled={disabled}>
              <InputLabel id={`${paramName}-select-label`}>{metadata.label}</InputLabel>
              <Select
                labelId={`${paramName}-select-label`}
                id={`${paramName}-select`}
                value={String(value)}
                label={metadata.label}
                onChange={handleSelectChange(paramName)}
              >
                {metadata.options?.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
              {metadata.helperText && (
                <FormHelperText>{metadata.helperText}</FormHelperText>
              )}
            </FormControl>
          </Box>
        );
      default:
        return null;
    }
  };

  // Get current algorithm metadata
  const algorithmMetadata = getAlgorithmMetadata(selectedAlgorithm || '');
  
  if (!algorithmMetadata) {
    return <Typography>No configuration found for the selected algorithm.</Typography>;
  }

  // Check if population size is fixed for this algorithm
  const hasFixedPopulationSize = algorithmMetadata.constraints?.fixedPopulationSize !== undefined && 
                               algorithmMetadata.constraints?.fixedPopulationSize !== null;

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Algorithm Parameters
      </Typography>
      
      {/* Common Parameters */}
      <Box sx={{ width: '100%', mt: 2 }}>
        <Tooltip title={hasFixedPopulationSize ? (algorithmMetadata.constraints?.populationSizeHelperText || '') : ''}>
          <TextField
            label="Population Size"
            type="number"
            value={localParams.populationSize}
            onChange={handleNumberInputChange('populationSize')}
            inputProps={{
              min: 1,
              max: 200,
              readOnly: hasFixedPopulationSize,
            }}
            fullWidth
            variant="outlined"
            margin="normal"
            disabled={hasFixedPopulationSize || disabled}
            sx={{
              '& .Mui-disabled': {
                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                cursor: 'not-allowed',
              },
            }}
          />
        </Tooltip>
      </Box>
      
      <Box sx={{ width: '100%', mt: 2 }}>
        <TextField
          label="Max Generations"
          type="number"
          value={localParams.maxGenerations}
          onChange={handleNumberInputChange('maxGenerations')}
          inputProps={{
            min: 1,
            max: 1000,
          }}
          fullWidth
          variant="outlined"
          margin="normal"
          disabled={disabled}
        />
      </Box>
      
      {/* Algorithm-specific Parameters */}
      {Object.entries(algorithmMetadata.parameterMetadata || {}).map(([paramName, metadata]) =>
        renderParameterControl(paramName, metadata)
      )}
    </Box>
  );
};

export default ParameterControls; 