import React, {useEffect, useState} from 'react';
import {
  accentTheme, accentThemes,
  gTheme, gThemes,
  hlTheme, hlThemes,
  scaleTheme, scaleThemes,
  UserSetting as US
} from '../types/types.ts';
import {Button, Checkbox, Code, Container, DataList, Select} from '@radix-ui/themes';
import { path } from '@tauri-apps/api'
import {ReloadIcon} from '@radix-ui/react-icons';
import {getDefaultSetting} from "../services/defaultData.ts";

interface UserSettingProps {
  setSetting: React.Dispatch<React.SetStateAction<US>>;
  setting: US;
}

export default function UserSetting(props: UserSettingProps) {

  const [appConfigDirPath, setAppConfigDirPath] = useState<string>('Not loaded');
  const [appLocalDataDirPath, setAppLocalDataDirPath] = useState<string>('Not loaded');

  useEffect(() => {
    path.appConfigDir().then((path: string) => setAppConfigDirPath(path));
    path.appLocalDataDir().then((path: string) => setAppLocalDataDirPath(path));
  }, []);

  function resetSetting() {
    props.setSetting(() => getDefaultSetting());
  }

  return (
    <Container pt='5'>
      <DataList.Root>

        <DataList.Item align='center'>
          <DataList.Label>Global theme</DataList.Label>
          <DataList.Value>
            <Select.Root value={props.setting.globalTheme}
                         onValueChange={(value: gTheme) => props.setSetting((prev: US) => ({
                           ...prev,
                           globalTheme: value
                         }))}>
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
            <Select.Root value={props.setting.codeTheme}
                         onValueChange={(value: hlTheme) => props.setSetting((prev: US) => ({
                           ...prev,
                           codeTheme: value
                         }))}>
              <Select.Trigger/>
              <Select.Content position='popper'>
                {hlThemes.map((value: hlTheme, index: number) => (
                  <Select.Item key={`codetheme${index}`} value={value}>{value}</Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </DataList.Value>
        </DataList.Item>

        <DataList.Item align='center'>
          <DataList.Label>Accent color</DataList.Label>
          <DataList.Value>
            <Select.Root value={props.setting.accentTheme}
                         onValueChange={(value: accentTheme) => props.setSetting((prev: US) => ({
                           ...prev,
                           accentTheme: value
                         }))}>
              <Select.Trigger/>
              <Select.Content position='popper'>
                {accentThemes.map((value: accentTheme, index: number) => (
                  <Select.Item key={`accenttheme${index}`} value={value}>{value}</Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </DataList.Value>
        </DataList.Item>

        <DataList.Item align='center'>
          <DataList.Label>Scale</DataList.Label>
          <DataList.Value>
            <Select.Root value={props.setting.scaleTheme}
                         onValueChange={(value: scaleTheme) => props.setSetting((prev: US) => ({
                           ...prev,
                           scaleTheme: value
                         }))}>
              <Select.Trigger/>
              <Select.Content position='popper'>
                {scaleThemes.map((value: scaleTheme, index: number) => (
                  <Select.Item key={`scaletheme${index}`} value={value}>{value}</Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </DataList.Value>
        </DataList.Item>

        <DataList.Item align='center'>
          <DataList.Label>Debug mode</DataList.Label>
          <DataList.Value>
            <Checkbox checked={props.setting.debug} onCheckedChange={(value) => props.setSetting((prev: US) => ({
              ...prev,
              debug: value as boolean
            }))}/>
          </DataList.Value>
        </DataList.Item>

        <DataList.Item align='center'>
          <DataList.Label>History is located in</DataList.Label>
          <DataList.Value>
            <Code>{appLocalDataDirPath}</Code>
          </DataList.Value>
        </DataList.Item>

        <DataList.Item align='center'>
          <DataList.Label>Config is located in</DataList.Label>
          <DataList.Value>
            <Code>{appConfigDirPath}</Code>
          </DataList.Value>
        </DataList.Item>

        <DataList.Item align='center'>
          <DataList.Label>
            <Button color='crimson' variant='soft' onClick={resetSetting}><ReloadIcon/> Reset to default</Button>
          </DataList.Label>
          <DataList.Value></DataList.Value>
        </DataList.Item>

      </DataList.Root>
    </Container>
  )
}