import { useState } from 'react';
import {Tabs, Box, Text, Flex, Badge, Section} from '@radix-ui/themes';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json';
import xml from 'react-syntax-highlighter/dist/esm/languages/hljs/xml';
import javascript from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import html from 'react-syntax-highlighter/dist/esm/languages/hljs/htmlbars';
import atomOneDark from 'react-syntax-highlighter/dist/esm/styles/hljs/atom-one-dark';

import { ResponseData, ViewMode } from '../types';
import { 
  detectContentType, 
  formatData, 
  getLanguageForSyntaxHighlighting, 
  formatHeadersForDisplay,
  getStatusColor
} from '../utils/formatter';

// Register languages
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('xml', xml);
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('htmlbars', html);

interface ResponseViewerProps {
  response: ResponseData | null;
}

export default function ResponseViewer({ response }: ResponseViewerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('pretty');

  if (!response) {
    response = {
      data: "Send a request to see the response here.",
      headers: {},
      size: 0,
      status: 0,
      statusText: "",
      time: 0,
    }
  }

  const contentType = detectContentType(response.data);
  const formattedData = formatData(response.data, viewMode, contentType);
  const language = getLanguageForSyntaxHighlighting(contentType);
  const statusColor = getStatusColor(response.status);
  const headers = formatHeadersForDisplay(response.headers);

  return (
    <Section size="1" pt="0">
      <Flex gap="2" mb="4" align="center">
        <Badge color={statusColor as any /* todo: fix me */} size="2">
          {response.status} {response.statusText}
        </Badge>
        <Text size="1" color="gray">
          {Math.round(response.time)}ms | {Math.round(response.size / 1024)}KB
        </Text>
      </Flex>

      <Tabs.Root defaultValue="response">
        <Tabs.List>
          <Tabs.Trigger value="response">Response</Tabs.Trigger>
          <Tabs.Trigger value="headers">Headers</Tabs.Trigger>
        </Tabs.List>
        
        <Tabs.Content value="response">
          <Flex gap="2" mb="2" mt="2">
            <Tabs.Root value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
              <Tabs.List>
                <Tabs.Trigger value="pretty">Pretty</Tabs.Trigger>
                <Tabs.Trigger value="raw">Raw</Tabs.Trigger>
                <Tabs.Trigger value="preview">Preview</Tabs.Trigger>
              </Tabs.List>
            </Tabs.Root>
          </Flex>
          
          {viewMode === 'pretty' ? (
            <Box style={{ maxHeight: '500px', overflow: 'auto' }}>
              <SyntaxHighlighter 
                language={language} 
                style={atomOneDark}
                customStyle={{ 
                  borderRadius: '6px',
                  margin: 0,
                  padding: '16px'
                }}
              >
                {formattedData}
              </SyntaxHighlighter>
            </Box>
          ) : viewMode === 'raw' ? (
            <Box 
              style={{ 
                maxHeight: '500px', 
                overflow: 'auto',
                whiteSpace: 'pre-wrap',
                fontFamily: 'monospace',
                padding: '16px',
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                borderRadius: '6px'
              }}
            >
              {formattedData}
            </Box>
          ) : (
            <Box 
              style={{ 
                maxHeight: '500px', 
                overflow: 'auto',
                padding: '16px',
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                borderRadius: '6px'
              }}
            >
              {contentType === 'html' ? (
                <div dangerouslySetInnerHTML={{ __html: formattedData }} />
              ) : (
                formattedData
              )}
            </Box>
          )}
        </Tabs.Content>
        
        <Tabs.Content value="headers">
          <Box style={{ maxHeight: '500px', overflow: 'auto' }}>
            <Flex direction="column" gap="2" mt="2">
              {headers.map((header, index) => (
                <Flex key={index} gap="2">
                  <Text as="span" weight="bold" size="2">{header.key}:</Text>
                  <Text as="span" size="2">{header.value}</Text>
                </Flex>
              ))}
            </Flex>
          </Box>
        </Tabs.Content>
      </Tabs.Root>
    </Section>
  );
} 