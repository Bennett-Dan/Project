import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  FormControlLabel,
  Switch,
  Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useSettings } from '../contexts/SettingsContext';
import { useModel } from '../contexts/ModelContext';
import apiService from '../services/api';

const OrderFetcher = () => {
  const { settings } = useSettings();
  const { loadModelFromUrl, resetModel } = useModel();
  const [orderId, setOrderId] = useState('');
  const [isTest, setIsTest] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Handle input change
  const handleOrderIdChange = (e) => {
    setOrderId(e.target.value);
  };

  // Handle test mode toggle
  const handleTestModeToggle = (e) => {
    setIsTest(e.target.checked);
  };

  // Handle fetch
  const handleFetch = async () => {
    if (!orderId) {
      setError('Please enter an order ID');
      return;
    }

    if (!settings.isConfigured) {
      setError('API settings are not configured. Please go to Settings page.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Fetch order data
      const response = await apiService.getOrderById(
        orderId,
        settings.apiKey,
        settings.apiUrl,
        isTest
      );
      
      // Check if response is successful
      if (response.result !== 'success') {
        console.log("failed")
        throw new Error(response.response || 'Failed to fetch order data');
      }
      console.log("succedd")
      // Extract model and texture URLs
      const orderData = response.response;
      
      //let's parse!!
      const modelUrl = orderData.items?.[0]?.full_artwork || null;
      const textureUrls = [];
      
      if (orderData.items) {
        orderData.items.forEach(item => {
          if (item.artwork && !textureUrls.includes(item.artwork)) {
            textureUrls.push(item.artwork);
          }
          if (item.thumbnail_url && !textureUrls.includes(item.thumbnail_url)) {
            textureUrls.push(item.thumbnail_url);
          }
        });
      }
      
      if (!modelUrl) {
        throw new Error('No model found in order data');
      }
      
      // Load the model
      loadModelFromUrl(modelUrl, textureUrls);
      
      setSuccess(`Order #${orderId} fetched successfully. Loading 3D model...`);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message || 'Failed to fetch order data. Please try again.');
      resetModel();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Fetch by Order ID
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
      
      {!settings.isConfigured && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          API settings are not configured. Please go to the Settings page.
        </Alert>
      )}
      
      {/* Order ID input */}
      <TextField
        label="Order ID"
        variant="outlined"
        fullWidth
        value={orderId}
        onChange={handleOrderIdChange}
        disabled={loading || !settings.isConfigured}
        sx={{ mb: 2 }}
      />
      
      {/* Test mode toggle */}
      <FormControlLabel
        control={
          <Switch
            checked={isTest}
            onChange={handleTestModeToggle}
            disabled={loading}
          />
        }
        label="Test Mode"
        sx={{ mb: 2 }}
      />
      
      <Divider sx={{ my: 2 }} />
      
      {/* Action button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleFetch}
          disabled={loading || !orderId || !settings.isConfigured}
          startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
        >
          {loading ? 'Fetching...' : 'Fetch Order'}
        </Button>
      </Box>
    </Paper>
  );
};

export default OrderFetcher; 