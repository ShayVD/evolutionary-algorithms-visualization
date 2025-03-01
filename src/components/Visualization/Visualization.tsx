import { FC, useEffect, useRef, useState, useLayoutEffect } from 'react';
import * as d3 from 'd3';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Box, Typography, Paper, ToggleButtonGroup, ToggleButton } from '@mui/material';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ThreeDRotationIcon from '@mui/icons-material/ThreeDRotation';

interface VisualizationProps {
  problem: string | null;
  algorithm: string | null;
  currentStep: number;
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
  currentStep
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

  // Effect to set up and update visualization based on problem, algorithm, and viewMode
  useEffect(() => {
    console.log('Visualization useEffect - problem/algorithm/viewMode changed:', problem, algorithm, viewMode);
    
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
  }, [problem, algorithm, dimensions, viewMode]);

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
  }, [currentStep, problem, viewMode]);

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
    console.log('Updating visualization for step:', step);
    if (!svgRef.current || !problem || !algorithm) return;

    const svg = d3.select(svgRef.current);
    
    // Remove any existing population points
    svg.selectAll('.population-point').remove();
    
    // Generate some dummy population data for demonstration
    // In a real app, this would come from the algorithm's state
    const populationSize = 20;
    const dummyPopulation: Individual[] = [];
    
    for (let i = 0; i < populationSize; i++) {
      // Create points that converge toward the optimum as steps increase
      const convergenceFactor = Math.max(0.1, 1 - (step / 50));
      const randomOffset = () => (Math.random() - 0.5) * 5 * convergenceFactor;
      
      let optX = 0, optY = 0;
      if (problem === 'rosenbrock') {
        optX = 1;
        optY = 1;
      }
      
      dummyPopulation.push({
        x: optX + randomOffset(),
        y: optY + randomOffset(),
        fitness: Math.random() * 10 * convergenceFactor
      });
    }
    
    // Get the best individual (lowest fitness for minimization problems)
    const bestIndividual = dummyPopulation.reduce(
      (best, current) => current.fitness < best.fitness ? current : best,
      dummyPopulation[0]
    );
    
    console.log('Generated population with best fitness:', bestIndividual.fitness);
    
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
        .data(dummyPopulation)
        .enter()
        .append('circle')
        .attr('class', 'population-point')
        .attr('cx', d => xScale(d.x))
        .attr('cy', d => yScale(d.y))
        .attr('r', 4)
        .attr('fill', d => d === bestIndividual ? 'red' : 'white')
        .attr('stroke', d => d === bestIndividual ? 'none' : 'rgba(255,255,255,0.7)')
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
    console.log('Updating 3D visualization for step:', step);
    if (!sceneRef.current || !problem || !algorithm) return;

    const scene = sceneRef.current;
    
    // Remove any existing population points
    const existingPoints = scene.children.filter(child => child.name === 'populationPoint');
    existingPoints.forEach(point => scene.remove(point));
    
    // Generate some dummy population data for demonstration
    // In a real app, this would come from the algorithm's state
    const populationSize = 20;
    const dummyPopulation: Individual[] = [];
    
    for (let i = 0; i < populationSize; i++) {
      // Create points that converge toward the optimum as steps increase
      const convergenceFactor = Math.max(0.1, 1 - (step / 50));
      const randomOffset = () => (Math.random() - 0.5) * 5 * convergenceFactor;
      
      let optX = 0, optY = 0;
      if (problem === 'rosenbrock') {
        optX = 1;
        optY = 1;
      }
      
      dummyPopulation.push({
        x: optX + randomOffset(),
        y: optY + randomOffset(),
        fitness: Math.random() * 10 * convergenceFactor
      });
    }
    
    // Get the best individual (lowest fitness for minimization problems)
    const bestIndividual = dummyPopulation.reduce(
      (best, current) => current.fitness < best.fitness ? current : best,
      dummyPopulation[0]
    );
    
    // Calculate function values for all points to determine z-scale
    const functionValues: number[] = [];
    
    dummyPopulation.forEach(individual => {
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
    
    // Add population points to the 3D visualization
    dummyPopulation.forEach((individual, index) => {
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
    <Box sx={{ position: 'relative', height: '100%' }}>
      {/* View mode toggle */}
      <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
          aria-label="view mode"
          size="small"
        >
          <ToggleButton value="2d" aria-label="2D view">
            <ViewModuleIcon />
          </ToggleButton>
          <ToggleButton value="3d" aria-label="3D view">
            <ThreeDRotationIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      
      {/* Main visualization area */}
      <Box 
        ref={containerRef}
        sx={{ 
          width: '100%', 
          height: '100%', 
          bgcolor: 'background.paper',
          borderRadius: 1,
          overflow: 'hidden'
        }}
      >
        {/* 2D Visualization */}
        {viewMode === '2d' && (
          <svg 
            ref={svgRef} 
            style={{ 
              width: '100%', 
              height: '100%', 
              display: 'block' 
            }}
          />
        )}
        
        {/* 3D Visualization */}
        {viewMode === '3d' && (
          <div 
            ref={threeContainerRef} 
            style={{ 
              width: '100%', 
              height: '100%', 
              display: 'block' 
            }}
          />
        )}
      </Box>
      
      {/* Status indicator */}
      {(!problem || !algorithm) && (
        <Box 
          sx={{ 
            position: 'absolute', 
            bottom: 16, 
            left: 0, 
            right: 0, 
            textAlign: 'center' 
          }}
        >
          <Paper 
            elevation={2} 
            sx={{ 
              display: 'inline-block', 
              px: 2, 
              py: 1, 
              bgcolor: 'rgba(255,255,255,0.9)' 
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {!problem 
                ? 'Select a problem to begin' 
                : !algorithm 
                  ? 'Select an algorithm to begin' 
                  : 'Ready to run'}
            </Typography>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default Visualization;