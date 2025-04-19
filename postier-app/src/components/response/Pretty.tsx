import {Card, ScrollArea} from '@radix-ui/themes';
import {PrismTheme, themes} from 'prism-react-renderer';
import HighlightCode from "../codeHighlighting/HighlightCode.tsx";
import {UserSetting} from "../../types/types.ts";

interface PrettyResponseProps {
  data: string;
  viewHeight: number;
  contentType: string;
  codeTheme: PrismTheme | undefined;
  userConfig: UserSetting;
}

export default function PrettyResponse (props: PrettyResponseProps) {
  return (
    <Card style={{padding: 0, height: props.viewHeight}}>
      <ScrollArea style={{padding: 0, backgroundColor: themes[props.userConfig.codeTheme].plain.backgroundColor}}>
        <HighlightCode
          codeTheme={props.codeTheme}
          content={props.data}
          contentType={props.contentType}
          mainDivStyle={{margin: 10, height: props.viewHeight-20}}
        />
      </ScrollArea>
    </Card>
  );
}