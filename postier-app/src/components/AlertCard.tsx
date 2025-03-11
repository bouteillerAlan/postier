import {Box, Card, Text} from '@radix-ui/themes';
import {BellIcon} from '@radix-ui/react-icons';
import {Alert} from '../types/types.ts';

// todo: latter use a stack of alert card
export default function AlertCard(props: Alert) {
  return (
    props.show &&
    <Box maxWidth='350px' minWidth='150px' style={{position: 'absolute', bottom: 10, right: 10}}>
      <Card variant='surface' style={{ backgroundColor: 'var(--accent-1)'}}>
        <Text as='div' size='2' weight='bold'>
          <BellIcon/> {props.title}
        </Text>
        <Text as='div' color='gray' size='2'>
          {props.message}
        </Text>
      </Card>
    </Box>
  )
}