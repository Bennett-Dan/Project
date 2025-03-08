// Use your server as the base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://07dd-37-120-156-98.ngrok-free.app';

const apiService = {
  // Test API connection settings
  testConnection: async (apiKey, apiUrl) => {
    try {
      // Use your server's test endpoint
      const response = await fetch(`${API_BASE_URL}/api/settings/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ apiKey, apiUrl })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      return {
        success: data.success,
        message: data.message || 'Connection test completed'
      };
    } catch (error) {
      console.error('API Connection error:', error);
      return {
        success: false,
        message: error.message || 'Failed to connect to API'
      };
    }
  },

  // Get order by ID - Using your server as proxy
  getOrderById: async (orderId, apiKey, apiUrl, isTest = false) => {
    try {
      console.log(`Fetching order ${orderId} through server proxy`);
      
      // Use your server's order endpoint
      const response = await fetch(`${API_BASE_URL}/api/order/${orderId}?test=${isTest ? 'true' : 'false'}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,      // Your server expects this header
          'x-api-url': apiUrl       // Your server expects this header
        }
      });
      console.log("response", response);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("---------------------", data.response);
      return data;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw new Error(error.message || 'Failed to fetch order data');
    }
  },
  
  // Upload model file - Already using your server
  uploadModel: async (file) => {
    const formData = new FormData();
    formData.append('model', file);

    try {
      const response = await fetch(`${API_BASE_URL}/upload/model`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      throw error.message || 'Failed to upload model';
    }
  },

  // Upload texture file - Already using your server
  uploadTexture: async (file) => {
    const formData = new FormData();
    formData.append('texture', file);

    try {
      const response = await fetch(`${API_BASE_URL}/upload/texture`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      throw error.message || 'Failed to upload texture';
    }
  },

  // Upload multiple files (model + textures) - Direct viewing without server
  uploadMultiple: async (modelFile, textureFiles = []) => {
    // For direct viewing without server upload, create local blob URLs
    const modelUrl = URL.createObjectURL(modelFile);
    const texturePaths = textureFiles.map(file => URL.createObjectURL(file));
    
    // Return formats that match what the components expect
    return {
      model: { path: modelUrl },
      textures: texturePaths.map(path => ({ path }))
    };
  },

  // Add this new function to apiService
  getProxiedUrl: (url) => {
    // Encode the URL properly for use in a query string
    const encodedUrl = encodeURIComponent(url);
    return `${API_BASE_URL}/api/proxy-model?url=${encodedUrl}`;
  },

  // General file proxy function
  getProxiedFileUrl: (url) => {
    const encodedUrl = encodeURIComponent(url);
    return `${API_BASE_URL}/api/proxy-file?url=${encodedUrl}`;
  },

  // Model-specific proxy (same implementation, for clarity)
  getProxiedModelUrl: (url) => {
    return apiService.getProxiedFileUrl(url);
  },

  // Texture-specific proxy
  getProxiedTextureUrl: (url) => {
    return apiService.getProxiedFileUrl(url);
  }
};

export default apiService; 