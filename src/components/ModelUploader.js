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

const ModelUploader = ({ compact = false }) => {
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
      
    } catch (err) {
      console.error('Loading error:', err);
      setError('Ooops. Try again Please.');
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
    <Paper elevation={2} sx={{ p: compact ? 1 : 2, mb: compact ? 1 : 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 1, py: compact ? 0 : 1 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 1, py: compact ? 0 : 1 }}>
          {success}
        </Alert>
      )}
      
      <Typography variant={compact ? "subtitle2" : "subtitle1"} gutterBottom>
        3D model (.fbx)
      </Typography>
      
      {/* Model dropzone - ultra compact version */}
      <Box
        {...getModelRootProps()}
        className={`dropzone ${isModelDragActive ? 'active' : ''}`}
        sx={{ 
          mb: 1,
          p: 0.75,
          display: 'flex',
          alignItems: 'center',
          border: '1px solid',
          borderColor: 'grey.300',
          borderRadius: 1,
          cursor: 'pointer',
          height: compact ? '32px' : '40px',
          bgcolor: 'background.paper',
          fontSize: compact ? '0.75rem' : '0.875rem'
        }}
        onClick={(e) => {
          e.stopPropagation();
          document.getElementById('model-file-input').click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <input 
          {...getModelInputProps()} 
          id="model-file-input"
          onClick={(e) => e.stopPropagation()}
        />
        <InsertDriveFileIcon 
          color="primary" 
          fontSize={compact ? "small" : "medium"} 
          sx={{ mr: 0.5, fontSize: compact ? '0.9rem' : '1.2rem' }} 
        />
        <Typography variant="body2" sx={{ 
          flexGrow: 1, 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          whiteSpace: 'nowrap',
          fontSize: compact ? '0.75rem' : '0.875rem'
        }}>
          {modelFile ? modelFile.name : 'Select model (.fbx)'}
        </Typography>
      </Box>

      <Typography variant={compact ? "subtitle2" : "subtitle1"} gutterBottom>
        Textures
      </Typography>

      {/* Texture dropzone - ultra compact version */}
      <Box
        {...getTextureRootProps()}
        className={`dropzone ${isTextureDragActive ? 'active' : ''}`}
        sx={{ 
          mb: 1,
          p: 0.75,
          display: 'flex',
          alignItems: 'center',
          border: '1px solid',
          borderColor: 'grey.300',
          borderRadius: 1,
          cursor: 'pointer',
          height: compact ? '32px' : '40px',
          bgcolor: 'background.paper'
        }}
        onClick={(e) => {
          e.stopPropagation();
          document.getElementById('texture-file-input').click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <input 
          {...getTextureInputProps()} 
          id="texture-file-input"
          onClick={(e) => e.stopPropagation()}
        />
        <ImageIcon 
          color="primary" 
          fontSize={compact ? "small" : "medium"} 
          sx={{ mr: 0.5, fontSize: compact ? '0.9rem' : '1.2rem' }} 
        />
        <Typography variant="body2" sx={{ 
          flexGrow: 1, 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          whiteSpace: 'nowrap',
          fontSize: compact ? '0.75rem' : '0.875rem'
        }}>
          {textureFiles.length > 0 
            ? `${textureFiles.length} image(s)` 
            : 'Select textures'}
        </Typography>
      </Box>
      
      {/* Texture files list - extremely compact in compact mode */}
      {textureFiles.length > 0 && (
        <>
          <Typography variant={compact ? "caption" : "subtitle2"} gutterBottom>
            Selected ({textureFiles.length})
          </Typography>
          
          <List dense sx={{ 
            mb: compact ? 0.5 : 2,
            '& .MuiListItem-root': {
              py: compact ? 0 : 0.5
            }
          }}>
            {textureFiles.map((file, index) => (
              <ListItem key={index} sx={{ py: compact ? 0 : 1 }}>
                <ListItemIcon sx={{ minWidth: compact ? 30 : 40 }}>
                  <ImageIcon fontSize={compact ? "small" : "medium"} />
                </ListItemIcon>
                <ListItemText
                  primary={file.name}
                  secondary={compact ? null : `${(file.size / 1024).toFixed(2)} KB`}
                  primaryTypographyProps={{ 
                    noWrap: true,
                    fontSize: compact ? '0.75rem' : '0.875rem'
                  }}
                />
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => removeTextureFile(index)}
                  size={compact ? "small" : "medium"}
                >
                  <DeleteIcon fontSize={compact ? "small" : "medium"} />
                </IconButton>
              </ListItem>
            ))}
          </List>
        </>
      )}
      
      <Divider sx={{ my: compact ? 0.5 : 2 }} />
      
      {/* Action buttons - more compact */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          onClick={clearFiles}
          disabled={loading || (!modelFile && textureFiles.length === 0)}
          size={compact ? "small" : "medium"}
          sx={{ fontSize: compact ? '0.75rem' : '0.875rem' }}
        >
          Clear
        </Button>
        
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpload}
          disabled={loading || !modelFile}
          startIcon={loading ? <CircularProgress size={compact ? 16 : 20} /> : null}
          size={compact ? "small" : "medium"}
          sx={{ fontSize: compact ? '0.75rem' : '0.875rem' }}
        >
          {loading ? 'Loading...' : 'View'}
        </Button>
      </Box>
    </Paper>
  );
};

export default ModelUploader; 