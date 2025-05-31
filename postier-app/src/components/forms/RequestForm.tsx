import {Box, Button, Container, Flex, Section, Select, Tabs, TextField} from '@radix-ui/themes';
import KeyValueForm from './KeyValueForm.tsx';
import BodyForm from './BodyForm.tsx';
import {
  ContentType,
  HttpMethod,
  httpMethods,
  KeyValue,
  PostierObjectWithMetrics,
  RequestData
} from '../../types/types.ts';
import {HttpMethodColorCustom, HttpMethodColorRadixUI} from '../../services/formatter.ts';
import {useEffect, useRef, useState} from 'react';
import {FilePlusIcon, PaperPlaneIcon} from '@radix-ui/react-icons';

interface RequestFormProps {
  onSubmit: (requestData: RequestData) => void;
  requestData: PostierObjectWithMetrics;
  setRequestData: (key: keyof RequestData, value: any, id: string) => void;
  isLoading: boolean;
}

export default function RequestForm({ onSubmit, isLoading, requestData, setRequestData }: RequestFormProps) {
  const urlInputRef = useRef<HTMLInputElement>(null);
  const [tabs, setTabs] = useState<string>('query');

  /**
   * build the string for the query and return it
   * @return string
   */
  function buildQueryString(): string {
    if (requestData.request.query && requestData.request.query.length > 0) {
      let prefix = '';

      // set the question mark if needed
      if (!requestData.request.url.endsWith('?')) prefix = '?';

      // if the user have already set a query just add the other
      const queryPattern = /\?(.+=.+)+&?/;
      const hasQuery = queryPattern.test(requestData.request.url);
      if (hasQuery && !requestData.request.url.endsWith('&')) prefix = '&';

      return `${prefix}`.concat(
        requestData.request.query
          .filter(item => item.enabled && item.key && item.value)
          .map(item => `${encodeURIComponent(item.key)}=${encodeURIComponent(item.value)}`)
          .join('&')
      );
    }
    return '';
  }

  /**
   * add the protocol in the url if it's not given by the user
   * /!\ atm just support https
   * @return string
   */
  function safeUrl(): string {
    if (requestData.request?.url) {
      const httpPattern = /^https?:\/\//;
      const localhostPattern = /^localhost/;
      const ip4Pattern = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      const ip6Pattern = /^((?:[A-Fa-f0-9]{1,4}:){7}[A-Fa-f0-9]{1,4}|(?:[A-Fa-f0-9]{1,4}:){1,7}:|(?:[A-Fa-f0-9]{1,4}:){1,6}:[A-Fa-f0-9]{1,4}|(?:[A-Fa-f0-9]{1,4}:){1,5}(?::[A-Fa-f0-9]{1,4}){1,2}|(?:[A-Fa-f0-9]{1,4}:){1,4}(?::[A-Fa-f0-9]{1,4}){1,3}|(?:[A-Fa-f0-9]{1,4}:){1,3}(?::[A-Fa-f0-9]{1,4}){1,4}|(?:[A-Fa-f0-9]{1,4}:){1,2}(?::[A-Fa-f0-9]{1,4}){1,5}|[A-Fa-f0-9]{1,4}:(?::[A-Fa-f0-9]{1,4}){1,6}|:(?:(?::[A-Fa-f0-9]{1,4}){1,7}|:)|fe80:(?::[A-Fa-f0-9]{0,4}){0,4}%[0-9a-zA-Z]+|::(ffff(?::0{1,4})?:)?(?:[0-9]{1,3}\.){3}[0-9]{1,3}|(?:[A-Fa-f0-9]{1,4}:){1,4}:(?:[0-9]{1,3}\.){3}[0-9]{1,3})$/;

      const hasHttp = httpPattern.test(requestData.request.url);
      const isLocal = localhostPattern.test(requestData.request.url);
      const isIPV4 = ip4Pattern.test(requestData.request.url);
      const isIPV6 = ip6Pattern.test(requestData.request.url);

      if (hasHttp) return requestData.request.url;
      if (isIPV4 || isIPV6 || isLocal) return `http://${requestData.request.url}`;
      return `https://${requestData.request.url}`;
    }
    return '';
  }

  /**
   * submit the request
   * @return void
   */
  function handleSubmit(): void {
    // in case the value is empty
    if (!requestData.request.contentType) requestData.request.contentType = 'none';
    onSubmit({
      ...requestData.request,
      composedUrl: `${safeUrl()}${buildQueryString()}`,
      timestamp: Date.now()
    });
  }

  /**
   * handle the enter key press for the url input
   * @param e KeyboardEvent
   */
  function handleKeyPress(e: KeyboardEvent): void {
    if (isLoading || !requestData.request?.url) return;
    if (e.key === 'Enter') handleSubmit();
  }

  /**
   * you give a KeyValue array and the function give you the total of complete elements
   * @param array
   */
  function countNotEmptyArrayValue(array: KeyValue[] | null): number {
    if (!array) return 0;
    return array.filter((p) => p.value !== '' && p.key !== '').length;
  }

  /**
   * return true if the array contain more than 0 complete value
   * @param query
   */
  function oneOrMoreKeyValueIsValid(query: KeyValue[] | null): boolean {
    if (!query) return false;
    return countNotEmptyArrayValue(query) > 0;
  }

  /**
   * set add / remove EventListener for the input keypress
   */
  useEffect(() => {
    if (urlInputRef && urlInputRef.current) urlInputRef.current.addEventListener('keypress', handleKeyPress);
    return () => {
      if (urlInputRef && urlInputRef.current) urlInputRef.current.removeEventListener('keypress', handleKeyPress);
    }
  }, [requestData]);

  useEffect(() => {
    console.log('xxxxxxxx');
  }, []);

  return (
    <Container>
      <Section size='1' style={{paddingTop: 12}}>
        <Flex gap='2' justify='between' align='center'>
          <Select.Root value={requestData.request?.method} onValueChange={(value) => setRequestData('method', value as HttpMethod, requestData.request.id)}>
            <Select.Trigger color={HttpMethodColorRadixUI(requestData.request?.method ?? 'GET')} variant='soft' />
            <Select.Content position='popper' variant='soft'>
              {httpMethods.map((e, i) => (
                <Select.Item style={{ color: HttpMethodColorCustom(e) }} value={e} key={`${i}${e}`}>{e}</Select.Item>
              ))}
            </Select.Content>
          </Select.Root>

          <TextField.Root
            ref={urlInputRef}
            placeholder='Enter URL'
            value={requestData.request?.url}
            className='fw'
            onChange={(e) => setRequestData('url', e.target.value, requestData.request.id)}
          />

          <Button onClick={handleSubmit} disabled={!requestData.request?.url || isLoading} loading={isLoading}>
            <PaperPlaneIcon/> Send
          </Button>
        </Flex>
      </Section>

      <Section size='1' pt='0'>
        <Tabs.Root defaultValue='query' value={tabs} onValueChange={(v) => setTabs(v)}>
          <Tabs.List>
            <Tabs.Trigger value='query'>
              Query
              <span style={{color: 'var(--green-a9)', paddingLeft: 5, display: oneOrMoreKeyValueIsValid(requestData.request.query) ? '' : 'none'}}>
                {countNotEmptyArrayValue(requestData.request.query)}
              </span>
            </Tabs.Trigger>
            <Tabs.Trigger value='header'>
              Header
              <span style={{color: 'var(--green-a9)', paddingLeft: 5, display: oneOrMoreKeyValueIsValid(requestData.request.headers) ? '' : 'none'}}>
                {countNotEmptyArrayValue(requestData.request.headers)}
              </span>
            </Tabs.Trigger>
            <Tabs.Trigger value='body'>
              Body
              <FilePlusIcon color='var(--green-a9)' style={{paddingLeft: 5, display: requestData.request.body ? '' : 'none'}} />
            </Tabs.Trigger>
          </Tabs.List>

          <Box>
            <Tabs.Content value='query'>
              <KeyValueForm
                setKeyValues={(data: KeyValue[]): void => setRequestData('query', data, requestData.request.id)}
                getKeyValues={requestData.request?.query ?? null}
                title='Query'
              />
            </Tabs.Content>

            <Tabs.Content value='header'>
              <KeyValueForm
                setKeyValues={(data: KeyValue[]): void => setRequestData('headers', data, requestData.request.id)}
                getKeyValues={requestData.request?.headers ?? null}
                title='Header'
              />
            </Tabs.Content>

            <Tabs.Content value='body'>
              <BodyForm
                getBody={(data: string): void => setRequestData('body', data, requestData.request.id)}
                getContentType={(data: ContentType): void => setRequestData('contentType', data, requestData.request.id)}
                setBody={requestData.request?.body ?? null}
                setContentType={requestData.request?.contentType ?? null}
              />
            </Tabs.Content>
          </Box>
        </Tabs.Root>
      </Section>
    </Container>
  );
}
