import {ScrollArea, Box, Text, Flex, Badge, Separator} from '@radix-ui/themes';
import { getStatusColor } from '../services/formatter';
import {PostierObject} from "../types/types.ts";

interface RequestHistoryProps {
  isLoading?: boolean;
  history: PostierObject[];
  onClickElement: (request: PostierObject) => void
}

export default function RequestHistory({ history, onClickElement, isLoading = false }: RequestHistoryProps) {


  const loadingDisplay = () => {
    return (
      <Flex align="center" justify="center" style={{ height: '100%' }}>
        <Text as="p" size="2" color="gray">
          Loading history...
        </Text>
      </Flex>
    );
  }

  const noHistoryDisplay = () => {
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
        <Box
          key={`hist${item.request.id}`}
          p="2"
          style={{
            cursor: 'pointer',
            borderRadius: '6px',
            border: '1px solid var(--gray-6)'
          }}
          onClick={() => onClickElement(item)}
        >
          <Flex gap='2' align="center" mb="1">
            <Text color="gray">{new Date(item.request.timestamp).toLocaleString()}</Text>
            <Separator/>
            <Text color="gray">{Math.round(item.response.time)}ms</Text>
          </Flex>
          <Flex direction='row' align='center' gap='2'>
            <Badge variant="soft">{item.request.method}</Badge>
            <Badge color={getStatusColor(item.response.status) as any}>{item.response.status}</Badge>
            <Text style={{ wordBreak: 'break-all' }}>{item.request.url}</Text>
          </Flex>
        </Box>
      ))}
    </Flex>}
  </ScrollArea>
  );
} 