import { ScrollArea, Box, Text, Flex, Badge } from '@radix-ui/themes';
import { RequestHistoryItem } from '../types/types.ts';
import { getStatusColor } from '../services/formatter';

interface RequestHistoryProps {
  history: RequestHistoryItem[] | undefined;
  isLoading?: boolean;
}

export default function RequestHistory({ history, isLoading = false }: RequestHistoryProps) {

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
      {(!isLoading && (history && history.length > 0)) && history.map((item) => (
        <Box
          key={item.id}
          p="2"
          style={{
            cursor: 'pointer',
            borderRadius: '6px',
            border: '1px solid var(--gray-6)'
          }}
          onClick={() => {}}
        >
          <Flex justify="between" align="center" mb="1">
            <Badge variant="soft">{item.method}</Badge>
            <Text size="1" color="gray">
              {new Date(item.timestamp).toLocaleTimeString()}
            </Text>
          </Flex>
          <Text size="2" style={{ wordBreak: 'break-all' }}>
            {item.url}
          </Text>
          {item.response && (
            <Flex mt="1" align="center" gap="2">
              <Badge
                size="1"
                color={getStatusColor(item.response.status) as any} // todo: fix me
              >
                {item.response.status}
              </Badge>
              <Text size="1" color="gray">
                {Math.round(item.response.time)}ms
              </Text>
            </Flex>
          )}
        </Box>
      ))}
    </Flex>}
  </ScrollArea>
  );
} 