import React, {Fragment, useEffect, useRef, useState} from 'react';
import {
  Badge,
  Box,
  DataList,
  Flex,
  HoverCard,
  Link,
  ScrollArea,
  Section,
  Separator,
  Table,
  Tabs,
  Text,
  Tooltip
} from '@radix-ui/themes';
import {HttpMetricsWErr, KeyValue, ResponseData, UserSetting, ViewMode} from '../../types/types.ts';
import {detectContentType, formatData, getStatusColor} from '../../services/formatter.ts';
import {themes} from 'prism-react-renderer';
import {CheckCircledIcon, CircleIcon, CrossCircledIcon} from '@radix-ui/react-icons';
import RawResponse from './Raw.tsx';
import PreviewResponse from './Preview.tsx';
import PrettyResponse from './Pretty.tsx';
import {Loading} from "../ui/Loading.tsx";

interface ResponseViewerProps {
  isLoading: boolean;
  response: ResponseData | null;
  debug: KeyValue[] | [];
  metrics: HttpMetricsWErr | undefined;
  userConfig: UserSetting;
}

export default function ResponseViewer(props: ResponseViewerProps) {

  const response = props.response ?? {
    data: 'Send a request to see the response here.',
    headers: null,
    size: 0,
    status: 0,
    statusText: '',
    time: 0,
    id: 0
  };
  const [viewMode, setViewMode] = useState<ViewMode>('raw');
  const [responseCodeHeight, setResponseCodeHeight] = useState<number>(0);
  const [responseDataHeight, setResponseDataHeight] = useState<number>(0);
  const bgColors = ['var(--ruby-3)', 'var(--orange-3)', 'var(--yellow-3)', 'var(--cyan-3)', 'var(--jade-3)'];
  const bColors = ['var(--ruby-6)', 'var(--orange-6)', 'var(--yellow-6)', 'var(--cyan-6)', 'var(--jade-6)'];
  const tColors = ['var(--ruby-11)', 'var(--orange-11)', 'var(--yellow-11)', 'var(--cyan-11)', 'var(--jade-11)'];

  /**
   * get the value of the language contain in the Content-Type header
   * @return string
   */
  function getCTheader(): string | null {
    const cth = response.headers?.find((header: KeyValue) => header.key.toLowerCase() === 'content-type');
    // for example google.fr send text/html; charset=utf-8
    // and we just need the mid-part (html)
    // and some api can send something like problem+json
    // reminder: https://stackoverflow.com/questions/23714383/what-are-all-the-possible-values-for-http-content-type-header
    if (cth) {
      const possibleValue = cth.value.split(';')[0].split('/')[1];
      return possibleValue.split('').includes('+') ? possibleValue.split('+')[1] : possibleValue;
    }
    return null;
  }

  const ctheader = getCTheader() ?? detectContentType(response.data);
  let formattedData = formatData(response.data, viewMode, ctheader);
  if (formattedData === '') formattedData = 'No body returned for response';

  const statusColor = getStatusColor(response.status);
  const headers = response.headers;

  const subMenuRef = useRef<HTMLDivElement>(null);
  let errorIsPassed = false;

  /**
   * calculate the height for each of the view element
   * @return void
   */
  function calculateResponseViewHeight(): void {
    const wh = window.innerHeight;
    // if (subMenuRef && subMenuRef.current) {
    //   const rect = subMenuRef.current.getBoundingClientRect();
    //   // rect.bottom = size from the top of the window to the bottom of the 'pretty/raw/preview' sub tab menu
    //   // 30 is the size of the remaining padding and margin
    //   setResponseCodeHeight(wh - rect.bottom - 30);
    // }
    // 420, 445 is magics values
    // todo: auto calculate the value
    setResponseDataHeight(wh - 420);
    setResponseCodeHeight(wh - 445 - 30);
  }

  /**
   * generate the right icon for the network time plot
   * @param metric the current metric for which you want the icon
   * @returns React.JSX.Element
   */
  function iconNetwork(metric: [string, any]): React.JSX.Element {
    if (errorIsPassed) return <CircleIcon style={{marginLeft: 3}} color='gray'/>
    if (metric[0] === props.metrics?.on_error) {
      errorIsPassed = true;
      return <CrossCircledIcon style={{marginLeft: 3}} color='red'/>
    }
    return <CheckCircledIcon style={{marginLeft: 3}} color='green'/>
  }

  useEffect(() => {
    window.addEventListener('resize', calculateResponseViewHeight);
    calculateResponseViewHeight();
    return () => {
      window.removeEventListener('resize', calculateResponseViewHeight);
    };
  }, []);

  return (
    <Section size='1' p='0'>
      <Flex gap='2' mb='4' align='center'>
        <Badge color={statusColor} size='2'>
          {response.status}, {response.statusText ?? 'undefined status text'}
        </Badge>

        <HoverCard.Root>
		      <HoverCard.Trigger>
			      <Link href='#'>
              <Tooltip content='What time take the fetch (rounded)'>
                <Text size='1' color='gray'>
                  {Math.round(response.time)}ms
                </Text>
              </Tooltip>
            </Link>
          </HoverCard.Trigger>

          <HoverCard.Content size='1' maxWidth='500px'>
            <DataList.Root size='1'>
              <DataList.Item align='center'>
                {props.metrics && Object.entries(props.metrics).map((metric, indexA) => {
                  if (metric[0] !== 'total' && metric[0] !== 'on_error') {
                    return (
                      <Fragment key={`metrics${indexA}`}>
                      <DataList.Label style={{display: 'flex', justifyContent: 'right', color: tColors[indexA]}}>
                        {metric[0].split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} {Math.round(metric[1])}ms
                        {iconNetwork(metric)}
                      </DataList.Label>
                      <DataList.Value>
                        <Flex>
                          {props.metrics && Object.entries(props.metrics).map((metric, index) => {
                            if (metric[0] !== 'total') {
                              // percentage for each value
                              const percentage = (metric[1] / response.time) * 100;
                              // pixel for each value in comparison to the 300px max
                              const widthInPixels = (percentage / 100) * 300;
                              return (
                                <Box
                                  key={`metricSquare${index}`}
                                  height='25px'
                                  width={`${widthInPixels}px`}
                                  minWidth='5px'
                                  style={{
                                    backgroundColor: indexA === index ? bgColors[index] : 'none',
                                    border: `solid 1px ${indexA === index ? bColors[index] : 'none'}`,
                                    borderRadius: 'var(--radius-2)',
                                  }}
                                />
                              );
                            }
                          })}
                        </Flex>
                      </DataList.Value>
                      </Fragment>
                    );
                  }
                })}
              </DataList.Item>
            </DataList.Root>
          </HoverCard.Content>
        </HoverCard.Root>

        <Separator orientation='vertical'/>
        <Tooltip content='Size of the body mesured from the blob (rounded)'>
          <Text size='1' color='gray'>
            {Math.round(response.size / 1024)}KB
          </Text>
        </Tooltip>
      </Flex>

      <Tabs.Root defaultValue={'response'}>
        <Tabs.List>
          <Tabs.Trigger value='response'>Response</Tabs.Trigger>
          <Tabs.Trigger value='headers'>Headers ({headers?.length ?? 0})</Tabs.Trigger>
          <Tabs.Trigger value='debug'>Debug</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value='response'>

          <Tabs.Root ref={subMenuRef} mb='3' value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
            <Tabs.List>
              <Tabs.Trigger value='pretty'>Pretty</Tabs.Trigger>
              <Tabs.Trigger value='raw'>Raw</Tabs.Trigger>
              <Tabs.Trigger value='preview'>Preview</Tabs.Trigger>
            </Tabs.List>
          </Tabs.Root>

          {props.isLoading ?
            <Loading isLoading/> :
            viewMode === 'pretty' ?
            <PrettyResponse data={formattedData} viewHeight={responseCodeHeight} contentType={ctheader} codeTheme={themes[props.userConfig.codeTheme]} userConfig={props.userConfig}/> :
            viewMode === 'raw' ? <RawResponse data={formattedData} viewHeight={responseCodeHeight}/> :
            <PreviewResponse data={formattedData} viewHeight={responseCodeHeight} contentType={ctheader}/>
          }
        </Tabs.Content>

        <Tabs.Content value='headers'>
          {props.isLoading ?
            <Loading isLoading/> :
            <Section p='0' style={{ height: responseDataHeight, overflow: 'auto' }}>
              <ScrollArea>
                <Table.Root size='1' layout='fixed' style={{paddingRight: 10}}>
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
              </ScrollArea>
            </Section>
          }
        </Tabs.Content>

        <Tabs.Content value='debug'>
          {props.isLoading ?
            <Loading isLoading/> :
            <Section p='0' style={{ height: responseDataHeight }}>
              <ScrollArea>
                <Table.Root size='1' layout='fixed' style={{paddingRight: 10}}>
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
              </ScrollArea>
            </Section>
          }
        </Tabs.Content>

      </Tabs.Root>
    </Section>
  );
}
