import axios from 'axios';

// could be used if we make a server for file uploads
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';


const apiService = {
  // Test API connection settings
  testConnection: async (apiKey, apiUrl) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/proxy`, {
        params: {
          url: apiUrl,
          params: JSON.stringify({
            action: 'viewOrder',
            orderId: 1
          })
        },
        headers: {
          'Authorization': apiKey,
          'Content-Type': 'application/json'
        }
      });
      
      const isSuccess = response.data && (response.data.result === 'success' || 
        (response.data.result === 'error' && response.data.response?.includes('No match')));
      
      return {
        success: isSuccess,
        message: isSuccess ? 'Connection successful' : 'Connection failed'
      };
    } catch (error) {
      console.error('API Connection error:', error);
      return {
        success: false,
        message: error.message || 'Failed to connect to API'
      };
    }
  },

  // Get order by ID - Direct approach like Python script
  getOrderById: async (orderId, apiKey, apiUrl, isTest = false) => {
    try {
      console.log(`Fetching order ${orderId} from ${apiUrl}`);
      
      // Direct request like the Python script 
      const response = await axios.get(
        `${apiUrl}`, 
        {
          params: {
            action: 'viewOrder',
            orderId: orderId,
            test: isTest ? 1 : 0
          },
          headers: {
            'HTTP_AUTHORIZATION': apiKey,  // Use correct header name
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error fetching order:', error);
      if (error.response) {
        return error.response.data;
      } else {
        throw new Error(error.message || 'Failed to fetch order data');
      }
    }
  },



  
  //if we need manuall server for Uploading model file
  uploadModel: async (file) => {
    const formData = new FormData();
    formData.append('model', file);

    try {
      const response = await axios.post(`${API_BASE_URL}/upload/model`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Upload texture file
  uploadTexture: async (file) => {
    const formData = new FormData();
    formData.append('texture', file);

    try {
      const response = await axios.post(`${API_BASE_URL}/upload/texture`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Upload multiple files (model + textures)
  uploadMultiple: async (modelFile, textureFiles = []) => {
    // For direct viewing without server upload, create local blob URLs
    const modelUrl = URL.createObjectURL(modelFile);
    const texturePaths = textureFiles.map(file => URL.createObjectURL(file));
    
    // Return formats that match what the components expect
    return {
      model: { path: modelUrl },
      textures: texturePaths.map(path => ({ path }))
    };
  }
};

export default apiService; 