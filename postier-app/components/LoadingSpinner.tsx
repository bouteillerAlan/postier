import React from 'react';
import { Box, Text } from '@radix-ui/themes';

const LoadingSpinner: React.FC = () => {
  return (
    <Box className="loading-container" style={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center',
      height: '100%',
      gap: '1rem'
    }}>
      <div className="spinner"></div>
      <Text size="2" color="gray">Loading response...</Text>
    </Box>
  );
};

export default LoadingSpinner; 