import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  Button,
  Divider,
  Paper,
  CircularProgress
} from '@mui/material';
import { useModel } from '../contexts/ModelContext';

const ModelControls = ({ compact = false }) => {
  const { 
    modelData, 
    toggleObjectVisibility, 
    applyTextureToObject, 
    removeTextureFromObject 
  } = useModel();

  const { objects, isLoading, textureUrls } = modelData;

  // If no objects are loaded, show a message
  if (!objects.length && !isLoading) {
    return (
      <Paper elevation={2} sx={{ p: 1, mb: 1 }}>
        <Typography variant="subtitle1" gutterBottom>
          Model Objects
        </Typography>
        <Typography variant="body2" color="text.secondary">
          No model loaded or no objects found in the model.
        </Typography>
      </Paper>
    );
  }

  // If loading, show a loading indicator
  if (isLoading) {
    return (
      <Paper elevation={2} sx={{ p: 1, mb: 1, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress size={24} sx={{ mr: 1 }} />
        <Typography variant="body1">Loading model objects...</Typography>
      </Paper>
    );
  }

  // Handle visibility toggle
  const handleVisibilityToggle = (objectId) => {
    toggleObjectVisibility(objectId);
  };

  // Handle texture application
  const handleApplyTexture = (objectId, textureUrl) => {
    applyTextureToObject(objectId, textureUrl);
  };

  // Handle texture removal
  const handleRemoveTexture = (objectId) => {
    removeTextureFromObject(objectId);
  };

  return (
    <Box>
      <Typography variant={compact ? "subtitle2" : "subtitle1"} color="text.secondary" sx={{ 
        mb: 0.5, 
        fontWeight: 500,
        fontSize: compact ? '0.75rem' : '0.875rem'
      }}>
        Model Objects ({objects.length})
      </Typography>
      
      {objects.map((object) => (
        <Paper 
          key={object.id} 
          elevation={0}
          sx={{ 
            mb: 1, 
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
          }}
        >
          <Box sx={{ 
            p: compact ? 0.5 : 1, 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            bgcolor: object.visible ? 'rgba(58, 134, 255, 0.04)' : 'transparent',
          }}>
            <Typography 
              variant={compact ? "caption" : "body2"}
              sx={{ 
                fontWeight: 500,
                color: object.visible ? 'primary.main' : 'text.primary',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: compact ? '100px' : '170px'
              }}
            >
              {object.name}
            </Typography>
            <Switch
              size="small"
              checked={object.visible}
              onChange={() => handleVisibilityToggle(object.id)}
              color="primary"
            />
          </Box>
          
          <Divider />
          
          <Box sx={{ p: compact ? 0.5 : 1 }}>
            {object.hasTexture ? (
              <Button
                variant="outlined"
                color="secondary"
                size="small"
                fullWidth
                onClick={() => handleRemoveTexture(object.id)}
                sx={{ 
                  borderRadius: 1,
                  height: compact ? '24px' : '32px',
                  fontSize: compact ? '0.65rem' : '0.75rem',
                }}
              >
                Remove Texture
              </Button>
            ) : (
              textureUrls.length > 0 ? (
                textureUrls.map((textureUrl, index) => (
                  <Button
                    key={index}
                    variant="outlined"
                    color="primary"
                    size="small"
                    fullWidth
                    sx={{ 
                      mb: index < textureUrls.length - 1 ? 0.5 : 0,
                      borderRadius: 1,
                      height: compact ? '24px' : '32px',
                      fontSize: compact ? '0.65rem' : '0.75rem'
                    }}
                    onClick={() => handleApplyTexture(object.id, textureUrl)}
                  >
                    Apply Texture {index + 1}
                  </Button>
                ))
              ) : (
                <Typography variant="caption" color="text.secondary">
                  No textures available
                </Typography>
              )
            )}
          </Box>
        </Paper>
      ))}
    </Box>
  );
};

export default ModelControls; 