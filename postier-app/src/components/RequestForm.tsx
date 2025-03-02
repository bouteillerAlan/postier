import { useState } from 'react';
import {HttpMethod, RequestData, httpMethods, ContentType, KeyValue} from '../types';
import { v4 as uuidv4 } from 'uuid';
import {Box, Button, Container, Flex, Section, Select, Tabs, TextField} from '@radix-ui/themes';
import {HttpMethodColorRadixUI} from "../utils/switchStyle.ts";
import KeyValueForm from "./KeyValueForm.tsx";
import BodyForm from "./BodyForm.tsx";

interface RequestFormProps {
  onSubmit: (requestData: RequestData) => void;
  isLoading: boolean;
}

export default function RequestForm({ onSubmit, isLoading }: RequestFormProps) {
  const [url, setUrl] = useState<string>('');
  const [headers, setHeaders] = useState<KeyValue[]>([
    { key: '', value: '', enabled: true }
  ]);
  const [query, setQuery] = useState<KeyValue[]>([
    { key: '', value: '', enabled: true }
  ]);
  const [method, setMethod] = useState<HttpMethod>('GET');
  const [body, setBody] = useState<string>('');
  const [contentType, setContentType] = useState<ContentType>('json');

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

  const handleQuery = () => {
    // todo: to implement
  }

  return (
    <Container>

      <Section size="1">
        <Flex gap="2" justify="between" align="center">

          <Select.Root value={method} onValueChange={(value) => setMethod(value as HttpMethod)}>
            <Select.Trigger color={HttpMethodColorRadixUI(method)} variant="soft" />
            <Select.Content position="popper" variant="soft">
              {httpMethods.map((e, i) => (
                  <Select.Item style={{color: HttpMethodColorRadixUI(e)}} value={e} key={`${i}${e}`}>{e}</Select.Item>
              ))}
            </Select.Content>
          </Select.Root>

          <TextField.Root placeholder="Enter URL" value={url} className='fw'
              onChange={(e) => setUrl(e.target.value)}
          />

          <Button onClick={handleSubmit} disabled={!url || isLoading} loading={isLoading}>Send</Button>
        </Flex>
      </Section>

      <Section size="1" pt="0">
        <Tabs.Root defaultValue="query">
          <Tabs.List>
            <Tabs.Trigger value="query">Query</Tabs.Trigger>
            <Tabs.Trigger value="header">Header</Tabs.Trigger>
            <Tabs.Trigger value="body">Body</Tabs.Trigger>
          </Tabs.List>

          <Box>
            <Tabs.Content value="query">
              <KeyValueForm getKeyValues={(data: KeyValue[]): void => setQuery(data)} title="Query"/>
            </Tabs.Content>

            <Tabs.Content value="header">
              <KeyValueForm getKeyValues={(data: KeyValue[]): void => setHeaders(data)} title="Header"/>
            </Tabs.Content>

            <Tabs.Content value="body">
              <BodyForm getBody={(data: string): void => setBody(data)} getContentType={(data: ContentType): void => setContentType(data)}/>
            </Tabs.Content>
          </Box>
        </Tabs.Root>

      </Section>
    </Container>
  );
} 