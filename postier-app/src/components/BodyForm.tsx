import {Box, Flex, Section, Select, Text, TextArea, TextField} from "@radix-ui/themes";
import {ContentType} from "../types.ts";
import {useState} from "react";

export default function BodyForm({getBody, getContentType}) {
  const [body, setBody] = useState<string>('');
  const [contentType, setContentType] = useState<ContentType>('json');

  return (
    <Section size="1">
      <Text as="p" size="2" weight="bold" mb="2">Body</Text>
      <Box>
        <Flex justify="between" align="center" mb="2">
          <Select.Root value={contentType} onValueChange={(value) => setContentType(value as ContentType)}>
            <Select.Trigger />
            <Select.Content position="popper">
              <Select.Item value="json">JSON</Select.Item>
              <Select.Item value="text">Text</Select.Item>
              <Select.Item value="form-data">Form Data</Select.Item>
              <Select.Item value="javascript">JavaScript</Select.Item>
              <Select.Item value="html">HTML</Select.Item>
              <Select.Item value="xml">XML</Select.Item>
              <Select.Item value="none">None</Select.Item>
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