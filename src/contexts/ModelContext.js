import React, { createContext, useState, useContext } from 'react';

// Create context
const ModelContext = createContext();

// Model provider component
export const ModelProvider = ({ children }) => {
  // State for model data
  const [modelData, setModelData] = useState({
    modelUrl: null,
    textureUrls: [],
    objects: [],
    isLoading: false,
    error: null
  });

  // State for selected object
  const [selectedObject, setSelectedObject] = useState(null);

  // Load model from URL
  const loadModelFromUrl = (modelUrl, textureUrls = []) => {
    setModelData({
      ...modelData,
      modelUrl,
      textureUrls,
      isLoading: true,
      error: null
    });
  };

  // Set model objects after loading
  const setModelObjects = (objects) => {
    setModelData({
      ...modelData,
      objects,
      isLoading: false
    });
  };

  // Set error state
  const setModelError = (error) => {
    setModelData({
      ...modelData,
      error,
      isLoading: false
    });
  };

  // Toggle object visibility
  const toggleObjectVisibility = (objectId) => {
    const updatedObjects = modelData.objects.map(obj => {
      if (obj.id === objectId) {
        return { ...obj, visible: !obj.visible };
      }
      return obj;
    });

    setModelData({
      ...modelData,
      objects: updatedObjects
    });
  };

  // Apply texture to object
  const applyTextureToObject = (objectId, textureUrl) => {
    const updatedObjects = modelData.objects.map(obj => {
      if (obj.id === objectId) {
        return { 
          ...obj, 
          textureUrl,
          hasTexture: true
        };
      }
      return obj;
    });

    setModelData({
      ...modelData,
      objects: updatedObjects
    });
  };

  // Remove texture from object
  const removeTextureFromObject = (objectId) => {
    const updatedObjects = modelData.objects.map(obj => {
      if (obj.id === objectId) {
        return { 
          ...obj, 
          textureUrl: null,
          hasTexture: false
        };
      }
      return obj;
    });

    setModelData({
      ...modelData,
      objects: updatedObjects
    });
  };

  // Reset model data
  const resetModel = () => {
    setModelData({
      modelUrl: null,
      textureUrls: [],
      objects: [],
      isLoading: false,
      error: null
    });
    setSelectedObject(null);
  };

  // Context value
  const value = {
    modelData,
    selectedObject,
    setSelectedObject,
    loadModelFromUrl,
    setModelObjects,
    setModelError,
    toggleObjectVisibility,
    applyTextureToObject,
    removeTextureFromObject,
    resetModel
  };

  return (
    <ModelContext.Provider value={value}>
      {children}
    </ModelContext.Provider>
  );
};

// Custom hook to use model context
export const useModel = () => {
  const context = useContext(ModelContext);
  if (!context) {
    throw new Error('useModel must be used within a ModelProvider');
  }
  return context;
}; 