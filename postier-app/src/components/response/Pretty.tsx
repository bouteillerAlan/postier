import {Card} from '@radix-ui/themes';
import {PrismTheme} from 'prism-react-renderer';
import HighlightCode from "../codeHighlighting/HighlightCode.tsx";

export default function PrettyResponse (props: {data: string, viewHeight: number, contentType: string, codeTheme: PrismTheme | undefined}) {
  return (
    <Card style={{padding: 0, height: props.viewHeight}}>
      <HighlightCode
        codeTheme={props.codeTheme}
        content={props.data}
        contentType={props.contentType}
        mainDivStyle={{padding: 10, height: props.viewHeight - 20}}
      />
    </Card>
  );
}