import {ScrollArea, Box, Text, Flex, Badge, Separator, Card, Button, Tooltip} from '@radix-ui/themes';
import { getStatusColor } from '../services/formatter';
import {PostierObject} from "../types/types.ts";
import {useEffect, useState} from "react";

interface RequestHistoryProps {
  isLoading?: boolean;
  historyObject: PostierObject[];
  onClickElement: (request: PostierObject) => void
}

export default function RequestHistory({ historyObject, onClickElement, isLoading = false }: RequestHistoryProps) {

  const [history, setHistory] = useState(historyObject);

  useEffect(() => {
    setHistory(historyObject);
  }, [history]);

  /**
   * delete an elems from the history
   * @param elem
   * @return void
   */
  function onDeleteElement(elem: PostierObject): void {
    const deleteIndex = history.indexOf(elem);
    if (deleteIndex === -1) return;
    const newHistory = history.splice(deleteIndex, 1);
    setHistory(newHistory);
  }

  function loadingDisplay() {
    return (
      <Flex align="center" justify="center" style={{ height: '100%' }}>
        <Text as="p" size="2" color="gray">
          Loading history...
        </Text>
      </Flex>
    );
  }

  function noHistoryDisplay() {
    return (
      <Box p="4">
        <Text as="p" size="2" color="gray">
          No request history yet.
        </Text>
      </Box>
    );
  }

  return (
  <ScrollArea style={{ height: '100%' }}>

    {isLoading && loadingDisplay()}
    {(!isLoading && (!history || (history && history.length === 0))) && noHistoryDisplay()}

    {<Flex direction="column" gap="2" p="2">
      {(!isLoading && (history && history.length > 0)) && history.sort((a, b) => {
        if (a.request.timestamp > b.request.timestamp) return -1;
        if (a.request.timestamp < b.request.timestamp) return 1;
        return 0;
      }).map((item: PostierObject) => (
        <Card key={`hist${item.request.id}`}>
          <Flex gap='2' align='center' justify='between'>
            <Flex gap='2' direction='column'>
              <Flex gap='2' align="center" mb="1">
                <Text color="gray">{new Date(item.request.timestamp).toLocaleString()}</Text>
                <Separator/>
                <Text color="gray">{Math.round(item.response.time)}ms</Text>
              </Flex>
              <Flex gap='2' align='center' mb='1'>
                <Tooltip content={`request id ${item.request.id.slice(0, 5)} match response id ${item.response.id.slice(0, 5)}`}>
                  <Badge color={item.request.id === item.response.id ? 'green' : 'red'}>{item.request.id}</Badge>
                </Tooltip>
              </Flex>
              <Flex align='center' gap='2'>
                <Badge variant="soft">{item.request.method}</Badge>
                <Tooltip content={`${item.response.status}, ${item.response.statusText}`}>
                  <Badge color={getStatusColor(item.response.status) as any}>{item.response.status}</Badge>
                </Tooltip>
                <Text style={{ wordBreak: 'break-all' }}>{item.request.url}</Text>
              </Flex>
            </Flex>
            <Flex gap='2' direction='column'>
              <Button color="orange" variant="soft" onClick={() => onClickElement(item)}>
                Replace current request
              </Button>
              <Button color="crimson" variant="soft" onClick={() => onDeleteElement(item)}>
                Delete from history
              </Button>
            </Flex>
          </Flex>
        </Card>
      ))}
    </Flex>}
  </ScrollArea>
  );
}