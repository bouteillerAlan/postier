import {useEffect, useState} from "react";
import {Tabs, Container, Flex, Box, Button} from "@radix-ui/themes";
import RequestForm from "./components/RequestForm";
import ResponseViewer from "./components/ResponseViewer";
import RequestHistory from "./components/RequestHistory";
import {RequestData, PostierObject} from "./types/types.ts";
import { sendRequest } from "./services/http";
import { useRequestData } from "./contexts/RequestContext.tsx";
import { useHistoryData } from "./contexts/HistoryContext.tsx";

function App() {
  const { requestData, setRequestData } = useRequestData();
  const { historyData, setHistoryData } = useHistoryData();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [mainTabs, setMainTabs] = useState<string>('request');

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
  function updateContextAndGoHome(elem: PostierObject) {
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
      console.error("Error sending request:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    // set loading to false after the user come back from other page
    if (mainTabs === 'request') setIsLoading(false);
  }, [mainTabs]);

  return (
    <Container p="4">
      <Tabs.Root defaultValue="request" value={mainTabs} onValueChange={setMainTabs}>
        <Tabs.List>
          <Tabs.Trigger value="request">Request</Tabs.Trigger>
          <Tabs.Trigger value="history">History</Tabs.Trigger>
        </Tabs.List>
        
        <Tabs.Content value="request">
          <RequestForm onSubmit={handleSendRequest} isLoading={isLoading} />
          <ResponseViewer response={requestData.response} debug={requestData.debug} />
        </Tabs.Content>
        
        <Tabs.Content value="history">
          <Box>
            {history.length > 0 && (
              <Flex justify="end" p="2">
                <Button color="red" variant="soft" onClick={() => {}}>
                  Clear History
                </Button>
              </Flex>
            )}
            <RequestHistory isLoading={isLoading} history={historyData} onClickElement={updateContextAndGoHome}/>
          </Box>
        </Tabs.Content>

      </Tabs.Root>
    </Container>
  );
}

export default App;
