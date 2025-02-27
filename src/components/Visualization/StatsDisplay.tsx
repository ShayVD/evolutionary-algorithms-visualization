import { FC } from 'react';
import { AlgorithmStats } from '../../types';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Box, Grid, Paper, Typography } from '@mui/material';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface StatsDisplayProps {
  stats: AlgorithmStats | null;
}

const StatsDisplay: FC<StatsDisplayProps> = ({ stats }) => {
  // If no stats are available, show placeholder
  if (!stats) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: 80, 
          color: 'text.secondary',
          fontSize: '0.875rem'
        }}
      >
        Run the algorithm to see statistics
      </Box>
    );
  }

  // Generate labels for the chart
  const labels = Array.from({ length: stats.history.bestFitness.length }, (_, i) => i.toString());

  // Chart data configuration
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Best Fitness',
        data: stats.history.bestFitness,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.1,
      },
      {
        label: 'Average Fitness',
        data: stats.history.averageFitness,
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        tension: 0.1,
      },
      {
        label: 'Population Diversity',
        data: stats.history.diversity,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.1,
      },
    ],
  };

  // Chart options
  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          boxWidth: 10,
          font: {
            size: 10
          }
        }
      },
      title: {
        display: true,
        text: 'Evolution Progress',
        font: {
          size: 12
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            size: 10
          }
        }
      },
      x: {
        ticks: {
          font: {
            size: 10
          }
        }
      }
    },
  };

  return (
    <Box sx={{ mt: 1 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 1.5, 
              bgcolor: 'grey.50', 
              borderRadius: 1 
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Generation
            </Typography>
            <Typography variant="subtitle2" fontWeight={600}>
              {stats.currentGeneration}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 1.5, 
              bgcolor: 'grey.50', 
              borderRadius: 1 
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Best Fitness
            </Typography>
            <Typography variant="subtitle2" fontWeight={600}>
              {stats.bestFitness.toFixed(4)}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 1.5, 
              bgcolor: 'grey.50', 
              borderRadius: 1 
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Average Fitness
            </Typography>
            <Typography variant="subtitle2" fontWeight={600}>
              {stats.averageFitness.toFixed(4)}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      
      <Box sx={{ height: 160, mt: 2 }}>
        <Line data={chartData} options={chartOptions} />
      </Box>
    </Box>
  );
};

export default StatsDisplay; 