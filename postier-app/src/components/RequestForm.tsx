import { useState } from 'react';
import { Button, Select, TextField, Flex, Box, Text, IconButton } from '@radix-ui/themes';
import { HttpMethod, ContentType, Header, RequestData } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface RequestFormProps {
  onSubmit: (requestData: RequestData) => void;
  isLoading: boolean;
}

export default function RequestForm({ onSubmit, isLoading }: RequestFormProps) {
  const [url, setUrl] = useState<string>('');
  const [method, setMethod] = useState<HttpMethod>('GET');
  const [headers, setHeaders] = useState<Header[]>([
    { key: '', value: '', enabled: true }
  ]);
  const [body, setBody] = useState<string>('');
  const [contentType, setContentType] = useState<ContentType>('json');

  const handleAddHeader = () => {
    setHeaders([...headers, { key: '', value: '', enabled: true }]);
  };

  const handleRemoveHeader = (index: number) => {
    const newHeaders = [...headers];
    newHeaders.splice(index, 1);
    setHeaders(newHeaders);
  };

  const handleHeaderChange = (index: number, field: keyof Header, value: string | boolean) => {
    const newHeaders = [...headers];
    newHeaders[index] = { ...newHeaders[index], [field]: value };
    setHeaders(newHeaders);
  };

  const handleSubmit = () => {
    const requestData: RequestData = {
      id: uuidv4(),
      url,
      method,
      headers: headers.filter(h => h.key && h.value),
      body,
      contentType,
    };
    onSubmit(requestData);
  };

  return (
    <Box className="request-form">
      <Flex gap="2" align="center" className="url-input-container">
        <Select.Root value={method} onValueChange={(value) => setMethod(value as HttpMethod)}>
          <Select.Trigger />
          <Select.Content>
            <Select.Item value="GET">GET</Select.Item>
            <Select.Item value="POST">POST</Select.Item>
            <Select.Item value="PUT">PUT</Select.Item>
            <Select.Item value="DELETE">DELETE</Select.Item>
            <Select.Item value="PATCH">PATCH</Select.Item>
            <Select.Item value="HEAD">HEAD</Select.Item>
            <Select.Item value="OPTIONS">OPTIONS</Select.Item>
          </Select.Content>
        </Select.Root>
        
        <TextField.Root style={{ flex: 1 }}>
          <TextField.Input 
            placeholder="Enter URL" 
            value={url} 
            onChange={(e) => setUrl(e.target.value)}
          />
        </TextField.Root>
        
        <Button 
          onClick={handleSubmit} 
          disabled={!url || isLoading}
        >
          {isLoading ? 'Sending...' : 'Send'}
        </Button>
      </Flex>

      <Box>
        <Text as="p" size="2" weight="bold" mb="2">Headers</Text>
        <Flex direction="column" gap="2" className="headers-list">
          {headers.map((header, index) => (
            <Flex key={index} gap="2" align="center" className="header-item">
              <TextField.Root>
                <TextField.Input
                  placeholder="Header name"
                  value={header.key}
                  onChange={(e) => handleHeaderChange(index, 'key', e.target.value)}
                />
              </TextField.Root>
              <TextField.Root>
                <TextField.Input
                  placeholder="Value"
                  value={header.value}
                  onChange={(e) => handleHeaderChange(index, 'value', e.target.value)}
                />
              </TextField.Root>
              <IconButton 
                variant="soft" 
                color="red" 
                onClick={() => handleRemoveHeader(index)}
              >
                ✕
              </IconButton>
            </Flex>
          ))}
          <Button variant="soft" onClick={handleAddHeader}>
            Add Header
          </Button>
        </Flex>
      </Box>

      {method !== 'GET' && method !== 'HEAD' && (
        <Box>
          <Flex justify="between" align="center" mb="2">
            <Text as="p" size="2" weight="bold">Request Body</Text>
            <Select.Root value={contentType} onValueChange={(value) => setContentType(value as ContentType)}>
              <Select.Trigger />
              <Select.Content>
                <Select.Item value="json">JSON</Select.Item>
                <Select.Item value="text">Text</Select.Item>
                <Select.Item value="form-data">Form Data</Select.Item>
                <Select.Item value="javascript">JavaScript</Select.Item>
                <Select.Item value="html">HTML</Select.Item>
                <Select.Item value="xml">XML</Select.Item>
                <Select.Item value="none">None</Select.Item>
              </Select.Content>
            </Select.Root>
          </Flex>
          <TextField.Root>
            <TextField.Input /* todo: replace with textarea */
              placeholder={`Enter ${contentType} body`}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              style={{ minHeight: '150px' }}
            />
          </TextField.Root>
        </Box>
      )}
    </Box>
  );
} 