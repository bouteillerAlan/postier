import {Card, ScrollArea, Text} from '@radix-ui/themes';
import {useEffect, useRef, useState} from 'react';

export default function RawResponse (props: {data: string, viewHeight: number}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardW, setCardW] = useState<number | 'auto'>('auto');

  /**
   * calculate and set the card width into cardW minus some border & padding
   * @return void
   */
  function calculateCardWidth(): void {
    if (cardRef.current) {
      // 35 is all the margin, border and the scrollbar gutter
      setCardW(cardRef.current.clientWidth - 35);
    } else {
      setCardW('auto');
    }
  }

  /**
   * set add / remove EventListener for the card width calculation
   */
  useEffect(() => {
    calculateCardWidth();
    window.addEventListener('resize', calculateCardWidth);
    return () => {
      window.removeEventListener('resize', calculateCardWidth);
    };
  }, []);

  return (
    <Card style={{height: props.viewHeight, padding: 0}} ref={cardRef}>
      <ScrollArea>
        <Text as='p' style={{width: cardW, padding: 12}}>
          {props.data}
        </Text>
      </ScrollArea>
    </Card>
  );
}