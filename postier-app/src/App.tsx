import {useEffect, useRef, useState} from 'react';
import {
  Box,
  Container,
  Tabs,
  Theme,
  Text,
  Button,
  ScrollArea,
  Flex,
  IconButton, Em
} from '@radix-ui/themes';
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
import {PlusIcon, TrashIcon} from '@radix-ui/react-icons';
import {getRequestDefault} from './services/defaultData.ts';

function App() {
  const { setting, setSetting } = useSetting();
  const { requestData, setRequestData } = useRequestData();
  const { historyData, setHistoryData } = useHistoryData();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [mainTabs, setMainTabs] = useState<string>('request');
  const [alert, setAlert] = useState<Alert[]>([{title: '', message: '', show: false}]);
  const mainTabRef = useRef<HTMLDivElement>(null);
  const [tabIndex, setTabIndex] = useState<string>(requestData[0].request.identity.tabId);

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
        let prevData = prev;
        const editedIndex = prevData.findIndex((v) => v.request.id === postierObject.request.id);
        // merge the new data with the old
        const mergedData = {...prevData[editedIndex], ...postierObject};
        console.log(mergedData)
        prevData.splice(editedIndex, 1, mergedData);
        //todo: check if all the data is set
        // postierObject.debug.concat(prevData.debug); // because we have some data already set in ResponseViewer
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
    return requestData.findIndex((v) => v.request.identity.tabId === tabIndex);
  }

  /**
   * add a request, so a tab, and set the tabIndex with this new id
   */
  function addARequest() {
    const newRequest = getRequestDefault();
    setRequestData((prev) => {
      return [...prev, newRequest];
    });
    setTabIndex(newRequest.request.identity.tabId);
  }

  function deleteARequest(tabId: string) {
    let keyToDelete = -1;
    setRequestData((prev: PostierObjectWithMetrics[]) => {
      const oldData = [...prev]; // for some reason all this fc crash if I don't destruct the array
      keyToDelete = oldData.findIndex((v) => v.request.identity.tabId === tabId);
      oldData.splice(keyToDelete, 1);
      return oldData;
    });
    if (requestData[keyToDelete].request.identity.tabId === tabIndex) {
      if (keyToDelete === -1) return; // just in case
      if (keyToDelete === 0) setTabIndex(requestData[1].request.identity.tabId);
      if (keyToDelete === requestData.length) setTabIndex(requestData[requestData.length-1].request.identity.tabId);
      setTabIndex(requestData[keyToDelete-1].request.identity.tabId);
    }
  }

  /**
   * set the border value for each button on the tab list
   * @param index number the index of the element (the button)
   * @param isTrashBtn boolean if the border has to be set for the trash icon btn
   */
  function setBorderValue(index: number, isTrashBtn: boolean) {
    if (requestData.length > 1) {
      if (
        (index > 0 && index !== requestData.length - 1) ||
        (index === 0 && isTrashBtn) ||
        (index === requestData.length - 1 && !isTrashBtn)
      ) return {borderRadius: '0', borderRight: 'none'};
      if (index === 0 && !isTrashBtn) return {borderRadius: 'var(--radius-3) 0 0 var(--radius-3)', borderRight: 'none'};
      if (index === requestData.length - 1 && isTrashBtn) return {borderRadius: '0 var(--radius-3) var(--radius-3) 0'};
    }
    return {borderRadius: 'var(--radius-3)'};
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

              <Flex align='center'>
                <Button size='3' style={{marginRight: '5px', marginTop: '12px'}} onClick={addARequest}><PlusIcon/></Button>
                <ScrollArea style={{padding: '10px 0', marginTop: '12px'}} scrollbars='horizontal'>
                  <Flex gap='1'>
                    {(requestData && requestData.length > 0) && requestData.map((rdata, index) => (
                      <Box key={`tabs${index}`}>
                        <Button
                          size='3'
                          variant={(tabIndex === rdata.request.identity.tabId) ? 'solid' : 'outline'}
                          style={setBorderValue(index, false)}
                          key={rdata.request.identity.tabId}
                          onClick={() => setTabIndex(rdata.request.identity.tabId)}
                        >
                          <Flex align='center'>
                            <Text size='2' mr={requestData.length > 1 ? '3' : '0'}>
                              <Flex direction='column' align='baseline'>
                                <Text size='3' trim='start'>{rdata.request.method}</Text>
                                <Text size='1' trim='both'><Em>{rdata.request.url === '' ? 'no url' : rdata.request.url.slice(0, 8)}</Em></Text>
                              </Flex>
                            </Text>
                          </Flex>
                        </Button>
                        {requestData.length > 1 &&
                          <IconButton
                            size='3'
                            color='var(--accent)'
                            variant={(tabIndex === rdata.request.identity.tabId) ? 'solid' : 'outline'}
                            style={{borderLeft: 'none', ...setBorderValue(index, true)}}
                            onClick={() => deleteARequest(rdata.request.identity.tabId)}
                          >
                            <TrashIcon/>
                          </IconButton>
                        }
                      </Box>
                      ))}
                  </Flex>
                </ScrollArea>
              </Flex>

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
