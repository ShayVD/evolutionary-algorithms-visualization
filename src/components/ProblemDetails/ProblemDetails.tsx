import { FC, useEffect, useState } from 'react';
import { Box, Typography, Grid, Divider, CircularProgress, Paper } from '@mui/material';
import { getFunctionDetails } from '../../problems/ContinuousFunctions';
// Import the formula formatter utility for LaTeX to Unicode conversion
import { formatFormula } from '../../utils/formulaFormatter';

// Interface for function details from the registry
interface FunctionDetails {
  id: string;
  name: string;
  description: string;
  formula: string;
  bounds: number[];
  defaultDimension: number;
  isMinimization: boolean;
  globalOptimum?: {
    point?: number[];
    position?: number[];
    value: number;
  };
  visualization?: {
    xRange: number[];
    yRange: number[];
    zRange: number[];
    colorScheme: string;
    formula2D: string;
  };
  icon: string;
  filePath?: string;
}

interface ProblemDetailsProps {
  selectedProblem: string | null;
}

const ProblemDetails: FC<ProblemDetailsProps> = ({ selectedProblem }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [problemDetails, setProblemDetails] = useState<FunctionDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formattedFormula, setFormattedFormula] = useState<string>('');

  // Fetch problem details when selected problem changes
  useEffect(() => {
    if (!selectedProblem) {
      setProblemDetails(null);
      setError(null);
      setFormattedFormula('');
      return;
    }

    const loadProblemDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const details = await getFunctionDetails(selectedProblem);
        
        if (!details) {
          setError(`Problem details for "${selectedProblem}" not found`);
          setProblemDetails(null);
          setFormattedFormula('');
        } else {
          setProblemDetails(details as FunctionDetails);
          // Format the formula for better display
          if (details.formula) {
            setFormattedFormula(formatFormula(details.formula));
          } else {
            setFormattedFormula('');
          }
        }
      } catch (err) {
        console.error('Error loading problem details:', err);
        setError('Failed to load problem details');
        setProblemDetails(null);
        setFormattedFormula('');
      } finally {
        setLoading(false);
      }
    };

    loadProblemDetails();
  }, [selectedProblem]);

  // Render loading state
  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress size={24} />
        <Typography variant="body2" sx={{ ml: 2 }}>Loading problem details...</Typography>
      </Box>
    );
  }

  // Render error state
  if (error) {
    return (
      <Box sx={{ p: 2, textAlign: 'center', color: 'error.main' }}>
        <Typography variant="body2">{error}</Typography>
      </Box>
    );
  }

  // If no problem is selected or details not found, show placeholder
  if (!selectedProblem || !problemDetails) {
    return (
      <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
        <Typography variant="body2">Select a problem to see details</Typography>
      </Box>
    );
  }

  // Extract point from either property (for backward compatibility)
  const optimumPoint = problemDetails.globalOptimum?.point || 
                      problemDetails.globalOptimum?.position || 
                      [];

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>{problemDetails.name}</Typography>
      <Typography variant="body2" paragraph>{problemDetails.description}</Typography>
      
      <Divider sx={{ my: 1.5 }} />
      
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>Configuration</Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">Dimensions</Typography>
            <Typography variant="body2">{problemDetails.defaultDimension}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">Search Range</Typography>
            <Typography variant="body2">[{problemDetails.bounds[0]}, {problemDetails.bounds[1]}]</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">Optimization</Typography>
            <Typography variant="body2">{problemDetails.isMinimization ? 'Minimization' : 'Maximization'}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">Global Optimum</Typography>
            <Typography variant="body2">
              {problemDetails.globalOptimum 
                ? `${problemDetails.globalOptimum.value} at (${optimumPoint.join(', ')})`
                : 'Not specified'}
            </Typography>
          </Grid>
          {formattedFormula && (
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary">Formula</Typography>
              <Box 
                sx={{ 
                  mt: 0.5, 
                  px: 2,
                  py: 1.5,
                  backgroundColor: 'rgba(0, 0, 0, 0.03)',
                  borderRadius: 1,
                  borderLeft: '4px solid',
                  borderColor: 'primary.main',
                }}
              >
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontFamily: 'math, serif', 
                    fontWeight: 500,
                    lineHeight: 1.6,
                    letterSpacing: 0.2
                  }}
                >
                  {formattedFormula}
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Box>
    </Paper>
  );
};

export default ProblemDetails; 