import {Box, Flex, Section, Select, Text, TextArea} from '@radix-ui/themes';
import {ContentType} from '../../types/types.ts';
import {useEffect, useState} from 'react';

export default function BodyForm(props: {getBody: (data: string) => void; getContentType: (data: ContentType) => void; setBody: string | null; setContentType: ContentType | null}) {
  const [body, setBody] = useState<string>(props.setBody ?? '');
  const [contentType, setContentType] = useState<ContentType>(props.setContentType ?? 'json');

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
    setContentType(props.setContentType ?? 'json')
  }, [props.setContentType]);

  useEffect(() => {
    setBody(props.setBody ?? '')
  }, [props.setBody]);

  return (
    <Section size='1' pt='2'>
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
        <TextArea
          placeholder={`Enter ${contentType} body`}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          style={{ minHeight: '150px' }}
        />
      </Box>
    </Section>
  );
}