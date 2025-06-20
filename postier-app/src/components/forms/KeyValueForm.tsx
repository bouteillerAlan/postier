import {Flex, IconButton, Section, Text, TextField, Tooltip} from '@radix-ui/themes';
import {KeyValue} from '../../types/types.ts';
import {useEffect, useState} from 'react';
import {Cross2Icon, PlusIcon} from '@radix-ui/react-icons';

interface KeyValueFormProps {
  setKeyValues: (data: KeyValue[]) => void;
  getKeyValues: KeyValue[] | null;
  title: string;
}

export default function KeyValueForm(props: KeyValueFormProps) {
  const [keyValues, setKeyValues] = useState<KeyValue[]>(
    (props.getKeyValues && props.getKeyValues.length > 0) ? props.getKeyValues : [{ key: '', value: '', enabled: false }]
  );

  /**
   *  add a new keyValue pair to the array
   *  @return void
   */
  function addKeyValue(): void {
    setKeyValues([...keyValues, { key: '', value: '', enabled: true }]);
  }

  /**
   * remove a keyValue pair from the array
   * @param index
   * @return void
   */
  function removeKeyValue(index: number): void {
    const oldKeyValues = [...keyValues];
    oldKeyValues.splice(index, 1);
    setKeyValues(oldKeyValues);
  }

  function changeKeyValue(index: number, field: keyof KeyValue, value: string | boolean): void {
    const newKeyValues = [...keyValues];
    newKeyValues[index] = { ...newKeyValues[index], [field]: value, enabled: !!(field && value) };
    setKeyValues(newKeyValues);
  }

  useEffect(() => {
    props.setKeyValues(keyValues);
  }, [keyValues]);

  // Update local state when props change
  useEffect(() => {
    if (props.getKeyValues) {
      setKeyValues(props.getKeyValues);
    }
  }, [props.getKeyValues]);

  return (
    <Section size='1' pb='0' pt='2'>

      <Flex gap='3' mb='2'>
        <Tooltip content={`Add a new ${props.title.toLowerCase()}`}>
          <IconButton size='1' variant='soft' onClick={addKeyValue}><PlusIcon/></IconButton>
        </Tooltip>
        <Text size='2' weight='bold'>{props.title}</Text>
      </Flex>

      <Flex direction='column' gap='2'>
        {keyValues.map((header, index) => (
          <Flex key={index} gap='2' align='center'>
            <TextField.Root
              placeholder={`${props.title} name`}
              value={header.key}
              onChange={(e) => changeKeyValue(index, 'key', e.target.value)}
            />
            <TextField.Root
              placeholder={`${props.title} value`}
              value={header.value}
              onChange={(e) => changeKeyValue(index, 'value', e.target.value)}
            />
            <IconButton
              variant='soft'
              color='red'
              onClick={() => removeKeyValue(index)}
            ><Cross2Icon/></IconButton>
          </Flex>
        ))}
      </Flex>
    </Section>
  );
}
