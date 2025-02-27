import { FC } from 'react';
import { 
  Button, 
  ButtonGroup, 
  Slider, 
  Typography, 
  Box,
  Stack,
  IconButton
} from '@mui/material';
import { 
  PlayArrow, 
  Pause, 
  Stop, 
  SkipNext 
} from '@mui/icons-material';

interface PlaybackControlsProps {
  isRunning: boolean;
  speed: number;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onStep: () => void;
  onSpeedChange: (speed: number) => void;
  disabled: boolean;
  showOnlySlider?: boolean;
}

const PlaybackControls: FC<PlaybackControlsProps> = ({
  isRunning,
  speed,
  onStart,
  onPause,
  onReset,
  onStep,
  onSpeedChange,
  disabled,
  showOnlySlider = false
}) => {
  // Handle speed slider change
  const handleSpeedChange = (_event: Event, newValue: number | number[]) => {
    onSpeedChange(newValue as number);
  };

  // Render only the slider if showOnlySlider is true
  if (showOnlySlider) {
    return (
      <Box sx={{ width: '100%', maxWidth: 400 }}>
        <Slider
          aria-labelledby="speed-slider"
          min={0.1}
          max={10}
          step={0.1}
          value={speed}
          onChange={handleSpeedChange}
          disabled={disabled}
          marks={[
            { value: 0.1, label: 'Slow' },
            { value: 10, label: 'Fast' }
          ]}
          valueLabelDisplay="auto"
          valueLabelFormat={(value) => `${value.toFixed(1)}x`}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 500 }}>
      {/* Minimalistic playback controls */}
      <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
        {/* Speed indicator */}
        <Typography variant="caption" sx={{ minWidth: 60, textAlign: 'center' }}>
          {speed.toFixed(1)}x
        </Typography>
        
        {/* Speed slider */}
        <Slider
          size="small"
          aria-labelledby="speed-slider"
          min={0.1}
          max={10}
          step={0.1}
          value={speed}
          onChange={handleSpeedChange}
          disabled={disabled}
          sx={{ mx: 2, maxWidth: 200 }}
        />
        
        {/* Control buttons */}
        <Box>
          {!isRunning ? (
            <IconButton
              onClick={onStart}
              disabled={disabled}
              color="success"
              size="small"
              sx={{ mx: 0.5 }}
            >
              <PlayArrow />
            </IconButton>
          ) : (
            <IconButton
              onClick={onPause}
              color="warning"
              size="small"
              sx={{ mx: 0.5 }}
            >
              <Pause />
            </IconButton>
          )}
          
          <IconButton
            onClick={onReset}
            disabled={disabled}
            color="error"
            size="small"
            sx={{ mx: 0.5 }}
          >
            <Stop />
          </IconButton>
          
          <IconButton
            onClick={onStep}
            disabled={disabled || isRunning}
            color="primary"
            size="small"
            sx={{ mx: 0.5 }}
          >
            <SkipNext />
          </IconButton>
        </Box>
      </Stack>
    </Box>
  );
};

export default PlaybackControls; 