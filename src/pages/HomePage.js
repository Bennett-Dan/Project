import React, { useState, useCallback } from 'react';
import { Box, Paper, Tabs, Tab, Container, Typography, LinearProgress } from '@mui/material';
import ModelViewer from '../components/ModelViewer';
import ModelControls from '../components/ModelControls';
import ModelUploader from '../components/ModelUploader';
import OrderFetcher from '../components/OrderFetcher';
import OrderDashboard from '../components/OrderDashboard';
import { useModel } from '../contexts/ModelContext';

const HomePage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { modelData } = useModel();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleLoadingChange = useCallback((isLoading) => {
    setLoading(isLoading);
  }, []);

  return (
    <Container maxWidth="xl" sx={{ py: 2 }} disableGutters>
      {/* Main 3D Viewer Section - Fixed height with narrow sidebars */}
      <Box sx={{ 
        display: 'flex',
        height: '80vh', // Taller viewer section
        width: '100%',
        overflow: 'hidden',
        mb: 3,
        borderRadius: 1,
        boxShadow: 2
      }}>
        {/* Left sidebar - narrower */}
        <Box sx={{ 
          width: '220px', // Reduced from 300px
          overflowY: 'auto',
          borderRight: '1px solid',
          borderColor: 'divider',
          height: '100%',
          bgcolor: 'background.paper'
        }}>
          <Paper elevation={0} sx={{ mb: 0.5 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="fullWidth"
              indicatorColor="primary"
              textColor="primary"
              sx={{ 
                minHeight: '36px', // Smaller tabs
                '& .MuiTab-root': { 
                  minHeight: '36px',
                  fontSize: '0.85rem',
                  py: 0.5
                }
              }}
            >
              <Tab label="Manual" />
              <Tab label="Order ID" />
            </Tabs>
          </Paper>

          {/* Tab content - compact styling */}
          <Box sx={{ p: 1 }}>
            {activeTab === 0 && <ModelUploader compact={true} onLoadingChange={handleLoadingChange} />}
            {activeTab === 1 && (
              <OrderFetcher 
                onOrderLoaded={(data) => setOrderData(data)}
                compact={true}
                onLoadingChange={handleLoadingChange}
              />
            )}
          </Box>
        </Box>

        {/* Center content - 3D Viewer (much wider) */}
        <Box sx={{ 
          flexGrow: 1,
          height: '100%',
          position: 'relative',
          bgcolor: '#1a1a1a', // Darker background for the viewer
        }}>
          <ModelViewer />
        </Box>

        {/* Right sidebar - narrower */}
        <Box sx={{ 
          width: '180px', // Reduced from 250px
          overflowY: 'auto',
          borderLeft: '1px solid',
          borderColor: 'divider',
          height: '100%',
          bgcolor: 'background.paper',
          p: 1
        }}>
          <ModelControls compact={true} />
        </Box>
      </Box>
      
      {/* Order Dashboard (full width, scrollable) */}
      {orderData && (
        <OrderDashboard orderData={orderData} />
      )}

      {/* Performance notice */}
      {loading && (
        <Paper 
          elevation={2} 
          sx={{ 
            position: 'fixed', 
            bottom: 16, 
            right: 16, 
            p: 2, 
            zIndex: 1000,
            maxWidth: 300
          }}
        >
          <Typography variant="body2">
            First load may take 15-30 seconds for large models. Subsequent loads will be faster.
          </Typography>
          <LinearProgress sx={{ mt: 1 }} />
        </Paper>
      )}
    </Container>
  );
};

export default HomePage; 