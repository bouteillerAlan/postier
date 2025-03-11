import React from 'react';
import {gTheme, gThemes, hlTheme, hlThemes, UserSetting as US} from '../types/types.ts';
import {Container, DataList, Select} from '@radix-ui/themes';

interface UserSettingProps {
  setSetting: React.Dispatch<React.SetStateAction<US>>;
  setting: US;
}

export default function UserSetting(props: UserSettingProps) {
  return (
    <Container pt='5'>
      <DataList.Root>

        <DataList.Item align='center'>
          <DataList.Label>Global theme</DataList.Label>
          <DataList.Value>
            <Select.Root value={props.setting.theme} onValueChange={(value: gTheme) => props.setSetting((prev: US) => ({...prev, theme: value}))}>
              <Select.Trigger/>
              <Select.Content position='popper'>
                {gThemes.map((value: gTheme, index: number) => (
                  <Select.Item key={`globaltheme${index}`} value={value}>{value}</Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </DataList.Value>
        </DataList.Item>

        <DataList.Item align='center'>
          <DataList.Label>Pretty theme</DataList.Label>
          <DataList.Value>
            <Select.Root value={props.setting.codeTheme} onValueChange={(value: hlTheme) => props.setSetting((prev: US) => ({...prev, codeTheme: value}))}>
              <Select.Trigger/>
              <Select.Content position='popper'>
                {hlThemes.map((value: hlTheme, index: number) => (
                  <Select.Item key={`codetheme${index}`} value={value}>{value}</Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </DataList.Value>
        </DataList.Item>

      </DataList.Root>
    </Container>
  )
}