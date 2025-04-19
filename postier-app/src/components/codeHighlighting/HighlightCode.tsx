import React from 'react';
import {Highlight, PrismTheme} from 'prism-react-renderer';

interface HighlightCodeProps {
  content: string;
  contentType: string;
  codeTheme: PrismTheme | undefined;
  mainDivStyle?:  React.CSSProperties | undefined;
}

export default function HighlightCode (props: HighlightCodeProps) {
  return (
    <Highlight
      theme={props.codeTheme}
      code={props.content}
      language={props.contentType}
    >
      {({ style, tokens, getLineProps, getTokenProps }) => (
        <div style={{...style, ...props.mainDivStyle}}>
          {/*<ScrollArea style={{position: 'initial'}}>*/}
            <pre style={{...style, backgroundColor: 'none', margin: 0}}>
              {tokens.map((line, i) => (
                <div key={`codeToken${i}`} {...getLineProps({ line })}>
                  {line.map((token, key) => (
                    <span key={`codeLine${key}`} {...getTokenProps({ token })} />
                  ))}
                </div>
              ))}
            </pre>
          {/*</ScrollArea>*/}
        </div>
      )}
    </Highlight>
  )
}