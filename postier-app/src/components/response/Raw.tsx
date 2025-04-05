import {Card} from '@radix-ui/themes';

export default function RawResponse (props: {data: string, viewHeight: number}) {
  return (
    <Card style={{padding: 0, height: props.viewHeight}}>
      <div style={{padding: 10, height: props.viewHeight-20, overflow: 'auto'}}>
        {props.data}
      </div>
    </Card>
  );
}