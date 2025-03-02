import {Button, Flex, IconButton, Section, Text, TextField} from "@radix-ui/themes";
import {KeyValue} from "../types.ts";
import {useEffect, useState} from "react";

export default function KeyValueForm(props: {getKeyValues: (data: KeyValue[]) => void, title: string}) {
  const [keyValues, setKeyValues] = useState<KeyValue[]>([
    { key: '', value: '', enabled: true }
  ]);

  const addKeyValue = () => {
    setKeyValues([...keyValues, { key: '', value: '', enabled: true }]);
  };

  const removeKeyValue = (index: number) => {
    const newKeyValues = [...keyValues];
    newKeyValues.splice(index, 1);
    setKeyValues(newKeyValues);
  };

  const changeKeyValue = (index: number, field: keyof KeyValue, value: string | boolean) => {
    const newKeyValues = [...keyValues];
    newKeyValues[index] = { ...newKeyValues[index], [field]: value };
    setKeyValues(newKeyValues);
  };

  useEffect(() => {
    props.getKeyValues(keyValues);
  }, [keyValues]);

  return (
    <Section size="1">
      <Text as="p" size="2" weight="bold" mb="2">{props.title}</Text>

      <Flex direction="column" gap="2">
        {keyValues.map((header, index) => (
          <Flex key={index} gap="2" align="center">
            <TextField.Root
              placeholder={props.title + " name"}
              value={header.key}
              onChange={(e) => changeKeyValue(index, 'key', e.target.value)}
            />
            <TextField.Root
              placeholder={props.title + " value"}
              value={header.value}
              onChange={(e) => changeKeyValue(index, 'value', e.target.value)}
            />
            <IconButton
              variant="soft"
              color="red"
              onClick={() => removeKeyValue(index)}
            >✕</IconButton>
          </Flex>
        ))}
        <Button variant="soft" onClick={addKeyValue}>
          Add a new {props.title}
        </Button>
      </Flex>
    </Section>
  );
}