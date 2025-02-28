import React from 'react';
import { Box, Tabs, Text } from '@radix-ui/themes';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json';
import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import LoadingSpinner from './LoadingSpinner';

SyntaxHighlighter.registerLanguage('json', json);

interface ResponsePanelProps {
  response: any;
  error: Error | null;
  isLoading: boolean;
}

const ResponsePanel: React.FC<ResponsePanelProps> = ({ response, error, isLoading }) => {
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <Box className="error-container" p="4">
        <Text color="red" size="2">
          Error: {error.message}
        </Text>
      </Box>
    );
  }

  if (!response) {
    return (
      <Box className="empty-state" p="4">
        <Text color="gray">Send a request to see the response</Text>
      </Box>
    );
  }

  return (
    <Box className="response-container">
      <Box className="status-bar" p="2">
        <Text>Status: {response.status} {response.statusText}</Text>
      </Box>

      <Tabs.Root defaultValue="response">
        <Tabs.List>
          <Tabs.Trigger value="response">Response</Tabs.Trigger>
          <Tabs.Trigger value="headers">Headers</Tabs.Trigger>
        </Tabs.List>

        <Box p="4">
          <Tabs.Content value="response">
            <SyntaxHighlighter 
              language="json" 
              style={vs2015}
              customStyle={{ 
                margin: 0,
                borderRadius: '6px',
              }}
            >
              {JSON.stringify(response.data, null, 2)}
            </SyntaxHighlighter>
          </Tabs.Content>

          <Tabs.Content value="headers">
            <SyntaxHighlighter 
              language="json" 
              style={vs2015}
              customStyle={{ 
                margin: 0,
                borderRadius: '6px',
              }}
            >
              {JSON.stringify(response.headers, null, 2)}
            </SyntaxHighlighter>
          </Tabs.Content>
        </Box>
      </Tabs.Root>
    </Box>
  );
};

export default ResponsePanel; 