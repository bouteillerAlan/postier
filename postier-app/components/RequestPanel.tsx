import React, { useState } from 'react';
import { Tabs, Box, Button, TextField, Select } from '@radix-ui/themes';
import * as Form from '@radix-ui/react-form';

interface RequestPanelProps {
  onRequest: (data: {
    url: string;
    method: string;
    headers: Record<string, string>;
    body?: any;
  }) => void;
}

const RequestPanel: React.FC<RequestPanelProps> = ({ onRequest }) => {
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState('GET');
  const [headers, setHeaders] = useState<Record<string, string>>({});
  const [body, setBody] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRequest({
      url,
      method,
      headers,
      body: method !== 'GET' ? body : undefined,
    });
  };

  return (
    <Form.Root onSubmit={handleSubmit}>
      <Box className="request-controls" p="4">
        <div className="method-url-row">
          <Select.Root value={method} onValueChange={setMethod}>
            <Select.Trigger />
            <Select.Content>
              <Select.Item value="GET">GET</Select.Item>
              <Select.Item value="POST">POST</Select.Item>
              <Select.Item value="PUT">PUT</Select.Item>
              <Select.Item value="DELETE">DELETE</Select.Item>
              <Select.Item value="PATCH">PATCH</Select.Item>
            </Select.Content>
          </Select.Root>
          <TextField.Root>
            <TextField.Input 
              placeholder="Enter URL" 
              value={url} 
              onChange={(e) => setUrl(e.target.value)}
            />
          </TextField.Root>
          <Button type="submit">Send</Button>
        </div>
      </Box>

      <Tabs.Root defaultValue="body">
        <Tabs.List>
          <Tabs.Trigger value="body">Body</Tabs.Trigger>
          <Tabs.Trigger value="headers">Headers</Tabs.Trigger>
        </Tabs.List>

        <Box p="4">
          <Tabs.Content value="body">
            <TextField.Root>
              <TextField.Input 
                placeholder="Request body (JSON)"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                disabled={method === 'GET'}
                style={{ minHeight: '200px' }}
              />
            </TextField.Root>
          </Tabs.Content>

          <Tabs.Content value="headers">
            {/* TODO: Add header input fields */}
          </Tabs.Content>
        </Box>
      </Tabs.Root>
    </Form.Root>
  );
};

export default RequestPanel; 