import {useEffect, useRef, useState} from 'react';
import {Tabs, Box, Text, Flex, Badge, Section, Table, Card, Tooltip, Separator} from '@radix-ui/themes';
import {KeyValue, ResponseData, ViewMode} from '../types/types.ts';
import {detectContentType, formatData, getStatusColor} from '../services/formatter';
import { Highlight, themes} from "prism-react-renderer";

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
  const [viewMode, setViewMode] = useState<ViewMode>('pretty');
  const [responseCodeHeight, setResponseCodeHeight] = useState<number>(0);
  const [responseDataHeight, setResponseDataHeight] = useState<number>(0);

  /**
   * get the value of the language contain in the Content-Type header
   * @return string
   */
  function getCTheader(): string {
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

  /**
   * calculate the height for each of the view element
   * @return void
   */
  function calculateResponseViewHeight(): void {
    if (subMenuRef && subMenuRef.current) {
      const rect = subMenuRef.current.getBoundingClientRect();
      // rect.bottom = size from the top of the window to the bottom of the "pretty/raw/preview" sub tab menu
      // 30 & 20 is the size of the remaining padding and margin
      const wh = window.innerHeight - rect.bottom;
      setResponseCodeHeight(wh - 30);
      setResponseDataHeight((wh - 20) + rect.height);
    }
  }

  useEffect(() => {
    window.addEventListener('resize', calculateResponseViewHeight);
    calculateResponseViewHeight();
    return () => {
      window.removeEventListener('resize', calculateResponseViewHeight);
    };
  }, []);

  return (
    <Section size="1" p="0">
      <Flex gap="2" mb="4" align="center">
        <Badge color={statusColor} size="2">
          {response.status} {response.statusText}
        </Badge>
        <Tooltip content="What time take the fetch (rounded)">
          <Text size="1" color="gray">
            {Math.round(response.time)}ms
          </Text>
        </Tooltip>
        <Separator orientation='vertical'/>
        <Tooltip content="Size of the body mesured from the blob (rounded)">
          <Text size="1" color="gray">
            {Math.round(response.size / 1024)}KB
          </Text>
        </Tooltip>
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
                maxHeight: responseCodeHeight,
                overflow: 'auto'
              }}
            >
              <Card style={{overflowX: 'auto', overflowY: 'auto', minWidth: 'fit-content', padding: 0}}>
                <Highlight
                  theme={themes.duotoneDark}
                  code={formattedData}
                  language={ctheader}
                >
                  {({ style, tokens, getLineProps, getTokenProps }) => (
                    <div style={{...style, backgroundColor: 'var(--gray-surface)', padding: 10}}>
                      <pre style={{...style, backgroundColor: 'none', margin: 0}}>
                      {tokens.map((line, i) => (
                        <div key={i} {...getLineProps({ line })}>
                          {line.map((token, key) => (
                            <span key={key} {...getTokenProps({ token })} />
                          ))}
                        </div>
                      ))}
                    </pre>
                    </div>
                  )}
                </Highlight>
              </Card>
            </Box>
          ) : viewMode === 'raw' ? (
            <Card
              style={{
                maxHeight: responseCodeHeight,
                overflow: 'auto',
                padding: '16px',
                backgroundColor: 'var(--gray-surface)',
              }}
            >
              {formattedData}
            </Card>
          ) : (
            <Card
              style={{
                height: responseCodeHeight,
                padding: '16px',
                backgroundColor: 'var(--gray-surface)',
              }}
            >
              {contentType === 'html' ? (
                <iframe srcDoc={formattedData} height='100%' width='100%'/>
              ) : (
                formattedData
              )}
            </Card>
          )}
        </Tabs.Content>

        <Tabs.Content value="headers">
          <Section p="0" style={{ height: responseDataHeight, overflow: 'auto' }}>
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
          <Section p="0" style={{ height: responseDataHeight, overflow: 'auto' }}>
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