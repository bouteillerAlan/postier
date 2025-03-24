import {useEffect, useRef, useState} from 'react';
import {Box, Container, SegmentedControl, Tabs, Theme, Text, Button, ScrollArea} from '@radix-ui/themes';
import RequestForm from './components/RequestForm';
import ResponseViewer from './components/ResponseViewer';
import RequestHistory from './components/RequestHistory';
import {Alert, PostierObjectWithMetrics, RequestData} from './types/types.ts';
import {sendRequest} from './services/rust-http.ts';
import {useRequestData} from './contexts/RequestContext.tsx';
import {useHistoryData} from './contexts/HistoryContext.tsx';
import {ThemeProvider} from 'next-themes';
import {useSetting} from './contexts/SettingContext.tsx';
import UserSetting from './components/UserSetting.tsx';
import AlertCard from './components/AlertCard.tsx';
import {getContentFromFile, writeContentInFile} from './services/fileStorage.ts';
import {PlusIcon} from '@radix-ui/react-icons';
import {getRequestDefault} from './services/defaultData.ts';

function App() {
  const { setting, setSetting } = useSetting();
  const { requestData, setRequestData } = useRequestData();
  const { historyData, setHistoryData } = useHistoryData();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [mainTabs, setMainTabs] = useState<string>('request');
  const [alert, setAlert] = useState<Alert[]>([{title: '', message: '', show: false}]);
  const mainTabRef = useRef<HTMLDivElement>(null);
  const [tabIndex, setTabIndex] = useState<string>(requestData[0].request.id);

  /**
   * replace the current data in the request context by the new one
   * @param elem
   * @return void
   */
  function replaceRequestDataContext(elem: PostierObjectWithMetrics): void {
    setRequestData((prev: PostierObjectWithMetrics[]) => {
      const oldData = prev;
      const keyToReplace = prev.findIndex((v) => v.request.id === elem.request.id);
      oldData.splice(keyToReplace, 1, elem);
      return oldData;
    });
  }

  /**
   * update the context and move the user to the request tab
   * @param elem
   * @return void
   */
  function updateContextAndGoHome(elem: PostierObjectWithMetrics): void {
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
      const postierObject = await sendRequest(requestConfig);
      // store the response for the responseViewer
      setRequestData((prev: PostierObjectWithMetrics[]) => {
        const prevData = prev;
        const editedIndex = prevData.findIndex((v) => v.request.id === postierObject.request.id);
        prevData.splice(editedIndex, 1, postierObject);
        //postierObject.debug.concat(prevData.debug); // because we have some data already set in ResponseViewer
        return prevData;
      });
      // save all the data in the history feed
      setHistoryData((prev: PostierObjectWithMetrics[]) => {
        prev.unshift(postierObject);
        return [...prev];
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
    if (setting.debug) setAlert(prev => [...prev, {title: 'Debug', message: 'setting updated', show: setting.debug}]);
    writeContentInFile(JSON.stringify(setting), 'config.txt');
  }, [setting]);

  useEffect(() => {
    if (setting.debug) setAlert(prev => [...prev, {title: 'Debug', message: 'history updated', show: setting.debug}]);
    writeContentInFile(JSON.stringify(historyData), 'history.txt');
  }, [historyData]);

  useEffect(() => {
    if (setting.debug) setAlert(prev => [...prev, {title: 'Debug', message: 'request updated', show: setting.debug}]);
  }, [requestData]);

  useEffect(() => {
    getContentFromFile('config.txt').then((value: string) => {
      const configParsed = JSON.parse(value);
      if (configParsed && typeof configParsed === 'object') setSetting(() => ({...configParsed}));
    });
    getContentFromFile('history.txt').then((value: string) => {
      const historyParsed = JSON.parse(value);
      if (historyParsed && typeof historyParsed === 'object') setHistoryData(() => ([...historyParsed]));
    });
  }, []);

  /**
   * handle all the value change for the request form
   * @param key the key of the value the form changed
   * @param value the new value you want to put on the key
   * @param id the id of the request object
   */
  function handleRequestData(key: keyof RequestData, value: any, id: string): void {
    console.log(key, value, id);
    setRequestData((prev: PostierObjectWithMetrics[]) => {
      const prevData = prev;
      const dataIndex = prevData.findIndex((v) => v.request.id === id);
      prevData[dataIndex].request[key] = value as never; // todo: never can be, maybe replaced with real type
      return [...prevData];
    });
  }

  /**
   * return the index of the request id
   * @return number the index of the request in the requestData context array
   */
  function getRequestIndex(): number {
    return requestData.findIndex((v) => v.request.id === tabIndex);
  }

  /**
   * add a request, so a tab, and set the tabIndex with this new id
   */
  function addARequest() {
    const newRequest = getRequestDefault();
    setRequestData((prev) => {
      return [...prev, newRequest];
    });
    setTabIndex(newRequest.request.id);
  }

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

              <ScrollArea>
                <SegmentedControl.Root value={tabIndex} mt='5'>
                  {(requestData && requestData.length > 0) ? requestData.map((rdata) => (
                    <SegmentedControl.Item key={rdata.request.id} onClick={() => setTabIndex(rdata.request.id)} value={rdata.request.id}>{rdata.request.id.slice(0, 4)}</SegmentedControl.Item>
                  )) : <Text>Error no default requestData</Text>}
                  <Button onClick={addARequest}><PlusIcon/></Button>
                </SegmentedControl.Root>
              </ScrollArea>

              <RequestForm
                onSubmit={handleSendRequest}
                isLoading={isLoading}
                requestData={requestData[getRequestIndex()]}
                setRequestData={handleRequestData}
              />
              <ResponseViewer
                response={requestData[getRequestIndex()].response}
                debug={requestData[getRequestIndex()].debug}
                metrics={requestData[getRequestIndex()].metrics}
                userConfig={setting}
              />

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

        <Box style={{position: 'absolute', bottom: 10, right: 10, height: 'fit-content', display: 'flex', flexDirection: 'column'}}>
          {alert.length > 0 && alert.map((e, index) => (
            <AlertCard key={`AlertCard${index}`} title={e.title} message={e.message} show={e.show}/>
          ))}
        </Box>

      </Theme>
    </ThemeProvider>
  );
}

export default App;
