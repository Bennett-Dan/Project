import React, { useState } from 'react';
import { Container, Grid, Box, Paper, Tabs, Tab } from '@mui/material';
import ModelViewer from '../components/ModelViewer';
import ModelControls from '../components/ModelControls';
import ModelUploader from '../components/ModelUploader';
import OrderFetcher from '../components/OrderFetcher';

const HomePage = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      height: 'calc(100vh - 140px)',
      width: '100%',
      overflow: 'hidden' 
    }}>
      {/* Left sidebar*/}
      <Box sx={{ 
        width: '300px', 
        p: 1, 
        overflowY: 'auto',
        borderRight: '1px solid #ddd'
      }}>
        <Paper elevation={1} sx={{ mb: 1 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label="Manual" />
            <Tab label="Order ID" />
          </Tabs>
        </Paper>

        {/* Tab content */}
        {activeTab === 0 && <ModelUploader />}
        {activeTab === 1 && <OrderFetcher />}
      </Box>

      {/* Center content - 3D Viewer (maximized) */}
      <Box sx={{ 
        flexGrow: 1,
        height: '100%',
        position: 'relative',
        m: 1 
      }}>
        <ModelViewer />
      </Box>

      {/* Right sidebar - Model controls (narrow) */}
      <Box sx={{ 
        width: '250px', // Narrow controls panel
        p: 1, // Smaller padding
        overflowY: 'auto',
        borderLeft: '1px solid #ddd'
      }}>
        <ModelControls />
      </Box>
    </Box>
  );
};

export default HomePage; 