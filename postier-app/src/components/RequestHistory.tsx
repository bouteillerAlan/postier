import {
  ScrollArea,
  Box,
  Text,
  Flex,
  Badge,
  Separator,
  Card,
  Button,
  Tooltip,
  HoverCard,
} from '@radix-ui/themes';
import { getStatusColor } from '../services/formatter';
import {PostierObjectWithMetrics} from '../types/types.ts';
import React, {RefObject, useEffect, useState} from 'react';
import {MagnifyingGlassIcon, ReloadIcon, StackIcon, TrashIcon} from '@radix-ui/react-icons';

interface RequestHistoryProps {
  isLoading?: boolean;
  history: PostierObjectWithMetrics[];
  setHistory: React.Dispatch<React.SetStateAction<PostierObjectWithMetrics[]>>;
  onClickElement: (request: PostierObjectWithMetrics) => void;
  mainTabRef: RefObject<HTMLDivElement>;
}

export default function RequestHistory({ history, setHistory, onClickElement, mainTabRef, isLoading = false }: RequestHistoryProps) {
  const [wh, setWh] = useState<number>(0);

  useEffect(() => {
    window.addEventListener('resize', calculateViewHeight);
    calculateViewHeight();
    return () => {
      window.removeEventListener('resize', calculateViewHeight);
    };
  }, []);

  /**
   * calculate the height for the view list element a set it via a state
   * @return void
   */
  function calculateViewHeight(): void {
    // here 32 is the size of the padding and margin apply from the element on App.tsx
    setWh(mainTabRef.current ? window.innerHeight - (mainTabRef.current?.offsetHeight + 32) : window.innerHeight - 32);
  }

  /**
   * delete an elems from the history
   * @param elem
   * @return void
   */
  function onDeleteElement(elem: PostierObjectWithMetrics): void {
    // /!\ splice edit the original array so it is mandatory to use an intermediary
    //     array and not the context directly
    let newHistory = history;
    const deleteIndex = newHistory.indexOf(elem);
    if (deleteIndex === -1) return;
    newHistory.splice(deleteIndex, 1);
    setHistory(() => ([...newHistory]));
  }

  /**
   * Loading React.JSX.Element for the history
   * @return React.JSX.Element
   */
  function loadingDisplay(): React.JSX.Element {
    return (
      <Flex align='center' justify='center' style={{ height: '100%' }}>
        <Text as='p' size='2' color='gray'>
          Loading history...
        </Text>
      </Flex>
    );
  }

  /**
   * No data React.JSX.Element for the history
   * @return React.JSX.Element
   */
  function noHistoryDisplay(): React.JSX.Element {
    return (
      <Box p='4'>
        <Text as='p' size='2' color='gray'>
          No request history yet.
        </Text>
      </Box>
    );
  }

  return (
  <ScrollArea type='auto' scrollbars='vertical' style={{ height: wh }}>

    {isLoading && loadingDisplay()}
    {(!isLoading && (!history || (history && history.length === 0))) && noHistoryDisplay()}

    {<Flex direction='column' gap='2' p='2'>
      {(!isLoading && (history && history.length > 0)) && history.map((item: PostierObjectWithMetrics) => (
        <Card key={`hist${item.request.id}`}>
          <Flex gap='2' align='center' justify='between'>

            <Flex gap='2' direction='column'>
              <Flex gap='2' align='center' mb='1'>
                <Badge color='gray'>{new Date(item.request.timestamp).toLocaleString()}</Badge>
                <Separator/>


                <HoverCard.Root>
                  <HoverCard.Trigger>
                    <Badge>
                      <MagnifyingGlassIcon/>
                    </Badge>
                  </HoverCard.Trigger>
                  <HoverCard.Content size='1' maxWidth='500px' height='250px'>
                    <pre>{JSON.stringify(item, undefined, 2)}</pre>
                  </HoverCard.Content>
                </HoverCard.Root>


                <Badge>{item.request.method}</Badge>
                <Tooltip content={`${item.response.status}, ${item.response.statusText}`}>
                  <Badge color={getStatusColor(item.response.status) as any}>{item.response.status}</Badge>
                </Tooltip>
                <Text truncate color='gray' weight='bold'>{item.request.url}</Text>
              </Flex>

              <Flex align='center' gap='2'>
                <Tooltip content={`request id ${item.request.id.slice(0, 5)} match response id ${item.response.id.slice(0, 5)}`}>
                  <Badge color={item.request.id === item.response.id ? 'green' : 'red'}>
                    <StackIcon/>
                  </Badge>
                </Tooltip>
                <Tooltip content='tab id'>
                  <Badge color='gray'>{item.request.identity.tabId.slice(0, 6)}</Badge>
                </Tooltip>
                <Tooltip content='request id'>
                  <Badge color='gray'>{item.request.id.slice(0, 6)}</Badge>
                </Tooltip>
              </Flex>
            </Flex>

            <Flex gap='2' direction='column'>
              <Button color='orange' variant='soft' onClick={() => onClickElement(item)}>
                <ReloadIcon/> Load the request
              </Button>
              <Button color='crimson' variant='soft' onClick={() => onDeleteElement(item)}>
                <TrashIcon/> Delete the request
              </Button>
            </Flex>

          </Flex>
        </Card>
      ))}
    </Flex>}
  </ScrollArea>
  );
}