import { useState } from "react";
import { Tabs, Container, Flex, Box, Button } from "@radix-ui/themes";
import RequestForm from "./components/RequestForm";
import ResponseViewer from "./components/ResponseViewer";
import RequestHistory from "./components/RequestHistory";
import {RequestData, ResponseData} from "./types";
import { sendRequest } from "./utils/http";
import { useRequestData } from "./contexts/RequestForm.tsx";

function App() {
  const { requestData, setRequestData } = useRequestData();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  async function handleSendRequest(requestConfig: RequestData) {
    setIsLoading(true);
    try {
      const responseData: ResponseData = await sendRequest(requestConfig);
      setRequestData(prev => ({...prev, response: responseData}));
    } catch (error) {
      console.error("Error sending request:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Container p="4">

      <Tabs.Root defaultValue="request">
        <Tabs.List>
          <Tabs.Trigger value="request">Request</Tabs.Trigger>
          <Tabs.Trigger value="history">History</Tabs.Trigger>
        </Tabs.List>
        
        <Tabs.Content value="request">
          <RequestForm onSubmit={handleSendRequest} isLoading={isLoading} />
          <ResponseViewer response={requestData.response} />
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
            <RequestHistory 
              history={undefined}
              onSelectRequest={() => {}}
              isLoading={false}
            />
          </Box>
        </Tabs.Content>

      </Tabs.Root>
    </Container>
  );
}

export default App;
