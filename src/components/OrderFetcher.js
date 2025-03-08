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

const OrderFetcher = ({ onOrderLoaded, compact = false }) => {
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
        throw new Error(response.response || 'Failed to fetch order data');
      }
      
      // Extract order data
      const orderData = response.response;
      
      // Pass order data to parent component if callback exists
      if (onOrderLoaded && typeof onOrderLoaded === 'function') {
        onOrderLoaded(orderData);
      }
      
      setSuccess(`Order #${orderId} fetched successfully.`);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message || 'Failed to fetch order data. Please try again.');
      resetModel();
      
      // Reset order data on error
      if (onOrderLoaded && typeof onOrderLoaded === 'function') {
        onOrderLoaded(null);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: compact ? 1 : 2, mb: compact ? 1 : 2 }}>
      <Typography variant={compact ? "subtitle2" : "h6"} gutterBottom>
        Fetch by Order ID
      </Typography>
      
      {/* Status messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 1, py: compact ? 0 : 1, fontSize: compact ? '0.75rem' : '0.875rem' }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 1, py: compact ? 0 : 1, fontSize: compact ? '0.75rem' : '0.875rem' }}>
          {success}
        </Alert>
      )}
      
      {!settings.isConfigured && (
        <Alert severity="warning" sx={{ mb: 1, py: compact ? 0 : 1, fontSize: compact ? '0.75rem' : '0.875rem' }}>
          Configure API in Settings
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
        sx={{ 
          mb: 1,
          '& .MuiInputLabel-root': {
            fontSize: compact ? '0.75rem' : '0.875rem'
          },
          '& .MuiOutlinedInput-root': {
            fontSize: compact ? '0.75rem' : '0.875rem'
          }
        }}
        size={compact ? "small" : "medium"}
      />
      
      {/* Test mode toggle */}
      <FormControlLabel
        control={
          <Switch
            checked={isTest}
            onChange={handleTestModeToggle}
            disabled={loading}
            size={compact ? "small" : "medium"}
          />
        }
        label="Test Mode"
        sx={{ 
          mb: 1,
          '& .MuiFormControlLabel-label': {
            fontSize: compact ? '0.75rem' : '0.875rem'
          }
        }}
      />
      
      <Divider sx={{ my: compact ? 0.5 : 2 }} />
      
      {/* Action button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleFetch}
          disabled={loading || !orderId || !settings.isConfigured}
          startIcon={loading ? <CircularProgress size={compact ? 16 : 20} /> : <SearchIcon fontSize={compact ? "small" : "medium"} />}
          size={compact ? "small" : "medium"}
          sx={{ fontSize: compact ? '0.75rem' : '0.875rem' }}
        >
          {loading ? 'Fetching...' : 'Fetch Order'}
        </Button>
      </Box>
    </Paper>
  );
};

export default OrderFetcher; 