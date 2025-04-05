import {Card} from '@radix-ui/themes';
import {Highlight, PrismTheme} from 'prism-react-renderer';

export default function PrettyResponse (props: {data: string, viewHeight: number, contentType: string, codeTheme: PrismTheme | undefined}) {
  return (
    <Card style={{padding: 0, height: props.viewHeight}}>
      <Highlight
        theme={props.codeTheme}
        code={props.data}
        language={props.contentType}
      >
        {({ style, tokens, getLineProps, getTokenProps }) => (
          <div style={{...style, padding: 10, height: props.viewHeight-20, overflow: 'auto'}}>
                    <pre style={{...style, backgroundColor: 'none', margin: 0}}>
                      {tokens.map((line, i) => (
                        <div key={`codeToken${i}`} {...getLineProps({ line })}>
                          {line.map((token, key) => (
                            <span key={`codeLine${key}`} {...getTokenProps({ token })} />
                          ))}
                        </div>
                      ))}
                    </pre>
          </div>
        )}
      </Highlight>
    </Card>
  );
}