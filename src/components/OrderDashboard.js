import React, { useState } from 'react';
import {
  Box, Paper, Typography, Grid, Chip, Link, Card, CardContent,
  IconButton, Collapse, Avatar, LinearProgress,
  Stack, List, ListItem, ListItemText, ListItemIcon,
  Button,
} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import InventoryIcon from '@mui/icons-material/Inventory';
import ReceiptIcon from '@mui/icons-material/Receipt';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import RepeatIcon from '@mui/icons-material/Repeat';
import PhotoIcon from '@mui/icons-material/Photo';
import QrCodeIcon from '@mui/icons-material/QrCode';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import StyleIcon from '@mui/icons-material/Style';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import PaletteIcon from '@mui/icons-material/Palette';
import TimerIcon from '@mui/icons-material/Timer';
import PrintIcon from '@mui/icons-material/Print';
import InfoIcon from '@mui/icons-material/Info';
import DevicesIcon from '@mui/icons-material/Devices';
import ArtTrackIcon from '@mui/icons-material/ArtTrack';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import LaunchIcon from '@mui/icons-material/Launch';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import StraightenIcon from '@mui/icons-material/Straighten';
import MemoryIcon from '@mui/icons-material/Memory';
import BuildIcon from '@mui/icons-material/Build';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import { useModel } from '../contexts/ModelContext';
import apiService from '../services/api';

const getModelFileId = (itemType) => {
  // Simple normalization: lowercase and remove spaces/special chars
  const normalizedType = (itemType || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Map of normalized phone models to their Google Drive file IDs
  const modelMap = {
    // iPhone 7 series
    'iphone7': 'REPLACE_WITH_ACTUAL_ID',
    'iphone7plus': 'REPLACE_WITH_ACTUAL_ID',
    
    // iPhone X series
    'iphonex': 'REPLACE_WITH_ACTUAL_ID',
    'iphonexr': 'REPLACE_WITH_ACTUAL_ID',
    'iphonexsmax': 'REPLACE_WITH_ACTUAL_ID',
    
    // iPhone 11 series
    'iphone11': 'REPLACE_WITH_ACTUAL_ID',
    'iphone11pro': 'REPLACE_WITH_ACTUAL_ID',
    'iphone11promax': 'REPLACE_WITH_ACTUAL_ID',
    
    // iPhone 12 series
    'iphone12': 'REPLACE_WITH_ACTUAL_ID',
    'iphone12mini': 'REPLACE_WITH_ACTUAL_ID',
    'iphone12pro': 'REPLACE_WITH_ACTUAL_ID',
    'iphone12promax': 'REPLACE_WITH_ACTUAL_ID',
    
    // iPhone 13 series
    'iphone13': 'REPLACE_WITH_ACTUAL_ID',
    'iphone13mini': 'REPLACE_WITH_ACTUAL_ID',
    'iphone13pro': 'REPLACE_WITH_ACTUAL_ID',
    'iphone13promax': 'REPLACE_WITH_ACTUAL_ID',
    
    // iPhone 14 series
    'iphone14': 'REPLACE_WITH_ACTUAL_ID',
    'iphone14plus': 'REPLACE_WITH_ACTUAL_ID',
    'iphone14pro': 'REPLACE_WITH_ACTUAL_ID',
    'iphone14promax': 'REPLACE_WITH_ACTUAL_ID',
    
    // iPhone 15 series
    'iphone15': 'REPLACE_WITH_ACTUAL_ID',
    'iphone15plus': 'REPLACE_WITH_ACTUAL_ID',
    'iphone15pro': 'REPLACE_WITH_ACTUAL_ID',
    'iphone15promax': 'REPLACE_WITH_ACTUAL_ID',
  };
  
  // Default fallback model if no match is found
  const defaultModelId = '1UiXmF0cYzMxRsKQcgXExKbfIYYUqM_v4';
  
  // Direct lookup in the map
  if (modelMap[normalizedType]) {
    console.log(`Found exact match for: ${normalizedType}`);
    return modelMap[normalizedType];
  }
  
  // Simple includes check as fallback
  for (const key in modelMap) {
    if (normalizedType.includes(key)) {
      console.log(`Found match by inclusion: ${normalizedType} includes ${key}`);
      return modelMap[key];
    }
  }
  
  console.log(`No match found for: ${normalizedType}, using default model`);
  return defaultModelId;
};

const OrderDashboard = ({ orderData }) => {
  const [expandedItems, setExpandedItems] = useState({});
  const [expanded, setExpanded] = useState(true);
  const { loadModelFromUrl, resetModel } = useModel();
  
  if (!orderData) return null;

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'success';
      case 'shipped': return 'info';
      case 'pre_transit': return 'warning';
      case 'transit': return 'primary';
      default: return 'primary';
    }
  };

  const toggleItemExpand = (itemIndex) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemIndex]: !prev[itemIndex]
    }));
  };

  const getInventoryStatus = (item) => {
    if (!item.inventory || !item.reorder_at) return { color: 'primary', label: 'Unknown' };
    
    if (item.inventory <= 0) return { color: 'error', label: 'Out of Stock' };
    if (item.inventory <= item.reorder_at * 0.5) return { color: 'error', label: 'Critical' };
    if (item.inventory <= item.reorder_at) return { color: 'warning', label: 'Low' };
    if (item.inventory > item.reorder_at * 5) return { color: 'success', label: 'Excellent' };
    return { color: 'success', label: 'Good' };
  };

  const getProductionStatus = (item) => {
    if (item.defective > 0) return { color: 'error', label: 'Defective Units', icon: <ErrorIcon /> };
    if (item.reprint) return { color: 'warning', label: 'Reprint Needed', icon: <RepeatIcon /> };
    if (item.printed && item.completed) return { color: 'success', label: 'Completed', icon: <CheckCircleIcon /> };
    if (item.printed) return { color: 'info', label: 'Printed', icon: <PrintIcon /> };
    if (item.completed) return { color: 'primary', label: 'Ready', icon: <CheckBoxIcon /> };
    return { color: 'primary', label: 'Pending', icon: <TimerIcon /> };
  };

  const handleViewIn3D = (item) => {
    // First scroll to the top where the ModelViewer is located
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    
    // Reset model state
    resetModel();
    
    // Short timeout to ensure the UI updates before loading the new model
    setTimeout(() => {
      // Get file ID using simple matching
      const fileId = getModelFileId(item.type);
      
      // Create the Google Drive direct download URL
      const googleDriveUrl = `https://drive.usercontent.google.com/u/0/uc?id=${fileId}&export=download`;
      console.log(`Loading model for: ${item.type}, using file ID: ${fileId}`);
      
      const modelUrl = apiService.getProxiedModelUrl(googleDriveUrl);
      
      // Process texture URLs
      const textureUrls = [];
      if (item.artwork) {
        const proxiedTextureUrl = apiService.getProxiedTextureUrl(item.artwork);
        textureUrls.push(proxiedTextureUrl);
      }
      
      // Load the model with this specific item's texture
      loadModelFromUrl(modelUrl, textureUrls);
    }, 50);
  };

  return (
    <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden', mb: 4 }}>
      {/* Header with order info and collapse toggle */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        p: 2,
        backgroundColor: 'primary.main',
        color: 'white'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            src={orderData.print_logo} 
            alt={orderData.order_from}
            sx={{ mr: 2, width: 40, height: 40 }}
          />
          <Box>
            <Typography variant="h6" fontWeight="600">
              Order #{orderData.customer_order_id}
            </Typography>
            <Typography variant="body2">
              {orderData.order_from} • {formatDate(orderData.order_date)}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Chip 
            label={orderData.track_status?.replace('_', ' ').toUpperCase() || 'PENDING'} 
            size="medium"
            color={getStatusColor(orderData.track_status)}
            sx={{ mr: 2, fontWeight: 'bold' }}
          />
          <IconButton 
            onClick={() => setExpanded(!expanded)} 
            sx={{ color: 'white' }}
          >
            {expanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </Box>
      </Box>
      
      {/* Collapsible content */}
      <Collapse in={expanded}>
        <Box sx={{ p: 3 }}>
          {/* Order summary cards row */}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <ReceiptIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="subtitle2" color="text.secondary">Order Details</Typography>
                  </Box>
                  <Box sx={{ mt: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Order ID:</Typography>
                      <Typography variant="body2" fontWeight="500">{orderData.customer_order_id}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Date:</Typography>
                      <Typography variant="body2">{orderData.order_date.split(' ')[0]}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">From:</Typography>
                      <Typography variant="body2">{orderData.order_from}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AttachMoneyIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="subtitle2" color="text.secondary">Order Value</Typography>
                  </Box>
                  <Typography variant="h4" sx={{ my: 1 }}>
                    ${orderData.total_price?.toFixed(2) || '0.00'}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Items:</Typography>
                    <Typography variant="body2">{orderData.items?.length || 0}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Weight:</Typography>
                    <Typography variant="body2">{orderData.total_weight} lbs</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocalShippingIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="subtitle2" color="text.secondary">Shipping</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', my: 1 }}>
                    <Chip 
                      label={orderData.track_status?.replace('_', ' ').toUpperCase() || 'PENDING'} 
                      size="medium"
                      color={getStatusColor(orderData.track_status)}
                    />
                  </Box>
                  <Box sx={{ mt: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Carrier:</Typography>
                      <Typography variant="body2">{orderData.shipping_carrier}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Service:</Typography>
                      <Typography variant="body2">{orderData.shipping_service}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Inventory2Icon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="subtitle2" color="text.secondary">Package</Typography>
                  </Box>
                  <Box sx={{ mt: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Dimensions:</Typography>
                      <Typography variant="body2">{orderData.package_length}″ × {orderData.package_width}″ × {orderData.package_height}″</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Weight:</Typography>
                      <Typography variant="body2">{orderData.total_weight} lbs</Typography>
                    </Box>
                    {orderData.bin && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Bin:</Typography>
                        <Typography variant="body2">{orderData.bin}</Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          {/* Tracking information */}
          {orderData.tracking_number && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" fontWeight="500" gutterBottom>
                <LocalShippingIcon sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
                Tracking Information
              </Typography>
              <Card variant="outlined">
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" color="text.secondary">Carrier</Typography>
                      <Typography variant="body1" fontWeight="500">{orderData.shipping_carrier} {orderData.shipping_service}</Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" color="text.secondary">Tracking Number</Typography>
                      <Typography variant="body1" fontWeight="500" sx={{ display: 'flex', alignItems: 'center' }}>
                        {orderData.tracking_number}
                        <IconButton size="small" onClick={() => navigator.clipboard.writeText(orderData.tracking_number)}>
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" color="text.secondary">Actions</Typography>
                      {orderData.tracking_url ? (
                        <Link 
                          href={orderData.tracking_url} 
                          target="_blank" 
                          rel="noopener"
                          sx={{ display: 'inline-flex', alignItems: 'center', fontSize: '0.9rem' }}
                        >
                          Track Package <LaunchIcon sx={{ ml: 0.5, fontSize: '0.9rem' }} />
                        </Link>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Tracking link not available
                        </Typography>
                      )}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Box>
          )}

          {/* Order Items Section - Detailed view for each item */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" fontWeight="500" gutterBottom>
              <InventoryIcon sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
              Order Items ({orderData.items?.length || 0})
            </Typography>
            
            {orderData.items?.map((item, index) => (
              <Card variant="outlined" key={index} sx={{ mb: 2 }}>
                <CardContent sx={{ p: 0 }}>
                  <Grid container>
                    {/* Item thumbnail column */}
                    <Grid item xs={12} sm={3} md={2} 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        borderRight: '1px solid',
                        borderColor: 'divider',
                        bgcolor: '#f9f9f9'
                      }}
                    >
                      <Box 
                        sx={{ 
                          position: 'relative', 
                          width: '100%', 
                          height: '100%',
                          minHeight: '180px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          p: 2
                        }}
                      >
                        {item.thumbnail_url ? (
                          <Box
                            component="img"
                            src={item.thumbnail_url}
                            alt={item.title}
                            sx={{
                              maxWidth: '100%',
                              maxHeight: '160px',
                              objectFit: 'contain'
                            }}
                          />
                        ) : (
                          <Box sx={{ 
                            width: '100%', 
                            height: '160px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            bgcolor: item.bg_color || '#f0f0f0',
                            color: 'text.secondary'
                          }}>
                            <PhotoIcon sx={{ fontSize: '3rem', opacity: 0.5 }} />
                          </Box>
                        )}
                        <Chip 
                          label={`SKU: ${item.sku}`}
                          size="small"
                          color="primary"
                          sx={{ 
                            position: 'absolute', 
                            top: 8, 
                            left: 8,
                            fontWeight: 'bold'
                          }}
                        />
                        {getProductionStatus(item).color !== 'primary' && (
                          <Chip 
                            icon={getProductionStatus(item).icon}
                            label={getProductionStatus(item).label}
                            size="small"
                            color={getProductionStatus(item).color}
                            sx={{ 
                              position: 'absolute', 
                              bottom: 8, 
                              left: 8
                            }}
                          />
                        )}
                      </Box>
                    </Grid>
                    
                    {/* Item details column */}
                    <Grid item xs={12} sm={9} md={10}>
                      <Box sx={{ p: 2 }}>
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'flex-start'
                        }}>
                          <Box>
                            <Typography variant="h6" fontWeight="500">
                              {item.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {item.type} • {item.branding}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="h6" color="primary.main">
                              ${item.price?.toFixed(2)}
                            </Typography>
                            <Typography variant="body2" fontWeight="500">
                              Qty: {item.qty}
                            </Typography>
                          </Box>
                        </Box>
                        
                        {/* Key specifications */}
                        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          <Chip 
                            icon={<StyleIcon />} 
                            label={`Style: ${item.style || 'Standard'}`} 
                            size="small" 
                            variant="outlined"
                          />
                          <Chip 
                            icon={<PaletteIcon />} 
                            label={`Finish: ${item.finish || 'Standard'}`} 
                            size="small" 
                            variant="outlined"
                          />
                          <Chip 
                            icon={<ColorLensIcon />} 
                            label={`Color: ${item.bg_color || 'Default'}`} 
                            size="small" 
                            variant="outlined"
                          />
                          <Chip 
                            icon={<TimerIcon />} 
                            label={`Bake: ${item.bake_time || 0}s`} 
                            size="small" 
                            variant="outlined"
                          />
                          <Chip 
                            icon={<StraightenIcon />} 
                            label={`Size: ${item.print_specs || 'Default'}`} 
                            size="small" 
                            variant="outlined"
                          />
                        </Box>
                        
                        {/* Inventory status with progress bar */}
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" fontWeight="500" sx={{ mb: 0.5 }}>
                            Inventory Status: 
                            <Chip 
                              label={getInventoryStatus(item).label} 
                              size="small" 
                              color={getInventoryStatus(item).color}
                              sx={{ ml: 1 }}
                            />
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={Math.min(100, (item.inventory / item.reorder_at) * 20)} 
                            color={getInventoryStatus(item).color}
                            sx={{ height: 8, borderRadius: 1 }}
                          />
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            mt: 0.5
                          }}>
                            <Typography variant="caption">
                              Current: {item.inventory}
                            </Typography>
                            <Typography variant="caption">
                              Reorder at: {item.reorder_at}
                            </Typography>
                          </Box>
                        </Box>
                        
                        {/* Production status indicators */}
                        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          <Chip 
                            icon={item.completed ? <CheckCircleIcon /> : <TimerIcon />}
                            label={item.completed ? 'Completed' : 'Not Completed'} 
                            color={item.completed ? 'success' : 'default'}
                            size="small"
                          />
                          <Chip 
                            icon={item.printed ? <CheckCircleIcon /> : <PrintIcon />}
                            label={item.printed ? 'Printed' : 'Not Printed'} 
                            color={item.printed ? 'success' : 'default'}
                            size="small"
                          />
                          {item.defective > 0 && (
                            <Chip 
                              icon={<ErrorIcon />}
                              label={`Defective: ${item.defective}`} 
                              color="error"
                              size="small"
                            />
                          )}
                          {item.reprint && (
                            <Chip 
                              icon={<RepeatIcon />}
                              label="Reprint Required" 
                              color="warning"
                              size="small"
                            />
                          )}
                        </Box>
                        
                        {/* Technical details expandable section */}
                        <Box sx={{ mt: 2 }}>
                          <Box 
                            onClick={() => toggleItemExpand(index)}
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center',
                              cursor: 'pointer'
                            }}
                          >
                            <Typography 
                              variant="body2" 
                              color="primary"
                              sx={{ 
                                display: 'flex', 
                                alignItems: 'center',
                              }}
                            >
                              {expandedItems[index] ? 'Hide Technical Details' : 'View Technical Details'}
                              {expandedItems[index] ? 
                                <KeyboardArrowUpIcon fontSize="small" /> : 
                                <KeyboardArrowDownIcon fontSize="small" />
                              }
                            </Typography>
                          </Box>
                          
                          <Collapse in={expandedItems[index]}>
                            <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(0,0,0,0.01)', borderRadius: 1 }}>
                              <Grid container spacing={2}>
                                {/* First column of technical details */}
                                <Grid item xs={12} md={6}>
                                  <Typography variant="subtitle2" gutterBottom>
                                    <BuildIcon sx={{ mr: 0.5, fontSize: '1rem', verticalAlign: 'text-bottom' }} />
                                    Product Specifications
                                  </Typography>
                                  <List dense disablePadding>
                                    <ListItem disableGutters>
                                      <ListItemIcon sx={{ minWidth: 36 }}>
                                        <QrCodeIcon fontSize="small" />
                                      </ListItemIcon>
                                      <ListItemText 
                                        primary="SKU / Blank" 
                                        secondary={`${item.sku} / ${item.blank}`} 
                                        primaryTypographyProps={{variant: 'body2'}}
                                      />
                                    </ListItem>
                                    <ListItem disableGutters>
                                      <ListItemIcon sx={{ minWidth: 36 }}>
                                        <DevicesIcon fontSize="small" />
                                      </ListItemIcon>
                                      <ListItemText 
                                        primary="Type / Item Type" 
                                        secondary={`${item.type} / ${item.item_type}`} 
                                        primaryTypographyProps={{variant: 'body2'}}
                                      />
                                    </ListItem>
                                    <ListItem disableGutters>
                                      <ListItemIcon sx={{ minWidth: 36 }}>
                                        <StraightenIcon fontSize="small" />
                                      </ListItemIcon>
                                      <ListItemText 
                                        primary="Print Specifications" 
                                        secondary={item.print_specs} 
                                        primaryTypographyProps={{variant: 'body2'}}
                                      />
                                    </ListItem>
                                    <ListItem disableGutters>
                                      <ListItemIcon sx={{ minWidth: 36 }}>
                                        <MemoryIcon fontSize="small" />
                                      </ListItemIcon>
                                      <ListItemText 
                                        primary="Transform Type / Sort Number" 
                                        secondary={`${item.art_transform_type} / ${item.sort_number}`} 
                                        primaryTypographyProps={{variant: 'body2'}}
                                      />
                                    </ListItem>
                                  </List>
                                </Grid>
                                
                                {/* Second column with artwork links */}
                                <Grid item xs={12} md={6}>
                                  <Typography variant="subtitle2" gutterBottom>
                                    <ArtTrackIcon sx={{ mr: 0.5, fontSize: '1rem', verticalAlign: 'text-bottom' }} />
                                    Artwork & Resources
                                  </Typography>
                                  
                                  {/* Simplified Resources Gallery */}
                                  <Box sx={{ 
                                    display: 'flex', 
                                    flexWrap: 'wrap', 
                                    gap: 1.5,
                                    mt: 1
                                  }}>
                                    {/* Artwork Preview */}
                                    {item.artwork && (
                                      <Card 
                                        variant="outlined" 
                                        sx={{ 
                                          width: 100, 
                                          height: 100, 
                                          position: 'relative',
                                          overflow: 'hidden',
                                          '&:hover': {
                                            boxShadow: '0 0 0 2px #3a86ff',
                                            '& .overlay': { opacity: 1 }
                                          }
                                        }}
                                        onClick={() => window.open(item.artwork, '_blank')}
                                      >
                                        <Box 
                                          component="img"
                                          loading="lazy"
                                          src={item.artwork}
                                          alt="Artwork"
                                          sx={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                          }}
                                        />
                                        <Box 
                                          className="overlay"
                                          sx={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            right: 0,
                                            bgcolor: 'rgba(0,0,0,0.7)',
                                            color: 'white',
                                            p: 0.5,
                                            fontSize: '0.7rem',
                                            textAlign: 'center',
                                            opacity: 0,
                                            transition: 'opacity 0.2s ease'
                                          }}
                                        >
                                          Artwork
                                        </Box>
                                      </Card>
                                    )}
                                    
                                    {/* Thumbnail Preview */}
                                    {item.thumbnail_url && (
                                      <Card 
                                        variant="outlined" 
                                        sx={{ 
                                          width: 100, 
                                          height: 100, 
                                          position: 'relative',
                                          overflow: 'hidden',
                                          '&:hover': {
                                            boxShadow: '0 0 0 2px #3a86ff',
                                            '& .overlay': { opacity: 1 }
                                          }
                                        }}
                                        onClick={() => window.open(item.thumbnail_url, '_blank')}
                                      >
                                        <Box 
                                          component="img"
                                          loading="lazy"
                                          src={item.thumbnail_url}
                                          alt="Thumbnail"
                                          sx={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                          }}
                                        />
                                        <Box 
                                          className="overlay"
                                          sx={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            right: 0,
                                            bgcolor: 'rgba(0,0,0,0.7)',
                                            color: 'white',
                                            p: 0.5,
                                            fontSize: '0.7rem',
                                            textAlign: 'center',
                                            opacity: 0,
                                            transition: 'opacity 0.2s ease'
                                          }}
                                        >
                                          Thumbnail
                                        </Box>
                                      </Card>
                                    )}
                                    
                                    {/* QC Template Preview */}
                                    {item.qc_template && (
                                      <Card 
                                        variant="outlined" 
                                        sx={{ 
                                          width: 100, 
                                          height: 100, 
                                          position: 'relative',
                                          overflow: 'hidden',
                                          '&:hover': {
                                            boxShadow: '0 0 0 2px #3a86ff',
                                            '& .overlay': { opacity: 1 }
                                          }
                                        }}
                                        onClick={() => window.open(item.qc_template, '_blank')}
                                      >
                                        <Box 
                                          component="img"
                                          loading="lazy"
                                          src={item.qc_template}
                                          alt="QC Template"
                                          sx={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                          }}
                                        />
                                        <Box 
                                          className="overlay"
                                          sx={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            right: 0,
                                            bgcolor: 'rgba(0,0,0,0.7)',
                                            color: 'white',
                                            p: 0.5,
                                            fontSize: '0.7rem',
                                            textAlign: 'center',
                                            opacity: 0,
                                            transition: 'opacity 0.2s ease'
                                          }}
                                        >
                                          QC Template
                                        </Box>
                                      </Card>
                                    )}
                                    
                                    {/* Fallback if no resources */}
                                    {!item.artwork && !item.thumbnail_url && !item.qc_template && (
                                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                        No resources available
                                      </Typography>
                                    )}
                                  </Box>
                                  
                                  {/* Download All Button (only show if there are resources) */}
                                  {(item.artwork || item.thumbnail_url || item.qc_template) && (
                                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                      <Button 
                                        variant="contained" 
                                        color="primary"
                                        startIcon={<ViewInArIcon />}
                                        onClick={() => handleViewIn3D(item)}
                                      >
                                        View in 3D
                                      </Button>
                                    </Box>
                                  )}
                                </Grid>
                              </Grid>
                            </Box>
                          </Collapse>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
          </Box>
          
          {/* Shipping information */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" fontWeight="500" gutterBottom>
              <LocalShippingIcon sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
              Shipping Details
            </Typography>
            
            <Grid container spacing={3}>
              {orderData.ship_to && (
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom>Ship To:</Typography>
                      <Typography variant="body1" fontWeight="600">{orderData.ship_to.name}</Typography>
                      <Typography variant="body2">{orderData.ship_to.address_line_1}</Typography>
                      {orderData.ship_to.address_line_2 && (
                        <Typography variant="body2">{orderData.ship_to.address_line_2}</Typography>
                      )}
                      <Typography variant="body2">
                        {orderData.ship_to.city}, {orderData.ship_to.state_or_region} {orderData.ship_to.postal_code}
                      </Typography>
                      <Typography variant="body2">{orderData.ship_to.country_code}</Typography>
                      
                      <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                        {orderData.ship_to.phone && (
                          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                            <PhoneIcon fontSize="small" sx={{ mr: 1 }} />
                            {orderData.ship_to.phone}
                          </Typography>
                        )}
                        {orderData.ship_to.email && (
                          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                            <EmailIcon fontSize="small" sx={{ mr: 1 }} />
                            {orderData.ship_to.email}
                          </Typography>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )}
              
              {orderData.return_to && (
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom>Return To:</Typography>
                      <Typography variant="body1" fontWeight="600">{orderData.return_to.name}</Typography>
                      <Typography variant="body2">{orderData.return_to.address_line_1}</Typography>
                      {orderData.return_to.address_line_2 && (
                        <Typography variant="body2">{orderData.return_to.address_line_2}</Typography>
                      )}
                      <Typography variant="body2">
                        {orderData.return_to.city}, {orderData.return_to.state_or_region} {orderData.return_to.postal_code}
                      </Typography>
                      <Typography variant="body2">{orderData.return_to.country_code}</Typography>
                      
                      <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                        {orderData.return_to.phone && (
                          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                            <PhoneIcon fontSize="small" sx={{ mr: 1 }} />
                            {orderData.return_to.phone}
                          </Typography>
                        )}
                        {orderData.return_to.email && (
                          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                            <EmailIcon fontSize="small" sx={{ mr: 1 }} />
                            {orderData.return_to.email}
                          </Typography>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          </Box>
          
          {/* Order notes section */}
          {orderData.notes && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" fontWeight="500" gutterBottom>
                <InfoIcon sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
                Order Notes
              </Typography>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="body1">{orderData.notes}</Typography>
                </CardContent>
              </Card>
            </Box>
          )}
          
          {/* Packing slip information */}
          {orderData.enable_packing_slip && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" fontWeight="500" gutterBottom>
                <ReceiptIcon sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
                Packing Slip Information
              </Typography>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>Packing Slip Message:</Typography>
                  <Typography variant="body1" sx={{ fontStyle: 'italic', pl: 2, borderLeft: '3px solid', borderColor: 'primary.light', py: 1 }}>
                    "{orderData.packing_slip_text}"
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
};

export default OrderDashboard;