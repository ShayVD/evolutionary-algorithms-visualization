import { FC } from 'react';
import { Box, Typography, Grid, Divider } from '@mui/material';

interface ProblemDetailsProps {
  selectedProblem: string | null;
}

const ProblemDetails: FC<ProblemDetailsProps> = ({ selectedProblem }) => {
  // Problem-specific details and configurations
  const problemDetails: Record<string, {
    title: string;
    description: string;
    config: React.ReactNode;
  }> = {
    'sphere': {
      title: 'Sphere Function',
      description: 'A simple, continuous, convex, and unimodal function. The global minimum is at (0,0,...,0) with a value of 0.',
      config: (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>Configuration</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Dimensions</Typography>
              <Typography variant="body2">2</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Search Range</Typography>
              <Typography variant="body2">[-5.12, 5.12]</Typography>
            </Grid>
          </Grid>
        </Box>
      )
    },
    'rastrigin': {
      title: 'Rastrigin Function',
      description: 'A highly multimodal function with many local minima. The global minimum is at (0,0,...,0) with a value of 0.',
      config: (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>Configuration</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Dimensions</Typography>
              <Typography variant="body2">2</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Search Range</Typography>
              <Typography variant="body2">[-5.12, 5.12]</Typography>
            </Grid>
          </Grid>
        </Box>
      )
    },
    'rosenbrock': {
      title: 'Rosenbrock Function',
      description: 'A non-convex function with a narrow valley. The global minimum is at (1,1,...,1) with a value of 0.',
      config: (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>Configuration</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Dimensions</Typography>
              <Typography variant="body2">2</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Search Range</Typography>
              <Typography variant="body2">[-5, 10]</Typography>
            </Grid>
          </Grid>
        </Box>
      )
    },
    'ackley': {
      title: 'Ackley Function',
      description: 'A multimodal function with many local minima. The global minimum is at (0,0,...,0) with a value of 0.',
      config: (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>Configuration</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Dimensions</Typography>
              <Typography variant="body2">2</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Search Range</Typography>
              <Typography variant="body2">[-32.768, 32.768]</Typography>
            </Grid>
          </Grid>
        </Box>
      )
    },
    'schwefel222': {
      title: 'Schwefel Problem 2.22',
      description: 'A unimodal function that combines sum and product of absolute values. The global minimum is at (0,0,...,0) with a value of 0.',
      config: (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>Configuration</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Dimensions</Typography>
              <Typography variant="body2">2</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Search Range</Typography>
              <Typography variant="body2">[-10, 10]</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary">Formula</Typography>
              <Typography variant="body2">f(x) = sum(|x_i|) + prod(|x_i|)</Typography>
            </Grid>
          </Grid>
        </Box>
      )
    },
  };

  // If no problem is selected, show placeholder
  if (!selectedProblem || !problemDetails[selectedProblem]) {
    return (
      <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
        <Typography variant="body2">Select a problem to see details</Typography>
      </Box>
    );
  }

  const problem = problemDetails[selectedProblem];

  return (
    <Box>
      <Typography variant="h6" gutterBottom>{problem.title}</Typography>
      <Typography variant="body2" paragraph>{problem.description}</Typography>
      <Divider sx={{ my: 1.5 }} />
      {problem.config}
    </Box>
  );
};

export default ProblemDetails; 