import { FC } from 'react';
import { Box, Typography, Grid, Divider } from '@mui/material';

interface AlgorithmDetailsProps {
  selectedAlgorithm: string | null;
}

const AlgorithmDetails: FC<AlgorithmDetailsProps> = ({ selectedAlgorithm }) => {
  // Algorithm-specific details and configurations
  const algorithmDetails: Record<string, {
    title: string;
    description: string;
    config: React.ReactNode;
  }> = {
    'genetic-algorithm': {
      title: 'Genetic Algorithm',
      description: 'A metaheuristic inspired by natural selection that uses mechanisms like mutation, crossover, and selection.',
      config: (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>Key Components</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Selection</Typography>
              <Typography variant="body2">Tournament, Roulette wheel</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Crossover</Typography>
              <Typography variant="body2">Single-point, Two-point, Uniform</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Mutation</Typography>
              <Typography variant="body2">Bit-flip, Gaussian, Swap</Typography>
            </Grid>
          </Grid>
        </Box>
      )
    },
    'evolution-strategy': {
      title: 'Evolution Strategy',
      description: 'A stochastic optimization technique that adapts mutation step sizes during the search process.',
      config: (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>Key Components</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Selection</Typography>
              <Typography variant="body2">(μ,λ) or (μ+λ)</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Mutation</Typography>
              <Typography variant="body2">Self-adaptive step sizes</Typography>
            </Grid>
          </Grid>
        </Box>
      )
    },
    'particle-swarm': {
      title: 'Particle Swarm Optimization',
      description: 'A population-based stochastic optimization technique inspired by social behavior of bird flocking or fish schooling.',
      config: (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>Key Components</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Parameters</Typography>
              <Typography variant="body2">Inertia weight, Cognitive/Social factors</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Movement</Typography>
              <Typography variant="body2">Velocity update, Position update</Typography>
            </Grid>
          </Grid>
        </Box>
      )
    },
    'differential-evolution': {
      title: 'Differential Evolution',
      description: 'A vector-based evolutionary algorithm that uses vector differences for perturbing the vector population.',
      config: (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>Key Components</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Mutation</Typography>
              <Typography variant="body2">Differential mutation</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Crossover</Typography>
              <Typography variant="body2">Binomial, Exponential</Typography>
            </Grid>
          </Grid>
        </Box>
      )
    },
  };

  // If no algorithm is selected, show placeholder
  if (!selectedAlgorithm || !algorithmDetails[selectedAlgorithm]) {
    return (
      <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
        <Typography variant="body2">Select an algorithm to see details</Typography>
      </Box>
    );
  }

  const algorithm = algorithmDetails[selectedAlgorithm];

  return (
    <Box>
      <Typography variant="h6" gutterBottom>{algorithm.title}</Typography>
      <Typography variant="body2" paragraph>{algorithm.description}</Typography>
      <Divider sx={{ my: 1.5 }} />
      {algorithm.config}
    </Box>
  );
};

export default AlgorithmDetails; 