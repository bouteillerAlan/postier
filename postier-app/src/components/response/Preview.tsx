import {Card} from '@radix-ui/themes';

export default function PreviewResponse (props: {data: string, viewHeight: number, contentType: string}) {
  return (
      props.contentType === 'html' ? (
        <iframe srcDoc={props.data} height={props.viewHeight-10} width='100%'/>
      ) : (
        <Card
          style={{
            height: props.viewHeight,
            padding: '16px',
            backgroundColor: 'var(--gray-surface)',
          }}
        >{props.data}</Card>
      )
  );
}