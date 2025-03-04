import {useEffect, useRef, useState} from 'react';
import {Tabs, Box, Text, Flex, Badge, Section, Table, Card} from '@radix-ui/themes';
import {KeyValue, ResponseData, ViewMode} from '../types/types.ts';
import {detectContentType, formatData, getStatusColor} from '../services/formatter';
import hljs, {AutoHighlightResult} from 'highlight.js';
import 'highlight.js/styles/github.css';
import 'highlight.js/styles/atom-one-dark-reasonable.min.css';

interface ResponseViewerProps {
  response: ResponseData | null;
}

export default function ResponseViewer(props: ResponseViewerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('pretty');

  const response = props.response ?? {
    data: "Send a request to see the response here.",
    headers: null,
    size: 0,
    status: 0,
    statusText: "",
    time: 0,
    id: 0
  };

  // todo: improve contentType with the use of the content-type header
  const contentType = detectContentType(response.data);
  const formattedData = formatData(response.data, viewMode, contentType);

  const statusColor = getStatusColor(response.status);
  const headers = response.headers;

  const subMenuRef = useRef<HTMLDivElement>(null);
  let responseCodeViewHeight = '500px';
  let responseDataViewHeight = '500px';

  const calculateResponseViewHeight = () => {
    if (subMenuRef && subMenuRef.current) {
      const rect = subMenuRef.current.getBoundingClientRect();
      responseCodeViewHeight = `${window.innerHeight - rect.bottom}px`;
      responseDataViewHeight = `${window.innerHeight - rect.bottom + rect.height}px`;
    }
  }

  useEffect(() => {
    window.addEventListener('resize', calculateResponseViewHeight);
    calculateResponseViewHeight();
    return () => {
      window.removeEventListener('resize', calculateResponseViewHeight);
    };
  }, []);

  const [hljsResult, setHljsResult] = useState<AutoHighlightResult | null>(null);
  useEffect(() => {
    // only use the language a http api could return, this improves greatly the auto-detect function
    hljs.configure({
      languages: [
        'json',
        'xml',
        'html',
        'css',
        'javascript',
        'yaml'
      ]
    })
    setHljsResult(hljs.highlightAuto(formattedData))
  }, [response]);

  return (
    <Section size="1" p="0">
      <Flex gap="2" mb="4" align="center">
        <Badge color={statusColor} size="2">
          {response.status} {response.statusText}
        </Badge>
        <Text size="1" color="gray">
          {Math.round(response.time)}ms | {Math.round(response.size / 1024)}KB
        </Text>
      </Flex>

      <Tabs.Root defaultValue="response">
        <Tabs.List>
          <Tabs.Trigger value="response">Response</Tabs.Trigger>
          <Tabs.Trigger value="headers">Headers ({headers?.length ?? 0})</Tabs.Trigger>
          <Tabs.Trigger value="debug">Debug</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="response">

          <Tabs.Root ref={subMenuRef} mb="3" value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
            <Tabs.List>
              <Tabs.Trigger value="pretty">Pretty ({hljsResult?.language})</Tabs.Trigger>
              <Tabs.Trigger value="raw">Raw</Tabs.Trigger>
              <Tabs.Trigger value="preview">Preview</Tabs.Trigger>
            </Tabs.List>
          </Tabs.Root>

          {viewMode === 'pretty' ? (
            <Box
              style={{
                maxHeight: responseCodeViewHeight,
                overflow: 'auto'
            }}
            >
              <Card
                style={{overflowX: 'auto', minWidth: 'fit-content'}}
                dangerouslySetInnerHTML={{__html: `<pre><code>${hljsResult?.value ?? ''}</code></pre>`}}
              />
            </Box>
          ) : viewMode === 'raw' ? (
            <Box
              style={{
                maxHeight: responseCodeViewHeight,
                overflow: 'auto',
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
                maxHeight: responseCodeViewHeight,
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
          <Section p="0" style={{ height: responseDataViewHeight, overflow: 'auto' }}>
              <Table.Root size="1" layout="fixed">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell>Key</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Value</Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>

                <Table.Body>
                  {headers?.map((header, index) => (
                    <Table.Row key={`headers${index}`}>
                      <Table.RowHeaderCell>{header.key}</Table.RowHeaderCell>
                      <Table.Cell>{header.value}</Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
          </Section>
        </Tabs.Content>

        <Tabs.Content value="debug">
          <Section p="0" style={{ height: responseDataViewHeight, overflow: 'auto' }}>
            <Table.Root size="1" layout="fixed">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>Key</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Value</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {props.response?.debug?.map((debug: KeyValue, index: number) => (
                  <Table.Row key={`debug${index}`}>
                    <Table.RowHeaderCell>{debug.key}</Table.RowHeaderCell>
                    <Table.Cell>{debug.value}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Section>
        </Tabs.Content>

      </Tabs.Root>
    </Section>
  );
}