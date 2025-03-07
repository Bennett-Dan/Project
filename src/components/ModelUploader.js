import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ImageIcon from '@mui/icons-material/Image';
import DeleteIcon from '@mui/icons-material/Delete';
import { useModel } from '../contexts/ModelContext';
import apiService from '../services/api';

const ModelUploader = () => {
  const { loadModelFromUrl, resetModel } = useModel();
  const [modelFile, setModelFile] = useState(null);
  const [textureFiles, setTextureFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [localUrls, setLocalUrls] = useState({ model: null, textures: [] });

  // Handle model file drop
  const onModelDrop = useCallback(acceptedFiles => {
    // Only accept the first file
    if (acceptedFiles.length > 0) {
      setModelFile(acceptedFiles[0]);
    }
  }, []);

  // Handle texture files drop
  const onTextureDrop = useCallback(acceptedFiles => {
    setTextureFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  // Model dropzone
  const {
    getRootProps: getModelRootProps,
    getInputProps: getModelInputProps,
    isDragActive: isModelDragActive
  } = useDropzone({
    onDrop: onModelDrop,
    accept: {
      'application/octet-stream': ['.fbx'],
      'application/fbx': ['.fbx']
    },
    maxFiles: 1
  });

  // Texture dropzone
  const {
    getRootProps: getTextureRootProps,
    getInputProps: getTextureInputProps,
    isDragActive: isTextureDragActive
  } = useDropzone({
    onDrop: onTextureDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp']
    }
  });

  // Remove texture file
  const removeTextureFile = (index) => {
    setTextureFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Clear all files
  const clearFiles = () => {
    setModelFile(null);
    setTextureFiles([]);
    setError(null);
    setSuccess(null);
  };

  // Handle upload
  const handleUpload = async () => {
    if (!modelFile) {
      setError('Please select a model file (.fbx)');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Create object URLs directly like in app.js
      const modelUrl = URL.createObjectURL(modelFile);
      const textureUrls = textureFiles.map(file => URL.createObjectURL(file));
      
      // Load the model using the URL
      loadModelFromUrl(modelUrl, textureUrls);
      
      setSuccess('Files loaded successfully. Rendering 3D model...');
    } catch (err) {
      console.error('Loading error:', err);
      setError('Failed to load files. Please try again.');
      resetModel();
    } finally {
      setLoading(false);
    }
  };

  // Add a cleanup useEffect:
  useEffect(() => {
    // Cleanup function for when component unmounts
    return () => {
      if (localUrls.model) {
        URL.revokeObjectURL(localUrls.model);
        localUrls.textures.forEach(url => URL.revokeObjectURL(url));
      }
    };
  }, [localUrls]);

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Manual Upload
      </Typography>
      
      {/* Status messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      
      {/* Model dropzone */}
      <Typography variant="subtitle1" gutterBottom>
        3D Model (.fbx)
      </Typography>
      
      <Box
        {...getModelRootProps()}
        className={`dropzone ${isModelDragActive ? 'active' : ''}`}
        sx={{ mb: 2 }}
      >
        <input {...getModelInputProps()} />
        
        {modelFile ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <InsertDriveFileIcon sx={{ mr: 1 }} />
            <Typography variant="body1">
              {modelFile.name} ({(modelFile.size / 1024 / 1024).toFixed(2)} MB)
            </Typography>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center' }}>
            <CloudUploadIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography>
              {isModelDragActive
                ? 'Drop the FBX file here'
                : 'Drag and drop an FBX file here, or click to select'}
            </Typography>
          </Box>
        )}
      </Box>
      
      {/* Texture dropzone */}
      <Typography variant="subtitle1" gutterBottom>
        Textures (images)
      </Typography>
      
      <Box
        {...getTextureRootProps()}
        className={`dropzone ${isTextureDragActive ? 'active' : ''}`}
        sx={{ mb: 2 }}
      >
        <input {...getTextureInputProps()} />
        
        <Box sx={{ textAlign: 'center' }}>
          <ImageIcon sx={{ fontSize: 40, mb: 1 }} />
          <Typography>
            {isTextureDragActive
              ? 'Drop the texture files here'
              : 'Drag and drop texture images here, or click to select'}
          </Typography>
        </Box>
      </Box>
      
      {/* Texture files list */}
      {textureFiles.length > 0 && (
        <>
          <Typography variant="subtitle2" gutterBottom>
            Selected Textures ({textureFiles.length})
          </Typography>
          
          <List dense sx={{ mb: 2 }}>
            {textureFiles.map((file, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <ImageIcon />
                </ListItemIcon>
                <ListItemText
                  primary={file.name}
                  secondary={`${(file.size / 1024).toFixed(2)} KB`}
                />
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => removeTextureFile(index)}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItem>
            ))}
          </List>
        </>
      )}
      
      <Divider sx={{ my: 2 }} />
      
      {/* Action buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          onClick={clearFiles}
          disabled={loading || (!modelFile && textureFiles.length === 0)}
        >
          Clear
        </Button>
        
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpload}
          disabled={loading || !modelFile}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Loading...' : 'Upload & View'}
        </Button>
      </Box>
    </Paper>
  );
};

export default ModelUploader; 