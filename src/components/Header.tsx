import { FC, useState } from 'react';
import { AlgorithmParams } from '../types';
import { ProblemSelector } from './ProblemDetails';
import { AlgorithmSelector } from './AlgorithmDetails';
import ParameterControls from './ControlPanel/ParameterControls';
import PlaybackControls from './ControlPanel/PlaybackControls';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  IconButton, 
  Collapse,
  Container,
  Paper,
  Stack
} from '@mui/material';
import { 
  Settings as SettingsIcon, 
  Science as ScienceIcon
} from '@mui/icons-material';

interface HeaderProps {
  selectedProblem: string | null;
  selectedAlgorithm: string | null;
  algorithmParams: AlgorithmParams;
  isRunning: boolean;
  speed: number;
  onProblemChange: (problemId: string) => void;
  onAlgorithmChange: (algorithmId: string) => void;
  onParamChange: (params: AlgorithmParams) => void;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onStep: () => void;
  onSpeedChange: (speed: number) => void;
}

const Header: FC<HeaderProps> = ({
  selectedProblem,
  selectedAlgorithm,
  algorithmParams,
  isRunning,
  speed,
  onProblemChange,
  onAlgorithmChange,
  onParamChange,
  onStart,
  onPause,
  onReset,
  onStep,
  onSpeedChange,
}) => {
  const [activePanel, setActivePanel] = useState<string | null>(null);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="sticky" color="default" elevation={2} sx={{ backgroundColor: 'white' }}>
        <Container maxWidth="xl">
          <Toolbar sx={{ flexWrap: 'wrap', py: 1 }}>
            {/* Logo/Title */}
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                flexGrow: 0, 
                mr: 3, 
                color: 'primary.main', 
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <ScienceIcon sx={{ mr: 1 }} />
              EA Visualization
            </Typography>
            
            {/* Problem Selector */}
            <Box sx={{ width: 200, mx: 1, flexShrink: 0 }}>
              <ProblemSelector 
                selectedProblem={selectedProblem} 
                onProblemChange={onProblemChange} 
              />
            </Box>
            
            {/* Algorithm Selector */}
            <Box sx={{ width: 200, mx: 1, flexShrink: 0 }}>
              <AlgorithmSelector 
                selectedAlgorithm={selectedAlgorithm}
                onAlgorithmChange={onAlgorithmChange}
              />
            </Box>
            
            <Box sx={{ flexGrow: 1 }} />
            
            {/* Settings Buttons */}
            <Stack direction="row" spacing={1}>
              <IconButton
                color={activePanel === 'parameters' ? 'primary' : 'default'}
                onClick={() => setActivePanel(activePanel === 'parameters' ? null : 'parameters')}
                disabled={!selectedAlgorithm}
                size="small"
                sx={{ 
                  border: 1, 
                  borderColor: activePanel === 'parameters' ? 'primary.main' : 'grey.300',
                  backgroundColor: activePanel === 'parameters' ? 'primary.50' : 'transparent',
                  '&:hover': {
                    backgroundColor: activePanel === 'parameters' ? 'primary.100' : 'grey.100'
                  }
                }}
              >
                <SettingsIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Toolbar>
          
          {/* Playback Controls - Always visible under the toolbar */}
          <Box sx={{ py: 1, px: 2, display: 'flex', justifyContent: 'center', borderBottom: 1, borderColor: 'divider' }}>
            <PlaybackControls 
              isRunning={isRunning}
              speed={speed}
              onStart={onStart}
              onPause={onPause}
              onReset={onReset}
              onStep={onStep}
              onSpeedChange={onSpeedChange}
              disabled={!selectedProblem || !selectedAlgorithm}
            />
          </Box>

          {/* Expandable Panels */}
          <Collapse in={activePanel === 'parameters'}>
            <Paper sx={{ p: 2, mb: 1, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                Algorithm Parameters
              </Typography>
              <ParameterControls 
                params={algorithmParams}
                onParamChange={onParamChange}
                disabled={isRunning}
                selectedAlgorithm={selectedAlgorithm}
              />
            </Paper>
          </Collapse>
        </Container>
      </AppBar>
    </Box>
  );
};

export default Header; 