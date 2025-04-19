import {Box, Card, Flex, ScrollArea, Section, Select, Text} from '@radix-ui/themes';
import {ContentType} from '../../types/types.ts';
import {useEffect, useState} from 'react';
import {useSetting} from '../../contexts/SettingContext.tsx';
import Editor from 'react-simple-code-editor';
import HighlightCode from "../codeHighlighting/HighlightCode.tsx";
import {themes} from "prism-react-renderer";

interface BodyFormProps {
  getBody: (data: string) => void;
  getContentType: (data: ContentType) => void;
  setBody: string | null;
  setContentType: ContentType | null
}

export default function BodyForm(props: BodyFormProps) {
  const [body, setBody] = useState<string>(props.setBody ?? '');
  const [contentType, setContentType] = useState<ContentType>(props.setContentType ?? 'none');
  const { setting } = useSetting();

  useEffect(() => {
    props.getBody(body);
  }, [body]);

  useEffect(() => {
    props.getContentType(contentType);
  }, [contentType]);

  /**
   * force the maj of the data when props.setKeyValues change
   */
  useEffect(() => {
    setContentType(props.setContentType ?? 'none')
  }, [props.setContentType]);

  useEffect(() => {
    setBody(props.setBody ?? '')
  }, [props.setBody]);

  return (
    <Section size='1' pt='2' pb='0'>
      <Text as='p' size='2' weight='bold' mb='2'>Body</Text>
      <Box>
        <Flex justify='between' align='center' mb='2'>
          <Select.Root value={contentType} onValueChange={(value) => setContentType(value as ContentType)}>
            <Select.Trigger />
            <Select.Content position='popper'>
              <Select.Item value='json'>JSON</Select.Item>
              <Select.Item value='text'>Text</Select.Item>
              <Select.Item value='form-data'>Form Data</Select.Item>
              <Select.Item value='javascript'>JavaScript</Select.Item>
              <Select.Item value='html'>HTML</Select.Item>
              <Select.Item value='xml'>XML</Select.Item>
              <Select.Item value='none'>None</Select.Item>
            </Select.Content>
          </Select.Root>
        </Flex>

        <Card style={{height: 200, padding: 0}}>
          <ScrollArea style={{backgroundColor: themes[setting.codeTheme].plain.backgroundColor}}>
            <Editor
              value={body}
              placeholder={`Enter body of type ${contentType}`}
              onValueChange={(value) => setBody(value)}
              style={{
                fontFamily: 'var(--code-font-family)',
                fontSize: 'var(--default-font-size)'
              }}
              padding={10}
              highlight={(code) => {
                return <HighlightCode content={code} contentType={contentType} codeTheme={themes[setting.codeTheme]} mainDivStyle={{minHeight: 100}}/>
              }}
            />
          </ScrollArea>
        </Card>

      </Box>
    </Section>
  );
}