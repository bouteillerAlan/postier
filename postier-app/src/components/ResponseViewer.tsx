import {useEffect, useMemo, useRef, useState} from 'react';
import {Tabs, Box, Text, Flex, Badge, Section, Table, Card} from '@radix-ui/themes';
import {KeyValue, ResponseData, ViewMode} from '../types/types.ts';
import {detectContentType, formatData, getStatusColor} from '../services/formatter';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark-reasonable.min.css';

interface ResponseViewerProps {
  response: ResponseData | null;
  debug: KeyValue[] | [];
}

export default function ResponseViewer(props: ResponseViewerProps) {
  const response = props.response ?? {
    data: "Send a request to see the response here.",
    headers: null,
    size: 0,
    status: 0,
    statusText: "",
    time: 0,
    id: 0
  };
  const responsePrettyMemo = useMemo(
    ()=> hljs.highlightAuto(response.data ?? 'xxxxxxx'),
    [response]
  );
  const [viewMode, setViewMode] = useState<ViewMode>('pretty');

  const getCTheader = () => {
    const cth = response.headers?.find((header: KeyValue) => header.key.toLowerCase() === 'content-type');
    // for example google.fr send text/html; charset=utf-8
    // and we just need the mid-part (html)
    // reminder: https://stackoverflow.com/questions/23714383/what-are-all-the-possible-values-for-http-content-type-header
    return cth ? cth.value.split(';')[0].split('/')[1] : '';
  }

  const ctheader = getCTheader();
  const contentType = ctheader ?? detectContentType(response.data);
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

  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    window.addEventListener('resize', calculateResponseViewHeight);
    calculateResponseViewHeight();
    return () => {
      window.removeEventListener('resize', calculateResponseViewHeight);
    };
  }, [subMenuRef, subMenuRef.current]);

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

      <Tabs.Root defaultValue={'response'}>
        <Tabs.List>
          <Tabs.Trigger value="response">Response</Tabs.Trigger>
          <Tabs.Trigger value="headers">Headers ({headers?.length ?? 0})</Tabs.Trigger>
          <Tabs.Trigger value="debug">Debug</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="response">

          <Tabs.Root ref={subMenuRef} mb="3" value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
            <Tabs.List>
              <Tabs.Trigger value="pretty">Pretty</Tabs.Trigger>
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
              <Card style={{overflowX: 'auto', minWidth: 'fit-content'}}>
                <pre><code ref={codeRef} className={ctheader} dangerouslySetInnerHTML={{__html: responsePrettyMemo.value}}></code></pre>
              </Card>
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
                <iframe srcDoc={formattedData} height={responseCodeViewHeight} width='100%'/>
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
                {props.debug.length > 0 && props.debug.map((debug: KeyValue, index: number) => (
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