import { FC, useEffect, useRef, useState, useLayoutEffect } from 'react';
import * as d3 from 'd3';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Box, Typography, Paper, ToggleButtonGroup, ToggleButton } from '@mui/material';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ThreeDRotationIcon from '@mui/icons-material/ThreeDRotation';
import { Algorithm } from '../../algorithms/Algorithm';
import { Individual as AlgorithmIndividual, AlgorithmParams } from '../../types';

interface VisualizationProps {
  problem: string | null;
  algorithm: string | null;
  currentStep: number;
  algorithmInstance: Algorithm<any> | null;
  algorithmParams?: AlgorithmParams;
}

// Define a data point type for the function visualization
interface DataPoint {
  x: number;
  y: number;
  z: number;
}

// Define a type for population individuals
interface Individual {
  x: number;
  y: number;
  fitness: number;
}

const Visualization: FC<VisualizationProps> = ({ 
  problem, 
  algorithm, 
  currentStep,
  algorithmInstance,
  algorithmParams
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const threeContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const frameIdRef = useRef<number | null>(null);

  // Handle view mode change
  const handleViewModeChange = (
    _: React.MouseEvent<HTMLElement>,
    newViewMode: '2d' | '3d' | null,
  ) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };

  // Use layout effect to get accurate dimensions
  useLayoutEffect(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      console.log('Container dimensions:', width, height);
      setDimensions({ width, height });
    }
    
    // Add resize event listener
    const handleResize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        console.log('Window resized - new dimensions:', width, height);
        setDimensions({ width, height });
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Effect to set up and update visualization based on problem, algorithm, viewMode, and params
  useEffect(() => {
    console.log('Visualization useEffect - problem/algorithm/viewMode/params changed:', problem, algorithm, viewMode, algorithmParams?.populationSize);
    
    if (!problem) return;

    if (viewMode === '2d') {
      if (!svgRef.current) return;
      
      // Clear previous visualizations
      d3.select(svgRef.current).selectAll('*').remove();

      // Set SVG dimensions
      const width = dimensions.width || 600;
      const height = dimensions.height || 400;
      
      console.log('Setting SVG dimensions:', width, height);
      
      d3.select(svgRef.current)
        .attr('width', width)
        .attr('height', height);

      // Create visualization based on problem type
      switch (problem) {
        case 'sphere':
        case 'rastrigin':
        case 'rosenbrock':
        case 'ackley':
        case 'schwefel222':
          create2DFunctionVisualization(problem);
          break;
        default:
          createPlaceholderVisualization();
      }

      // Update visualization with current step data
      updateVisualization(currentStep);
    } else {
      // Clean up 2D visualization
      if (svgRef.current) {
        d3.select(svgRef.current).selectAll('*').remove();
      }
      
      // Set up 3D visualization
      setup3DVisualization(problem);
    }

    // Cleanup function
    return () => {
      // Clean up Three.js resources when component unmounts or view changes
      if (viewMode === '3d') {
        cleanup3DVisualization();
      }
    };
  }, [problem, algorithm, dimensions, viewMode, algorithmParams]);

  // Add a specific effect to update visualization when the algorithm instance changes
  useEffect(() => {
    if (!problem || !algorithm || !algorithmInstance) return;
    
    console.log('Algorithm instance changed or updated, forcing visualization update');
    
    // Force update the visualization
    if (viewMode === '2d') {
      updateVisualization(currentStep);
    } else {
      update3DVisualization(currentStep);
    }
  }, [algorithmInstance, currentStep, problem, algorithm, viewMode]);

  // Update visualization when step changes
  useEffect(() => {
    console.log('Visualization useEffect - step changed:', currentStep);
    if (!problem) return;
    
    if (viewMode === '2d') {
      if (!svgRef.current) return;
      updateVisualization(currentStep);
    } else {
      update3DVisualization(currentStep);
    }
  }, [currentStep, problem, viewMode, algorithmParams]);

  // Effect to re-render visualization when dimensions change
  useEffect(() => {
    if (dimensions.width > 0 && dimensions.height > 0 && problem) {
      console.log('Dimensions changed, re-rendering visualization');
      
      if (viewMode === '2d') {
        if (!svgRef.current) return;
        
        // Clear previous visualizations
        d3.select(svgRef.current).selectAll('*').remove();
        
        // Set SVG dimensions
        d3.select(svgRef.current)
          .attr('width', dimensions.width)
          .attr('height', dimensions.height);
        
        // Create visualization based on problem type
        switch (problem) {
          case 'sphere':
          case 'rastrigin':
          case 'rosenbrock':
          case 'ackley':
          case 'schwefel222':
            create2DFunctionVisualization(problem);
            break;
          default:
            createPlaceholderVisualization();
        }
        
        // Update visualization with current step data
        updateVisualization(currentStep);
      } else {
        // Resize 3D renderer
        if (rendererRef.current && cameraRef.current) {
          rendererRef.current.setSize(dimensions.width, dimensions.height);
          cameraRef.current.aspect = dimensions.width / dimensions.height;
          cameraRef.current.updateProjectionMatrix();
        }
      }
    }
  }, [dimensions, problem, currentStep, viewMode]);

  // Add a specific effect to force re-rendering when params change
  useEffect(() => {
    if (!problem || !algorithm || !algorithmInstance) return;
    
    console.log('Algorithm params changed, forcing visualization update. Population size:', algorithmParams?.populationSize);
    
    // Allow a small delay for the algorithm to fully update its population
    setTimeout(() => {
      // Force immediate update of the visualization with current population data
      if (algorithmInstance && typeof algorithmInstance.getPopulation === 'function') {
        const currentPopulation = algorithmInstance.getPopulation();
        console.log('Delayed refresh: actual population size from algorithm:', currentPopulation.length, 'Requested size:', algorithmParams?.populationSize);
        
        // Force update the visualization
        if (viewMode === '2d') {
          updateVisualization(currentStep);
        } else {
          update3DVisualization(currentStep);
        }
      }
    }, 50); // Small delay to ensure algorithm state is fully updated
  }, [algorithmParams, algorithm, problem, algorithmInstance]);

  // Add a new effect to handle 3D rendering issues related to timing
  useEffect(() => {
    if (viewMode === '3d' && sceneRef.current && cameraRef.current && rendererRef.current) {
      // Force multiple renders after a delay to ensure container has proper dimensions
      const renderTimers = [100, 300, 500].map(delay => 
        setTimeout(() => {
          console.log(`Forcing 3D render after ${delay}ms delay`);
          if (containerRef.current) {
            const { width, height } = containerRef.current.getBoundingClientRect();
            if (width > 0 && height > 0 && rendererRef.current && cameraRef.current) {
              rendererRef.current.setSize(width, height);
              cameraRef.current.aspect = width / height;
              cameraRef.current.updateProjectionMatrix();
              if (sceneRef.current) {
                rendererRef.current.render(sceneRef.current, cameraRef.current);
              }
            }
          }
        }, delay)
      );
      
      return () => {
        renderTimers.forEach(timerId => clearTimeout(timerId));
      };
    }
  }, [viewMode, dimensions]);

  // Create a 2D function visualization
  const create2DFunctionVisualization = (problemType: string) => {
    console.log('Creating 2D function visualization for:', problemType);
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = dimensions.width || 600;
    const height = dimensions.height || 400;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    console.log('Visualization dimensions:', width, height, innerWidth, innerHeight);

    // Define domain ranges based on problem type
    let xRange = [-5, 5];
    let yRange = [-5, 5];
    
    switch (problemType) {
      case 'rastrigin':
        xRange = [-5.12, 5.12];
        yRange = [-5.12, 5.12];
        break;
      case 'rosenbrock':
        xRange = [-2, 2];
        yRange = [-1, 3];
        break;
      case 'ackley':
        xRange = [-5, 5];
        yRange = [-5, 5];
        break;
      case 'schwefel222':
        xRange = [-10, 10];
        yRange = [-10, 10];
        break;
      default: // sphere
        xRange = [-5, 5];
        yRange = [-5, 5];
    }

    // Create scales
    const xScale = d3.scaleLinear()
      .domain(xRange)
      .range([0, innerWidth]);
    
    const yScale = d3.scaleLinear()
      .domain(yRange)
      .range([innerHeight, 0]);

    // Create a group for the visualization
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create a grid of points for the function
    const resolution = 50;
    const points: DataPoint[] = [];
    
    for (let i = 0; i < resolution; i++) {
      for (let j = 0; j < resolution; j++) {
        const x = xRange[0] + (xRange[1] - xRange[0]) * (i / (resolution - 1));
        const y = yRange[0] + (yRange[1] - yRange[0]) * (j / (resolution - 1));
        let z = 0;
        
        // Calculate z value based on problem type
        switch (problemType) {
          case 'sphere':
            z = x * x + y * y;
            break;
          case 'rastrigin':
            z = 20 + (x * x - 10 * Math.cos(2 * Math.PI * x)) + (y * y - 10 * Math.cos(2 * Math.PI * y));
            break;
          case 'rosenbrock':
            z = 100 * Math.pow(y - x * x, 2) + Math.pow(1 - x, 2);
            break;
          case 'ackley':
            z = -20 * Math.exp(-0.2 * Math.sqrt(0.5 * (x * x + y * y))) - 
                Math.exp(0.5 * (Math.cos(2 * Math.PI * x) + Math.cos(2 * Math.PI * y))) + 
                Math.E + 20;
            break;
          case 'schwefel222':
            z = Math.abs(x) + Math.abs(y) + (Math.abs(x) * Math.abs(y));
            break;
        }
        
        points.push({ x, y, z });
      }
    }

    console.log(`Generated ${points.length} points for the heatmap`);

    // Create a color scale for the heatmap
    const zMin = d3.min(points, d => d.z) || 0;
    const zMax = d3.max(points, d => d.z) || 1;
    
    console.log('Z range:', zMin, zMax);
    
    const colorScale = d3.scaleSequential()
      .domain([zMin, zMax])
      .interpolator(d3.interpolateViridis);

    // Create the heatmap
    const cellWidth = innerWidth / resolution;
    const cellHeight = innerHeight / resolution;
    
    console.log('Cell dimensions:', cellWidth, cellHeight);
    
    g.selectAll('rect')
      .data(points)
      .enter()
      .append('rect')
      .attr('x', d => xScale(d.x) - cellWidth / 2)
      .attr('y', d => yScale(d.y) - cellHeight / 2)
      .attr('width', cellWidth)
      .attr('height', cellHeight)
      .attr('fill', d => colorScale(d.z))
      .attr('stroke', 'none');

    // Add axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale));
    
    g.append('g')
      .call(d3.axisLeft(yScale));
    
    // Add labels
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + margin.bottom - 5)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .text('X');
    
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -margin.left + 12)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .text('Y');
      
    console.log('2D function visualization created successfully');
  };

  // Create a placeholder visualization when no problem is selected
  const createPlaceholderVisualization = () => {
    console.log('Creating placeholder visualization');
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = dimensions.width || 600;
    const height = dimensions.height || 400;
    
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height / 2)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', '16px')
      .text('Select a problem and algorithm to visualize');
      
    console.log('Placeholder visualization created');
  };

  // Update the visualization with current step data
  const updateVisualization = (step: number) => {
    console.log('Updating visualization for step:', step, 'Params:', algorithmParams?.populationSize);
    if (!svgRef.current || !problem || !algorithm || !algorithmInstance) return;

    const svg = d3.select(svgRef.current);
    
    // Remove any existing population points
    svg.selectAll('.population-point').remove();
    
    // Get the actual population from the algorithm instance
    let populationData: Individual[] = [];
    
    // Directly fetch the current population to ensure we have the latest data
    const algorithmPopulation = algorithmInstance.getPopulation();
    console.log('Actual population size from algorithm:', algorithmPopulation.length, 'Requested size:', algorithmParams?.populationSize);
    
    // Only proceed with visualization if we have real data
    if (algorithmPopulation && algorithmPopulation.length > 0) {
      populationData = algorithmPopulation.map((individual: AlgorithmIndividual<number[]>) => {
        // Assuming genotype is an array with at least 2 dimensions [x, y, ...]
        return {
          x: individual.genotype[0],
          y: individual.genotype[1],
          fitness: individual.fitness
        };
      });
    } else {
      // If no real data, early return
      console.log('No real population data available yet. Waiting for data before visualization.');
      return;
    }
    
    console.log('Final population size for visualization:', populationData.length);

    // Get the best individual (lowest fitness for minimization problems)
    const bestIndividual = populationData.length > 0 ? 
      populationData.reduce(
        (best, current) => current.fitness < best.fitness ? current : best,
        populationData[0]
      ) : null;
    
    if (bestIndividual) {
      console.log('Population with best fitness:', bestIndividual.fitness);
    }
    
    // Add population points to the visualization
    const g = svg.select('g');
    if (!g.empty()) {
      const width = dimensions.width || 600;
      const height = dimensions.height || 400;
      const margin = { top: 20, right: 20, bottom: 30, left: 40 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;
      
      // Define domain ranges based on problem type
      let xRange = [-5, 5];
      let yRange = [-5, 5];
      
      switch (problem) {
        case 'rastrigin':
          xRange = [-5.12, 5.12];
          yRange = [-5.12, 5.12];
          break;
        case 'rosenbrock':
          xRange = [-2, 2];
          yRange = [-1, 3];
          break;
        case 'ackley':
          xRange = [-5, 5];
          yRange = [-5, 5];
          break;
        case 'schwefel222':
          xRange = [-10, 10];
          yRange = [-10, 10];
          break;
      }
      
      // Create scales
      const xScale = d3.scaleLinear()
        .domain(xRange)
        .range([0, innerWidth]);
      
      const yScale = d3.scaleLinear()
        .domain(yRange)
        .range([innerHeight, 0]);
      
      // Add population points
      g.selectAll('.population-point')
        .data(populationData)
        .enter()
        .append('circle')
        .attr('class', 'population-point')
        .attr('cx', d => xScale(d.x))
        .attr('cy', d => yScale(d.y))
        .attr('r', 4)
        .attr('fill', d => bestIndividual && d === bestIndividual ? 'red' : 'white')
        .attr('stroke', d => bestIndividual && d === bestIndividual ? 'none' : 'rgba(255,255,255,0.7)')
        .attr('stroke-width', 1);
        
      console.log('Population points added to visualization');
    } else {
      console.warn('Could not find the SVG group element for adding population points');
    }
  };

  // Set up 3D visualization using Three.js
  const setup3DVisualization = (problemType: string) => {
    console.log('Setting up 3D visualization for:', problemType);
    if (!threeContainerRef.current) return;

    // Ensure container has dimensions
    if (dimensions.width === 0 || dimensions.height === 0) {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        console.log('Updating dimensions before 3D setup:', width, height);
        setDimensions({ width, height });
      }
    }
    
    // Clean up previous 3D visualization if it exists
    cleanup3DVisualization();

    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;

    // Create camera
    const camera = new THREE.PerspectiveCamera(
      75,
      dimensions.width / dimensions.height,
      0.1,
      1000
    );
    camera.position.set(10, 10, 10);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(dimensions.width, dimensions.height);
    renderer.setPixelRatio(window.devicePixelRatio);
    threeContainerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    // Define domain ranges based on problem type
    let xRange = [-5, 5];
    let yRange = [-5, 5];
    
    switch (problemType) {
      case 'rastrigin':
        xRange = [-5.12, 5.12];
        yRange = [-5.12, 5.12];
        break;
      case 'rosenbrock':
        xRange = [-2, 2];
        yRange = [-1, 3];
        break;
      case 'ackley':
        xRange = [-5, 5];
        yRange = [-5, 5];
        break;
      case 'schwefel222':
        xRange = [-10, 10];
        yRange = [-10, 10];
        break;
      default: // sphere
        xRange = [-5, 5];
        yRange = [-5, 5];
    }

    // Create a grid of points for the function
    const resolution = 50;
    const points: DataPoint[] = [];
    
    for (let i = 0; i < resolution; i++) {
      for (let j = 0; j < resolution; j++) {
        const x = xRange[0] + (xRange[1] - xRange[0]) * (i / (resolution - 1));
        const y = yRange[0] + (yRange[1] - yRange[0]) * (j / (resolution - 1));
        let z = 0;
        
        // Calculate z value based on problem type
        switch (problemType) {
          case 'sphere':
            z = x * x + y * y;
            break;
          case 'rastrigin':
            z = 20 + (x * x - 10 * Math.cos(2 * Math.PI * x)) + (y * y - 10 * Math.cos(2 * Math.PI * y));
            break;
          case 'rosenbrock':
            z = 100 * Math.pow(y - x * x, 2) + Math.pow(1 - x, 2);
            break;
          case 'ackley':
            z = -20 * Math.exp(-0.2 * Math.sqrt(0.5 * (x * x + y * y))) - 
                Math.exp(0.5 * (Math.cos(2 * Math.PI * x) + Math.cos(2 * Math.PI * y))) + 
                Math.E + 20;
            break;
          case 'schwefel222':
            z = Math.abs(x) + Math.abs(y) + (Math.abs(x) * Math.abs(y));
            break;
        }
        
        points.push({ x, y, z });
      }
    }

    // Find min and max z values for scaling
    const zMin = Math.min(...points.map(p => p.z));
    const zMax = Math.max(...points.map(p => p.z));
    
    // Scale z values for better visualization
    const zScale = 5 / Math.max(Math.abs(zMin), Math.abs(zMax));

    // Create surface geometry
    const geometry = new THREE.PlaneGeometry(
      xRange[1] - xRange[0],
      yRange[1] - yRange[0],
      resolution - 1,
      resolution - 1
    );

    // Update vertices to create the 3D surface
    const positionAttribute = geometry.getAttribute('position');
    
    for (let i = 0; i < resolution; i++) {
      for (let j = 0; j < resolution; j++) {
        const index = i * resolution + j;
        const pointIndex = i * resolution + j;
        const z = points[pointIndex].z * zScale;
        
        positionAttribute.setZ(index, z);
      }
    }
    
    geometry.computeVertexNormals();

    // Create material with color gradient based on height
    const material = new THREE.MeshPhongMaterial({
      side: THREE.DoubleSide,
      vertexColors: true,
      shininess: 30,
    });

    // Set vertex colors based on height
    const colorAttribute = new THREE.BufferAttribute(
      new Float32Array(positionAttribute.count * 3),
      3
    );
    
    for (let i = 0; i < positionAttribute.count; i++) {
      const z = positionAttribute.getZ(i);
      const normalizedZ = (z / (zMax * zScale) + 1) / 2; // Normalize to [0,1]
      
      // Create a color gradient from blue (low) to red (high)
      const color = new THREE.Color();
      color.setHSL(0.7 * (1 - normalizedZ), 1, 0.5);
      
      colorAttribute.setXYZ(i, color.r, color.g, color.b);
    }
    
    geometry.setAttribute('color', colorAttribute);

    // Create mesh and add to scene
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(
      (xRange[0] + xRange[1]) / 2,
      (yRange[0] + yRange[1]) / 2,
      0
    );
    mesh.name = 'functionSurface';
    scene.add(mesh);

    // Add axes
    const axesHelper = new THREE.AxesHelper(Math.max(
      xRange[1] - xRange[0],
      yRange[1] - yRange[0],
      zMax * zScale
    ));
    scene.add(axesHelper);

    // Add grid
    const gridHelper = new THREE.GridHelper(
      Math.max(xRange[1] - xRange[0], yRange[1] - yRange[0]) * 1.5,
      20
    );
    gridHelper.rotation.x = Math.PI / 2;
    scene.add(gridHelper);

    // Start animation loop
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    
    animate();
    
    // Add population points
    update3DVisualization(currentStep);
    
    console.log('3D visualization setup complete');
  };

  // Update 3D visualization with current step data
  const update3DVisualization = (step: number) => {
    console.log('Updating 3D visualization for step:', step, 'Params:', algorithmParams?.populationSize);
    if (!sceneRef.current || !problem || !algorithm) return;

    const scene = sceneRef.current;

    // Remove any existing population points
    const pointsToRemove: THREE.Object3D[] = [];
    scene.traverse((obj) => {
      if (obj.userData.type === 'population') {
        pointsToRemove.push(obj);
      }
    });
    
    pointsToRemove.forEach(obj => scene.remove(obj));
    
    // Get the actual population from the algorithm instance
    let populationData: Individual[] = [];
    
    if (algorithmInstance && typeof algorithmInstance.getPopulation === 'function') {
      // Convert from algorithm-specific data format to visualization format
      const algorithmPopulation = algorithmInstance.getPopulation();
      console.log('Actual 3D population size from algorithm:', algorithmPopulation.length, 'Requested size:', algorithmParams?.populationSize);
      
      // Only proceed with visualization if we have real data
      if (algorithmPopulation && algorithmPopulation.length > 0) {
        populationData = algorithmPopulation.map((individual: AlgorithmIndividual<number[]>) => {
          // Assuming genotype is an array with at least 2 dimensions [x, y, ...]
          return {
            x: individual.genotype[0],
            y: individual.genotype[1],
            fitness: individual.fitness
          };
        });
      } else {
        // If no real data, early return
        console.log('No real population data available yet for 3D. Waiting for data before visualization.');
        return;
      }
    } else {
      // If no algorithm instance or getPopulation method, early return
      console.log('Algorithm instance or getPopulation method not available for 3D. Waiting before visualization.');
      return;
    }
    
    console.log('Final 3D population size for visualization:', populationData.length);

    // Get the best individual (lowest fitness for minimization problems)
    const bestIndividual = populationData.length > 0 ? 
      populationData.reduce(
        (best, current) => current.fitness < best.fitness ? current : best,
        populationData[0]
      ) : null;
    
    // Calculate function values for all points to determine z-scale
    const functionValues: number[] = [];
    
    populationData.forEach(individual => {
      let z = 0;
      
      switch (problem) {
        case 'sphere':
          z = individual.x * individual.x + individual.y * individual.y;
          break;
        case 'rastrigin':
          z = 20 + (individual.x * individual.x - 10 * Math.cos(2 * Math.PI * individual.x)) + 
              (individual.y * individual.y - 10 * Math.cos(2 * Math.PI * individual.y));
          break;
        case 'rosenbrock':
          z = 100 * Math.pow(individual.y - individual.x * individual.x, 2) + Math.pow(1 - individual.x, 2);
          break;
        case 'ackley':
          z = -20 * Math.exp(-0.2 * Math.sqrt(0.5 * (individual.x * individual.x + individual.y * individual.y))) - 
              Math.exp(0.5 * (Math.cos(2 * Math.PI * individual.x) + Math.cos(2 * Math.PI * individual.y))) + 
              Math.E + 20;
          break;
        case 'schwefel222':
          z = Math.abs(individual.x) + Math.abs(individual.y) + (Math.abs(individual.x) * Math.abs(individual.y));
          break;
      }
      
      functionValues.push(z);
    });
    
    // Find the function surface to get z scale information
    const functionSurface = scene.children.find(child => child.name === 'functionSurface') as THREE.Mesh;
    if (!functionSurface) {
      console.error('Function surface not found');
      return;
    }
    
    // Get the z-scale used for the function surface
    const positionAttribute = (functionSurface.geometry as THREE.BufferGeometry).getAttribute('position');
    const zValues = [];
    for (let i = 0; i < positionAttribute.count; i++) {
      zValues.push(positionAttribute.getZ(i));
    }
    const surfaceMinZ = Math.min(...zValues);
    const surfaceMaxZ = Math.max(...zValues);
    
    // Add new population points
    populationData.forEach((individual, index) => {
      // Calculate z value based on problem type
      let z = functionValues[index];
      
      // Use the same scale as the function surface
      const zMin = Math.min(...functionValues);
      const zMax = Math.max(...functionValues);
      const zScale = 5 / Math.max(Math.abs(zMin), Math.abs(zMax));
      z = z * zScale;
      
      // Ensure z is within the bounds of the surface with a small offset
      z = Math.max(surfaceMinZ, Math.min(surfaceMaxZ, z));
      
      // Create a sphere for the individual
      const geometry = new THREE.SphereGeometry(0.2, 16, 16);
      const material = new THREE.MeshPhongMaterial({
        color: individual === bestIndividual ? 0xff0000 : 0xffffff,
        emissive: individual === bestIndividual ? 0x330000 : 0x111111,
      });
      
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(individual.x, individual.y, z + 0.2); // Small offset to be visible above surface
      sphere.name = 'populationPoint';
      sphere.userData.type = 'population'; // Add type property to identify for removal
      
      scene.add(sphere);
    });
    
    console.log('3D population points added to visualization');
  };

  // Clean up Three.js resources
  const cleanup3DVisualization = () => {
    console.log('Cleaning up 3D visualization');
    
    // Cancel animation frame
    if (frameIdRef.current !== null) {
      cancelAnimationFrame(frameIdRef.current);
      frameIdRef.current = null;
    }
    
    // Dispose of Three.js resources
    if (rendererRef.current) {
      if (threeContainerRef.current) {
        threeContainerRef.current.removeChild(rendererRef.current.domElement);
      }
      rendererRef.current.dispose();
      rendererRef.current = null;
    }
    
    // Clear references
    sceneRef.current = null;
    cameraRef.current = null;
    
    if (controlsRef.current) {
      controlsRef.current.dispose();
      controlsRef.current = null;
    }
  };

  return (
    <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          {problem ? `${problem.charAt(0).toUpperCase() + problem.slice(1)} Function` : 'Select a Problem'}
        </Typography>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
          aria-label="visualization mode"
          size="small"
        >
          <ToggleButton value="2d" aria-label="2D mode">
            <ViewModuleIcon fontSize="small" />
          </ToggleButton>
          <ToggleButton value="3d" aria-label="3D mode">
            <ThreeDRotationIcon fontSize="small" />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {!problem && (
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="body1">Select a problem to visualize</Typography>
        </Box>
      )}

      {problem && (
        <Box ref={containerRef} sx={{ flexGrow: 1, position: 'relative' }}>
          {viewMode === '2d' ? (
            <svg ref={svgRef} width={dimensions.width} height={dimensions.height} />
          ) : (
            <div ref={threeContainerRef} style={{ width: '100%', height: '100%' }} />
          )}
        </Box>
      )}
    </Paper>
  );
};

export default Visualization;