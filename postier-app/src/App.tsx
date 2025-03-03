import { useState, useEffect } from "react";
import { Tabs, Container, Flex, Box, Button } from "@radix-ui/themes";
import RequestForm from "./components/RequestForm";
import ResponseViewer from "./components/ResponseViewer";
import RequestHistory from "./components/RequestHistory";
import { RequestData, ResponseData, RequestHistoryItem } from "./types";
import { sendRequest } from "./utils/http";
import { loadHistoryFromFile, saveHistoryToFile, clearHistoryFile } from "./utils/historyStorage";

function App() {
  const [response, setResponse] = useState<ResponseData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [history, setHistory] = useState<RequestHistoryItem[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState<boolean>(true);

  // Load history from file on component mount
  useEffect(() => {
    async function fetchHistory() {
      try {
        setIsHistoryLoading(true);
        const savedHistory = await loadHistoryFromFile();
        setHistory(savedHistory);
      } catch (error) {
        console.error("Error loading history:", error);
      } finally {
        setIsHistoryLoading(false);
      }
    }

    fetchHistory();
  }, []);

  // Save history to file whenever it changes
  useEffect(() => {
    // Skip saving on initial load
    if (isHistoryLoading) return;
    
    // Save history to file
    saveHistoryToFile(history).catch(error => {
      console.error("Error saving history:", error);
    });
  }, [history, isHistoryLoading]);

  async function handleSendRequest(requestData: RequestData) {
    setIsLoading(true);
    try {
      const responseData = await sendRequest(requestData);
      setResponse(responseData);
      
      // Add to history
      const historyItem: RequestHistoryItem = {
        ...requestData,
        timestamp: Date.now(),
        response: responseData
      };
      setHistory(prev => [historyItem, ...prev]);
    } catch (error) {
      console.error("Error sending request:", error);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSelectFromHistory(item: RequestHistoryItem) {
    // Load the request from history
    const requestData: RequestData = {
      id: item.id,
      url: item.url,
      method: item.method,
      headers: item.headers,
      body: item.body,
      contentType: item.contentType
    };
    
    // Set the response if available
    if (item.response) {
      setResponse(item.response);
    }
    
    // Send the request again
    handleSendRequest(requestData);
  }

  async function handleClearHistory() {
    try {
      await clearHistoryFile();
      setHistory([]);
    } catch (error) {
      console.error("Error clearing history:", error);
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
          <ResponseViewer response={response} />
        </Tabs.Content>
        
        <Tabs.Content value="history">
          <Box>
            {history.length > 0 && (
              <Flex justify="end" p="2">
                <Button color="red" variant="soft" onClick={handleClearHistory}>
                  Clear History
                </Button>
              </Flex>
            )}
            <RequestHistory 
              history={history} 
              onSelectRequest={handleSelectFromHistory}
              isLoading={isHistoryLoading}
            />
          </Box>
        </Tabs.Content>

      </Tabs.Root>
    </Container>
  );
}

export default App;
