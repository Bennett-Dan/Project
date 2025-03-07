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

const ModelControls = () => {
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
      <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
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
      <Paper elevation={2} sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'center' }}>
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
    <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Model Objects ({objects.length})
      </Typography>
      
      <Divider sx={{ my: 1 }} />
      
      <List dense>
        {objects.map((object) => (
          <Box key={object.id} sx={{ mb: 2 }}>
            <ListItem>
              <ListItemText
                primary={object.name}
                secondary={`ID: ${object.id.substring(0, 8)}...`}
              />
              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                  checked={object.visible}
                  onChange={() => handleVisibilityToggle(object.id)}
                  inputProps={{ 'aria-labelledby': `visibility-switch-${object.id}` }}
                />
              </ListItemSecondaryAction>
            </ListItem>
            
            <Box sx={{ pl: 2, pr: 2, mt: 1 }}>
              {object.hasTexture ? (
                <Button
                  variant="outlined"
                  color="secondary"
                  size="small"
                  fullWidth
                  onClick={() => handleRemoveTexture(object.id)}
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
                      sx={{ mb: 1 }}
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
            
            <Divider sx={{ mt: 1 }} />
          </Box>
        ))}
      </List>
    </Paper>
  );
};

export default ModelControls; 