import { FC, useEffect, useState } from 'react';
import { Box, Typography, Grid, Divider, CircularProgress } from '@mui/material';
import { getAlgorithmDetails } from '../../algorithms/AlgorithmFactory';

interface AlgorithmDetailsProps {
  selectedAlgorithm: string | null;
}

interface AlgorithmDetail {
  id: string;
  name: string;
  description: string;
  keyFeatures: string[];
  icon: string;
  defaultParameters: Record<string, any>;
}

const AlgorithmDetails: FC<AlgorithmDetailsProps> = ({ selectedAlgorithm }) => {
  const [algorithmDetail, setAlgorithmDetail] = useState<AlgorithmDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchAlgorithmDetails = async () => {
      if (!selectedAlgorithm) {
        setAlgorithmDetail(null);
        return;
      }

      try {
        setLoading(true);
        const details = await getAlgorithmDetails(selectedAlgorithm);
        setAlgorithmDetail(details);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching algorithm details:', error);
        setLoading(false);
      }
    };

    fetchAlgorithmDetails();
  }, [selectedAlgorithm]);

  // If loading, show loading indicator
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  // If no algorithm is selected or details not found, show placeholder
  if (!selectedAlgorithm || !algorithmDetail) {
    return (
      <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
        <Typography variant="body2">Select an algorithm to see details</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography variant="h6" sx={{ mr: 1 }}>{algorithmDetail.name}</Typography>
        <Typography variant="h5" sx={{ ml: 'auto' }}>{algorithmDetail.icon}</Typography>
      </Box>
      <Typography variant="body2" paragraph>{algorithmDetail.description}</Typography>
      <Divider sx={{ my: 1.5 }} />
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>Key Features</Typography>
        <Grid container spacing={2}>
          {algorithmDetail.keyFeatures.map((feature, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Typography variant="body2">• {feature}</Typography>
            </Grid>
          ))}
        </Grid>
      </Box>
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>Default Parameters</Typography>
        <Grid container spacing={2}>
          {Object.entries(algorithmDetail.defaultParameters).map(([key, value]) => (
            <Grid item xs={6} key={key}>
              <Typography variant="caption" color="text.secondary">{key}</Typography>
              <Typography variant="body2">{value.toString()}</Typography>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default AlgorithmDetails; 