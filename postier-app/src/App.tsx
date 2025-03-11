import {useEffect, useRef, useState} from 'react';
import {Tabs, Container, Theme, Box, Card, Text} from '@radix-ui/themes';
import RequestForm from './components/RequestForm';
import ResponseViewer from './components/ResponseViewer';
import RequestHistory from './components/RequestHistory';
import {RequestData, PostierObject} from './types/types.ts';
import {sendRequest} from './services/http';
import {useRequestData} from './contexts/RequestContext.tsx';
import {useHistoryData} from './contexts/HistoryContext.tsx';
import {ThemeProvider} from 'next-themes';
import {useSetting} from './contexts/SettingContext.tsx';
import UserSetting from './components/UserSetting.tsx';

function App() {
  const { setting, setSetting } = useSetting();
  const { requestData, setRequestData } = useRequestData();
  const { historyData, setHistoryData } = useHistoryData();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [mainTabs, setMainTabs] = useState<string>('request');
  const mainTabRef = useRef<HTMLDivElement>(null);

  /**
   * replace the current data in the request context by the new one
   * @param elem
   * @return void
   */
  function replaceRequestDataContext(elem: PostierObject): void {
    setRequestData(() => elem);
  }

  /**
   * update the context and move the user to the request tab
   * @param elem
   * @return void
   */
  function updateContextAndGoHome(elem: PostierObject): void {
    setIsLoading(true);
    replaceRequestDataContext(elem);
    setMainTabs('request');
  }

  /**
   * handle the request made from the requestForm
   * send the request, update both request and history context
   * @param requestConfig
   * @return Promise<void>
   */
  async function handleSendRequest(requestConfig: RequestData): Promise<void> {
    setIsLoading(true);
    try {
      const postierObject: PostierObject = await sendRequest(requestConfig);
      // store the response for the responseViewer
      setRequestData((prev: PostierObject) => {
        prev.debug.concat(postierObject.debug); // because we have some data already set eg: 31,32 in ResponseViewer
        return {...prev, ...postierObject};
      });
      // save all the data in the history feed
      setHistoryData((prev: PostierObject[]) => {
        prev.push(postierObject);
        return prev;
      });
    } catch (error) {
      console.error('Error sending request:', error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    // set loading to false after the user come back from other page
    if (mainTabs === 'request') setIsLoading(false);
  }, [mainTabs]);

  useEffect(() => {
    console.log('setting updated');
    // todo: update the setting file
  }, [setting]);

  useEffect(() => {
    console.log('history updated');
    // todo: update the history file
  }, [historyData]);

  useEffect(() => {
    console.log('request updated');
  }, [requestData]);

  return (
    <ThemeProvider attribute='class'>
      <Theme
        radius='small'
        appearance={setting.globalTheme === 'auto' ? undefined : setting.globalTheme}
        scaling={setting.scaleTheme ?? '100%'}
        accentColor={setting.accentTheme ?? 'cyan'}
      >
        <Container p='4'>
          <Tabs.Root defaultValue='request' value={mainTabs} onValueChange={setMainTabs}>
            <Tabs.List ref={mainTabRef}>
              <Tabs.Trigger value='request'>Request</Tabs.Trigger>
              <Tabs.Trigger value='history'>History</Tabs.Trigger>
              <Tabs.Trigger value='setting'>Setting</Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value='request'>
              <RequestForm onSubmit={handleSendRequest} isLoading={isLoading}/>
              <ResponseViewer response={requestData.response} debug={requestData.debug} userConfig={setting}/>
            </Tabs.Content>

            <Tabs.Content value='history'>
              <RequestHistory
                isLoading={isLoading}
                mainTabRef={mainTabRef}
                history={historyData}
                setHistory={setHistoryData}
                onClickElement={updateContextAndGoHome}
              />
            </Tabs.Content>

            <Tabs.Content value='setting'>
              <UserSetting setSetting={setSetting} setting={setting}/>
            </Tabs.Content>

          </Tabs.Root>
        </Container>

        <Box maxWidth="350px">
          <Card variant="surface">
            <Text as="div" size="2" weight="bold">
              Debug
            </Text>
            <Text as="div" color="gray" size="2">
              Message
            </Text>
          </Card>
        </Box>


      </Theme>
    </ThemeProvider>
  );
}

export default App;
