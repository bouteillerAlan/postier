import {Box, Card, Text} from '@radix-ui/themes';
import {BellIcon} from '@radix-ui/react-icons';
import {Alert} from '../types/types.ts';
import {useEffect, useRef, useState} from 'react';
import {CircularProgress} from "./CircularProgress.tsx";

export default function AlertCard(props: Alert) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [time, setTime] = useState<number>(100);

  // todo: improve the animation of the svg
  useEffect(() => {
    if (time >= 0) {
      setTimeout(() => {
        setTime(time - 12.5); // 12.5 = 100% divided in 8s
        if (cardRef.current && time <= 12.5) cardRef.current.remove();
      }, 1000)
    }
  }, [time]);

  return (
    props.show &&
    <Box ref={cardRef} maxWidth='350px' minWidth='150px' mt='10px'>
      <Card variant='surface' style={{backgroundColor: 'var(--accent-1)'}}>
        <Text as='div' size='2' weight='bold' style={{display: 'flex', justifyContent: 'space-between'}}>
          <span><BellIcon/> {props.title}</span> <CircularProgress value={time} style={{height: 15, color: 'var(--accent-9)'}}/>
        </Text>
        <Text as='div' color='gray' size='2'>
          {props.message}
        </Text>
      </Card>
    </Box>
  )
}