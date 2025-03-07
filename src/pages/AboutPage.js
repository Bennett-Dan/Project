import React from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Link
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CodeIcon from '@mui/icons-material/Code';
import InfoIcon from '@mui/icons-material/Info';
import ThreeDRotationIcon from '@mui/icons-material/ThreeDRotation';

const AboutPage = () => {
  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <ThreeDRotationIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
          <Typography variant="h4">
            how to
          </Typography>
        </Box>
        
        <Typography variant="body1" paragraph>
          view and interact with 3D models (.fbx files). 
          upload models,textures or fetch them with order id.
        </Typography>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="h5" gutterBottom>
          <InfoIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Note
        </Typography>
        
        <List>
          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Upload & View" 
              secondary="pls click this button whenever model or texture is uploaded"
            />
          </ListItem>
          
          
        </List>
        
        <Divider sx={{ my: 3 }} />
        
  
        
        <Typography variant="body2" color="text.secondary" align="center">
          &copy; {new Date().getFullYear()} 3D Model Viewer. All rights reserved.
          <br />
        </Typography>
      </Paper>
    </Container>
  );
};

export default AboutPage; 