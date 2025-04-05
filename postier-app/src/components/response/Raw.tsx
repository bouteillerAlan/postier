import {Card, ScrollArea} from '@radix-ui/themes';

export default function RawResponse (props: {data: string, viewHeight: number}) {
  return (
    <Card style={{padding: 0, height: props.viewHeight}}>
      <ScrollArea style={{position: 'relative'}}>
        <div style={{padding: 10, height: props.viewHeight-20, width: '95vw'}}>
          {props.data}
        </div>
      </ScrollArea>
    </Card>
  );
}