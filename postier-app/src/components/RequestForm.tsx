import { v4 as uuidv4 } from "uuid";
import { Box, Button, Container, Flex, Section, Select, Tabs, TextField } from "@radix-ui/themes";
import { HttpMethodColorRadixUI } from "../services/switchStyle.ts";
import KeyValueForm from "./KeyValueForm.tsx";
import BodyForm from "./BodyForm.tsx";
import {ContentType, HttpMethod, httpMethods, KeyValue, RequestData} from "../types/types.ts";
import {useRequestData} from "../contexts/RequestForm.tsx";

interface RequestFormProps {
  onSubmit: (requestData: RequestData) => void;
  isLoading: boolean;
}

export default function RequestForm({ onSubmit, isLoading }: RequestFormProps) {
  const { requestData, setRequestData } = useRequestData();

  /**
   * build the string for the query and return it
   * @return string
   */
  const buildQueryString = (): string => {
    return "?".concat(
      requestData.query
        .filter(item => item.enabled && item.key && item.value)
        .map(item => `${encodeURIComponent(item.key)}=${encodeURIComponent(item.value)}`)
        .join(',')
    );
  };

  /**
   * add the protocol in the url if it's not given by the user
   * /!\ atm just support https
   * @return string
   */
  const safeUrl = (): string => {
    const urlPattern = /^https?:\/\//;
    const isValidUrl = urlPattern.test(requestData.url);
    return isValidUrl ? requestData.url : `https://${requestData.url}`;
  }

  /**
   * submit the request
   * @return void
   */
  const handleSubmit = () => {
    const updatedRequestData = {
      ...requestData,
      id: uuidv4(),
      url: `${safeUrl()}${buildQueryString()}`,
    };
    onSubmit(updatedRequestData);
  };

  return (
    <Container>
      <Section size="1">
        <Flex gap="2" justify="between" align="center">
          <Select.Root value={requestData.method} onValueChange={(value) => setRequestData(prev => ({ ...prev, method: value as HttpMethod }))}>
            <Select.Trigger color={HttpMethodColorRadixUI(requestData.method)} variant="soft" />
            <Select.Content position="popper" variant="soft">
              {httpMethods.map((e, i) => (
                <Select.Item style={{ color: HttpMethodColorRadixUI(e) }} value={e} key={`${i}${e}`}>{e}</Select.Item>
              ))}
            </Select.Content>
          </Select.Root>

          <TextField.Root
            placeholder="Enter URL"
            value={requestData.url}
            className='fw'
            onChange={(e) => setRequestData(prev => ({ ...prev, url: e.target.value }))}
          />

          <Button onClick={handleSubmit} disabled={!requestData.url || isLoading} loading={isLoading}>Send</Button>
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
              <KeyValueForm
                getKeyValues={(data: KeyValue[]): void => setRequestData(prev => ({ ...prev, query: data }))}
                setKeyValues={requestData.query}
                title="Query"
              />
            </Tabs.Content>

            <Tabs.Content value="header">
              <KeyValueForm
                getKeyValues={(data: KeyValue[]): void => setRequestData(prev => ({ ...prev, headers: data }))}
                setKeyValues={requestData.headers}
                title="Header"
              />
            </Tabs.Content>

            <Tabs.Content value="body">
              <BodyForm
                getBody={(data: string): void => setRequestData(prev => ({...prev, body: data}))}
                getContentType={(data: ContentType): void => setRequestData(prev => ({...prev, contentType: data}))}
                setBody={requestData.body}
                setContentType={requestData.contentType}
              />
            </Tabs.Content>
          </Box>
        </Tabs.Root>
      </Section>
    </Container>
  );
}
