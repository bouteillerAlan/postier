import { ContentType, ViewMode } from '../types';

export const detectContentType = (data: any): ContentType => {
  if (!data) return 'none';
  
  if (typeof data === 'string') {
    // Check if it's JSON
    try {
      JSON.parse(data);
      return 'json';
    } catch (e) {
      // Not JSON
    }
    
    // Check if it's HTML
    if (data.trim().startsWith('<') && data.includes('</')) {
      return 'html';
    }
    
    // Check if it's XML
    if (data.trim().startsWith('<?xml') || (data.trim().startsWith('<') && data.includes('xmlns'))) {
      return 'xml';
    }
    
    // Check if it might be JavaScript
    if (data.includes('function') || data.includes('=>') || data.includes('var ') || data.includes('const ') || data.includes('let ')) {
      return 'javascript';
    }
    
    return 'text';
  }
  
  // If it's an object, it's probably JSON
  return 'json';
};

export const formatData = (data: any, viewMode: ViewMode, contentType: ContentType): string => {
  if (!data) return '';
  
  // For raw view, just stringify the data
  if (viewMode === 'raw') {
    if (typeof data === 'string') {
      return data;
    }
    return JSON.stringify(data);
  }
  
  // For pretty view, format based on content type
  if (viewMode === 'pretty') {
    if (contentType === 'json' || typeof data === 'object') {
      try {
        const jsonData = typeof data === 'string' ? JSON.parse(data) : data;
        return JSON.stringify(jsonData, null, 2);
      } catch (e) {
        return typeof data === 'string' ? data : JSON.stringify(data);
      }
    }
    
    // For other content types, just return as is
    return typeof data === 'string' ? data : JSON.stringify(data);
  }
  
  // For preview, just return as is
  return typeof data === 'string' ? data : JSON.stringify(data);
};

export const getLanguageForSyntaxHighlighting = (contentType: ContentType): string => {
  switch (contentType) {
    case 'json':
      return 'json';
    case 'html':
      return 'html';
    case 'xml':
      return 'xml';
    case 'javascript':
      return 'javascript';
    case 'text':
    case 'form-data':
    case 'none':
    default:
      return 'text';
  }
};

export const formatHeadersForDisplay = (headers: Record<string, string>): { key: string; value: string }[] => {
  return Object.entries(headers).map(([key, value]) => ({
    key,
    value: JSON.stringify(value),
  }));
};

export const getStatusColor = (status: number): string => {
  if (status >= 200 && status < 300) {
    return 'green';
  } else if (status >= 300 && status < 400) {
    return 'blue';
  } else if (status >= 400 && status < 500) {
    return 'orange';
  } else if (status >= 500) {
    return 'red';
  } else {
    return 'gray';
  }
}; 