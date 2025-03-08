import React, { useEffect, useRef, useState } from 'react';
import { Box, CircularProgress, Typography, Paper } from '@mui/material';
import { useModel } from '../contexts/ModelContext';
import { initThreeScene, loadFBXModel, applyTextureToMesh, removeTextureFromMesh, toggleMeshVisibility } from '../utils/threeUtils';

const ModelViewer = () => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const loadedUrlRef = useRef(null); // Add this ref to track loaded URLs
  const { modelData, setModelObjects, setModelError } = useModel();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize Three.js scene
  useEffect(() => {
    if (containerRef.current) {
      // Initialize scene
      const threeScene = initThreeScene(containerRef.current);
      sceneRef.current = threeScene;

      // Cleanup function
      return () => {
        if (sceneRef.current) {
          sceneRef.current.cleanup();
        }
      };
    }
  }, []);

  // Load model when URL changes
  useEffect(() => {
    if (!modelData.modelUrl || !sceneRef.current) {
      return;
    }
    
    // Set current URL as being loaded
    loadedUrlRef.current = modelData.modelUrl;

    const loadModel = async () => {
      setLoading(true);
      setError(null);

      try {
        // Load the model 
        const { scene, modelGroup } = sceneRef.current;
        const { model, objects } = await loadFBXModel(
          modelData.modelUrl, 
          scene, 
          modelGroup || scene // Use modelGroup if available, otherwise use scene
        );
        
        // Update model context with loaded objects
        setModelObjects(objects);
      } catch (err) {
        console.error('Error loading model:', err);
        setError('Failed to load 3D model. Please try again.');
        setModelError('Failed to load 3D model');
        
        // Clear loaded URL on error so we can try again
        loadedUrlRef.current = null;
      } finally {
        setLoading(false);
      }
    };

    loadModel();
  }, [modelData.modelUrl]);

  // Apply texture changes
  useEffect(() => {
    if (!sceneRef.current || !modelData.objects.length) return;

    modelData.objects.forEach(obj => {
      // Apply texture if needed
      if (obj.hasTexture && obj.textureUrl) {
        applyTextureToMesh(obj.mesh, obj.textureUrl);
      } else if (!obj.hasTexture) {
        removeTextureFromMesh(obj.mesh);
      }

      // Set visibility
      toggleMeshVisibility(obj.mesh, obj.visible);
    });
  }, [modelData.objects]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (sceneRef.current && containerRef.current) {
        const { camera, renderer } = sceneRef.current;
        camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Add performance monitoring
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let fps = 0;
    
    const checkPerformance = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        fps = frameCount;
        frameCount = 0;
        lastTime = currentTime;
        
        // If FPS is low, reduce quality
        if (fps < 30 && sceneRef.current && sceneRef.current.renderer) {
          sceneRef.current.renderer.setPixelRatio(1);
        }
      }
      
      requestAnimationFrame(checkPerformance);
    };
    
    const perfCheck = requestAnimationFrame(checkPerformance);
    
    return () => {
      cancelAnimationFrame(perfCheck);
    };
  }, []);

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#000000',
        borderRadius: 0,
        overflow: 'hidden'
      }}
    >
      {/* Loading indicator */}
      {(loading || modelData.isLoading) && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            backgroundColor: 'rgba(255, 255, 255, 0.7)'
          }}
        >
          <Paper elevation={3} sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <CircularProgress size={40} />
            <Typography variant="body1" sx={{ mt: 2 }}>
              Loading 3D Model...
            </Typography>
          </Paper>
        </Box>
      )}

      {/* Error message */}
      {error && !loading && !modelData.isLoading && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10,
            textAlign: 'center',
            p: 2
          }}
        >
          <Paper elevation={3} sx={{ p: 3, backgroundColor: '#ffebee' }}>
            <Typography variant="h6" color="error">
              Error
            </Typography>
            <Typography variant="body1">
              {error}
            </Typography>
          </Paper>
        </Box>
      )}

      {/* No model message */}
      {!modelData.modelUrl && !loading && !error && !modelData.isLoading && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10,
            textAlign: 'center',
            p: 2
          }}
        >
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6">
              No Model Loaded
            </Typography>
            <Typography variant="body1">
              Please upload a model or enter an order ID to view a 3D model.
            </Typography>
          </Paper>
        </Box>
      )}

      {/* Three.js container */}
      <Box
        ref={containerRef}
        className="canvas-container"
        sx={{
          width: '100%',
          height: '100%'
        }}
      />
    </Box>
  );
};

export default ModelViewer; 