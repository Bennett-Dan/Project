import React, { useState } from 'react';
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Grid
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useSettings } from '../contexts/SettingsContext';
import apiService from '../services/api';

const SettingsPage = () => {
  const { settings, saveSettings, clearSettings } = useSettings();
  
  // Local state for form
  const [formData, setFormData] = useState({
    apiKey: settings.apiKey || '',
    apiUrl: settings.apiUrl || 'https://www.casestry.com/api/functions/indexFunctions.php'
  });
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [testResult, setTestResult] = useState(null);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle save settings
  const handleSave = () => {
    // Validate inputs
    if (!formData.apiKey || !formData.apiUrl) {
      setError('API Key and URL are required');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Save settings
      saveSettings(formData);
      setSuccess('Settings saved successfully');
    } catch (err) {
      setError('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  // Handle clear settings
  const handleClear = () => {
    clearSettings();
    setFormData({
      apiKey: '',
      apiUrl: 'https://www.casestry.com/api/functions/indexFunctions.php'
    });
    setSuccess('Settings cleared');
    setError(null);
    setTestResult(null);
  };

  // Handle test connection
  const handleTestConnection = async () => {
    // Validate inputs
    if (!formData.apiKey || !formData.apiUrl) {
      setError('API Key and URL are required');
      return;
    }

    setTestLoading(true);
    setError(null);
    setTestResult(null);

    try {
      // Test connection
      const result = await apiService.testConnection(formData.apiKey, formData.apiUrl);
      
      if (result.success) {
        setTestResult({
          success: true,
          message: 'Connection successful'
        });
      } else {
        setTestResult({
          success: false,
          message: result.message || 'Connection failed'
        });
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: err.message || 'Connection failed'
      });
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          API Settings
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          Configure the connection to the internal server API. These settings are required to fetch order data.
        </Typography>
        
        <Divider sx={{ my: 3 }} />
        
        {/* Status messages */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}
        
        {testResult && (
          <Alert 
            severity={testResult.success ? 'success' : 'error'} 
            sx={{ mb: 3 }}
            icon={testResult.success ? <CheckCircleIcon /> : undefined}
          >
            {testResult.message}
          </Alert>
        )}
        
        {/* Settings form */}
        <Box component="form" noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="apiKey"
            label="API Key"
            name="apiKey"
            value={formData.apiKey}
            onChange={handleChange}
            disabled={loading || testLoading}
            helperText="The authentication key for the internal server API"
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            id="apiUrl"
            label="API URL"
            name="apiUrl"
            value={formData.apiUrl}
            onChange={handleChange}
            disabled={loading || testLoading}
            helperText="The base URL for the internal server API"
          />
          
          <Grid container spacing={2} sx={{ mt: 3 }}>
            <Grid item xs={12} sm={4}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                onClick={handleSave}
                disabled={loading || testLoading}
              >
                {loading ? 'Saving...' : 'Save Settings'}
              </Button>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Button
                fullWidth
                variant="outlined"
                color="secondary"
                startIcon={<DeleteIcon />}
                onClick={handleClear}
                disabled={loading || testLoading}
              >
                Clear Settings
              </Button>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Button
                fullWidth
                variant="outlined"
                color="info"
                startIcon={testLoading ? <CircularProgress size={20} /> : null}
                onClick={handleTestConnection}
                disabled={loading || testLoading}
              >
                {testLoading ? 'Testing...' : 'Test Connection'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default SettingsPage; 