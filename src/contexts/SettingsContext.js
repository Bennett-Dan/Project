import React, { createContext, useState, useContext, useEffect } from 'react';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  // State for API settings
  const [settings, setSettings] = useState({
    apiKey: localStorage.getItem('apiKey') || '',
    apiUrl: localStorage.getItem('apiUrl') || 'https://www.casestry.com/api/functions/indexFunctionsTest.php',
    isConfigured: false
  });

  // Effect to check if settings are configured
  useEffect(() => {
    const isConfigured = Boolean(settings.apiKey && settings.apiUrl);
    setSettings(prev => ({ ...prev, isConfigured }));
  }, [settings.apiKey, settings.apiUrl]);

  // Save settings to localStorage
  const saveSettings = (newSettings) => {
    const updatedSettings = { ...settings, ...newSettings };
    
    // Save to localStorage
    localStorage.setItem('apiKey', updatedSettings.apiKey);
    localStorage.setItem('apiUrl', updatedSettings.apiUrl);
    
    // Update state
    setSettings(updatedSettings);
    
    return updatedSettings;
  };

  // Clear settings
  const clearSettings = () => {
    localStorage.removeItem('apiKey');
    localStorage.removeItem('apiUrl');
    
    setSettings({
      apiKey: '',
      apiUrl: 'https://www.casestry.com/api/functions/indexFunctions.php',
      isConfigured: false
    });
  };

  // Context value
  const value = {
    settings,
    saveSettings,
    clearSettings
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

// Custom hook to use settings context
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}; 